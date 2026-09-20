/**
 * Server-side public Supabase client and data layer for WiTECH Assistant.
 *
 * Rules:
 * 1. Read-only access using public anon/publishable key only.
 * 2. Defense-in-depth filters: status = published (projects), active = true (members).
 * 3. Minimal selection of fields needed by the assistant.
 * 4. In-memory caching (~45 seconds) to avoid hammering Supabase on repeated requests.
 */

const CACHE_TTL_MS = 45 * 1000;

let cache = {
  divisions: null,
  projects: null,
  members: null,
  faqs: null,
  timestamp: 0,
};

import fs from "node:fs";
import path from "node:path";

function loadLocalEnvIfPresent() {
  // In production, the service must use standard server environment variables (e.g. from container or host env).
  // frontend/.env.local fallback is strictly for local development ease.
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const envPaths = [
    path.resolve(process.cwd(), "frontend/.env.local"),
    path.resolve(process.cwd(), "../frontend/.env.local"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const [key, ...valParts] = trimmed.split("=");
          if (key && valParts.length > 0) {
            const cleanKey = key.trim();
            const cleanVal = valParts.join("=").trim().replace(/^["']|["']$/g, "");
            if (!process.env[cleanKey]) {
              process.env[cleanKey] = cleanVal;
            }
          }
        }
        break;
      } catch {
        // best-effort
      }
    }
  }
}

// Load local fallback for development
loadLocalEnvIfPresent();

function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase public URL or anon/publishable key is missing.");
  }

  return { url, anonKey };
}

async function fetchFromSupabase(table, queryParams = "") {
  const { url, anonKey } = getSupabaseConfig();
  const endpoint = `${url}/rest/v1/${table}${queryParams ? `?${queryParams}` : ""}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Supabase query failed for ${table}: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Loads and caches public WiTECH entities.
 */
export async function getPublicWiTechData() {
  const now = Date.now();
  if (cache.divisions && now - cache.timestamp < CACHE_TTL_MS) {
    return cache;
  }

  try {
    const [divisions, projects, members, faqs] = await Promise.all([
      // divisions: id, name, short_name, description, technologies
      fetchFromSupabase(
        "divisions",
        "select=id,name,short_name,description,technologies&order=sort_order.asc"
      ),
      // projects: status=eq.published, only title, subtitle, description, tags, year, division_id
      fetchFromSupabase(
        "projects",
        "status=eq.published&select=id,title,subtitle,description,tags,year,division_id&order=sort_order.asc"
      ),
      // members: active=eq.true, only id, name, role, division_id, github, linkedin
      fetchFromSupabase(
        "members",
        "active=eq.true&select=id,name,role,division_id,github,linkedin&order=sort_order.asc"
      ),
      // faqs: id, question, answer
      fetchFromSupabase(
        "faqs",
        "select=id,question,answer&order=sort_order.asc"
      ),
    ]);

    cache = {
      divisions: (divisions || []).map((d) => ({
        id: d.id,
        name: d.name,
        shortName: d.short_name,
        description: d.description,
        technologies: Array.isArray(d.technologies) ? d.technologies : [],
      })),
      projects: (projects || []).map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        tags: Array.isArray(p.tags) ? p.tags : [],
        year: p.year,
        divisionId: p.division_id,
      })),
      members: (members || []).map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        divisionId: m.division_id,
        github: m.github || "",
        linkedin: m.linkedin || "",
      })),
      faqs: (faqs || []).map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      })),
      timestamp: now,
    };

    return cache;
  } catch (err) {
    // If cache has stale data, use it as fallback
    if (cache.divisions) {
      console.warn("[PublicData] Error refreshing Supabase data, using cached data:", err.message);
      return cache;
    }
    throw err;
  }
}

/**
 * Builds compact, relevant context based on user query intent.
 * Minimal context only — do not send the whole database to Copilot.
 */
export function buildMinimalContext(message, data) {
  const norm = message.toLowerCase();

  const isDivisionQuestion = /cocok|rekomendasi|saran|pilih|minat|divisi|devisi|bidang|belajar apa/i.test(norm);
  const isProjectQuestion = /project|projek|portofolio|karya|terbaik|keren/i.test(norm);
  const isMemberQuestion = /wildan|anggota|member|ketua|lead/i.test(norm);
  const isFaqQuestion = /laptop|spek|biaya|bayar|pemula/i.test(norm);

  let context = "INFORMASI RESMI UKM WITECH (UNIVERSITAS WIRARAJA):\n";

  // Divisions are essential for recommendation/comparison
  if (data.divisions?.length) {
    context += "\nDAFTAR DIVISI:\n" + data.divisions.map((d) =>
      `• ${d.name} (${d.shortName}): ${d.description}. Fokus teknologi: ${(d.technologies || []).join(", ")}`
    ).join("\n");
  }

  // Include only relevant published projects if query asks about projects
  if (isProjectQuestion && data.projects?.length) {
    context += "\n\nCONTOH KARYA / PROYEK TERPILIH:\n" + data.projects.slice(0, 4).map((p) =>
      `• ${p.title} (${p.year}): ${p.subtitle || p.description}. Tags: ${(p.tags || []).join(", ")}`
    ).join("\n");
  }

  // Include active members only if specifically asked about members or leadership
  if (isMemberQuestion && data.members?.length) {
    const keyMembers = data.members.filter((m) =>
      /ketua|lead/i.test(m.role) || /wildan/i.test(m.name)
    );
    if (keyMembers.length) {
      context += "\n\nPENGURUS / ANGGOTA:\n" + keyMembers.map((m) =>
        `• ${m.name} (${m.role})`
      ).join("\n");
    }
  }

  // Include relevant FAQ snippet if matching keywords found
  if (isFaqQuestion && data.faqs?.length) {
    const matchedFaqs = data.faqs.filter((f) =>
      (norm.includes("laptop") && /laptop/i.test(f.question)) ||
      (norm.includes("biaya") && /biaya/i.test(f.question)) ||
      (norm.includes("pemula") && /pemula/i.test(f.question))
    );
    if (matchedFaqs.length) {
      context += "\n\nINFORMASI TAMBAHAN:\n" + matchedFaqs.map((f) =>
        `• Q: ${f.question}\n  A: ${f.answer}`
      ).join("\n");
    }
  }

  return context;
}
