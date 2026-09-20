import type { StoreData } from "../dataContract.ts";
import { formatEventDate, formatEventTime, todayInJakarta } from "../dataContract.ts";
import type { AssistantAction, AssistantResponse } from "./types";
import type { Division, Project, Event, FAQ, Member } from "../types";

export const DEFAULT_QUICK_ACTIONS: AssistantAction[] = [
  { label: "Divisi", payload: "divisi" },
  { label: "Project", payload: "project" },
  { label: "Event", payload: "event" },
  { label: "Cara Gabung", payload: "cara gabung" },
  { label: "FAQ", payload: "faq" },
  { label: "Kontak", payload: "kontak" },
  { label: "Anggota", payload: "anggota" },
];

/**
 * Normalizes input text: converts to lowercase, removes excessive spaces and edge punctuation.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s/+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks for prompt injections, system extraction, or malicious inputs.
 */
function isMaliciousOrJailbreak(text: string): boolean {
  const normalized = text.toLowerCase();
  const patterns = [
    /ignore (all |semua )?(instruction|instruksi|rule|aturan)/i,
    /system prompt/i,
    /database admin/i,
    /password (supabase|admin|db)/i,
    /tampilkan env/i,
    /<script/i,
    /drop table/i,
    /select \* from/i,
    /kasih database/i,
    /bypass /i,
  ];
  return patterns.some((p) => p.test(normalized));
}

/**
 * Checks for obvious non-WiTECH general topics (homework, world trivia, entertainment, etc.)
 */
function isOutOfScope(text: string): boolean {
  const normalized = text.toLowerCase();

  // Homework & coding generation requests
  if (
    /buatkan kode|tuliskan kode|bikin kodingan|buatkan script|bikin program|kerjain tugas|tugas matematika|bikin essay|buat essay|buat minecraft|minecraft plugin/i.test(
      normalized
    )
  ) {
    return true;
  }

  // General world trivia / non-WiTECH knowledge
  if (
    /presiden indonesia|siapa presiden|ceritain naruto|resep makanan|cuaca hari ini|ibu kota|cerita dongeng|harga crypto/i.test(
      normalized
    )
  ) {
    return true;
  }

  // General coding tutorials unrelated to WiTECH structure
  if (/jelaskan javascript|apa itu c\+\+|belajar python dari nol/i.test(normalized)) {
    return true;
  }

  return false;
}

/**
 * Checks if query needs AI reasoning / personal recommendation.
 */
function isComplexNeedsAi(text: string): boolean {
  const normalized = text.toLowerCase();

  // Recommendations / interest matching
  const hasRecommendationKeywords = /cocok|rekomendasi|saran|pilih mana|bingung mau|rekomendasikan/i.test(
    normalized
  );
  const hasInterestKeywords = /suka|minat|desain|coding|koding|divisi mana|devisi mana|pilih/i.test(normalized);

  if (hasRecommendationKeywords && hasInterestKeywords) {
    return true;
  }

  // Multi-division comparison
  if (/bandingin|bandingkan|pilih yang terbaik buat/i.test(normalized)) {
    return true;
  }

  return false;
}

/**
 * Find matching division from query.
 */
function findMentionedDivision(
  normalized: string,
  divisions: Division[]
): Division | null {
  for (const div of divisions) {
    const nameLower = div.name.toLowerCase();
    const shortLower = div.shortName.toLowerCase();

    // Direct match with shortName or name
    if (normalized.includes(shortLower) || normalized.includes(nameLower)) {
      return div;
    }

    // Common abbreviations / aliases
    if (shortLower === "ai" && /\b(ai|artificial intelligence|machine learning|ml)\b/i.test(normalized)) {
      return div;
    }
    if (shortLower === "web" && /\b(web|website|frontend|backend)\b/i.test(normalized)) {
      return div;
    }
    if (shortLower === "mobile" && /\b(mobile|android|ios|flutter)\b/i.test(normalized)) {
      return div;
    }
    if (shortLower === "cyber" && /\b(cyber|security|keamanan|cyber security)\b/i.test(normalized)) {
      return div;
    }
    if (
      (shortLower === "ui/ux" || shortLower === "ui ux") &&
      /\b(ui\/ux|ui ux|ui|ux|desain ui|design)\b/i.test(normalized)
    ) {
      return div;
    }
  }
  return null;
}

/**
 * Finds the best matching FAQ by token similarity.
 */
function findMatchingFaq(normalizedQuery: string, faqs: FAQ[]): FAQ | null {
  const stopWords = new Set([
    "apakah",
    "apa",
    "gimana",
    "bagaimana",
    "ada",
    "di",
    "ke",
    "dan",
    "yang",
    "untuk",
    "nih",
    "dong",
    "sih",
    "ya",
    "kah",
    "bisa",
    "gak",
    "ga",
    "ngga",
    "tidak",
    "aku",
    "gw",
    "saya",
    "harus",
    "boleh",
    "syarat",
  ]);

  const queryTokens = normalizedQuery
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));

  if (queryTokens.length === 0) return null;

  let bestFaq: FAQ | null = null;
  let maxScore = 0;

  for (const faq of faqs) {
    const qNorm = normalizeText(faq.question);
    let matchCount = 0;

    for (const token of queryTokens) {
      if (qNorm.includes(token)) {
        matchCount++;
      }
    }

    // Specific high-intent checks
    if (normalizedQuery.includes("pemula") && qNorm.includes("pemula")) {
      matchCount += 3;
    }
    if (
      (normalizedQuery.includes("laptop") || normalizedQuery.includes("spek")) &&
      (qNorm.includes("laptop") || qNorm.includes("spek"))
    ) {
      matchCount += 3;
    }
    if (
      (normalizedQuery.includes("biaya") || normalizedQuery.includes("bayar") || normalizedQuery.includes("gratis")) &&
      (qNorm.includes("biaya") || qNorm.includes("bayar") || qNorm.includes("gratis"))
    ) {
      matchCount += 3;
    }

    if (matchCount > maxScore && matchCount >= 1) {
      maxScore = matchCount;
      bestFaq = faq;
    }
  }

  // Require meaningful score
  return maxScore >= 1 ? bestFaq : null;
}

/**
 * Main deterministic engine entry point.
 */
export function getDeterministicAssistantResponse(
  rawInput: string,
  data: StoreData | null
): AssistantResponse {
  const trimmed = rawInput.trim();
  const normalized = normalizeText(trimmed);

  // 1. Data loading guard
  if (!data) {
    return {
      type: "direct",
      text: "Data WiTECH sedang dimuat dari server, mohon tunggu beberapa saat ya...",
      actions: DEFAULT_QUICK_ACTIONS.slice(0, 4),
    };
  }

  // 2. Malicious or Prompt Injection Guard
  if (isMaliciousOrJailbreak(trimmed)) {
    return {
      type: "out_of_scope",
      text: "Aku fokus membantu informasi seputar WiTECH, seperti divisi, anggota, project, event, pendaftaran, dan kegiatan organisasi.",
      actions: DEFAULT_QUICK_ACTIONS,
    };
  }

  // 3. Out of scope Guard
  if (isOutOfScope(trimmed)) {
    return {
      type: "out_of_scope",
      text: "Aku fokus membantu informasi seputar WiTECH, seperti divisi, anggota, project, event, pendaftaran, dan kegiatan organisasi.",
      actions: DEFAULT_QUICK_ACTIONS,
    };
  }

  // 4. Ambiguous / Complex / Needs AI
  if (isComplexNeedsAi(trimmed)) {
    return {
      type: "needs_ai",
      text: "Pertanyaan itu butuh rekomendasi yang lebih kontekstual. Fitur rekomendasi pintar WiTECH Assistant akan tersedia di tahap berikutnya. Untuk sekarang, aku bisa bantu menampilkan daftar divisi dan fokusnya.",
      actions: [
        { label: "Lihat Divisi", payload: "divisi" },
        { label: "Hubungi WiTECH", payload: "kontak" },
      ],
    };
  }

  // 5. Politeness / Greetings
  if (/^(halo|hai|hi|hey|hei|p|halo witech|selamat pagi|selamat siang|selamat sore|selamat malam)$/i.test(normalized)) {
    return {
      type: "direct",
      text: "Halo! 👋 Aku WiTECH Assistant. Mau cari informasi apa tentang WiTECH? Kamu bisa pilih menu cepat di bawah atau langsung ketik pertanyaanmu.",
      actions: DEFAULT_QUICK_ACTIONS,
    };
  }

  if (/^(terima kasih|makasih|thanks|thank you|tq|thx)$/i.test(normalized)) {
    return {
      type: "direct",
      text: "Sama-sama! Senang bisa membantu. Jika ada hal lain seputar WiTECH yang ingin kamu tanyakan, silakan beri tahu ya! 😊",
      actions: DEFAULT_QUICK_ACTIONS,
    };
  }

  // 5.5 Website Creator Intent
  // Matches: siapa yang bikin/buat/coding/develop website/web ini, siapa pembuat/developer/kreator website, etc.
  if (
    /(siapa|yang).*(bikin|buat|coding|koding|develop|bangun|ngembangin|garap|ngoding|ngebuat|ngerjain|kerjain|rancang|desain).*(web|website|situs|site)/i.test(normalized) ||
    /(pembuat|developer|kreator|creator|pengembang|programmer|coder).*(web|website|situs|site)/i.test(normalized) ||
    /(web|website|situs|site).*(buatan|dibuat|dibikin|dikembangkan|dikoding|dibangun|dirancang).*(siapa)/i.test(normalized) ||
    /(web|website|situs|site).*(siapa).*(buat|bikin|coding|koding|develop|bangun|garap)/i.test(normalized) ||
    /siapa (developer|pembuat|pengembang|programmer|coder)(nya)?$/i.test(normalized) ||
    /^(lihat )?profil wildan$/i.test(normalized)
  ) {
    const wildan = data.members.find((m) => /wildan/i.test(m.name));
    let profileUrl = "https://github.com/WildanKhuzamyFaradis";

    if (wildan) {
      if (wildan.github) {
        profileUrl = wildan.github.startsWith("http")
          ? wildan.github
          : `https://github.com/${wildan.github}`;
      } else if (wildan.linkedin) {
        profileUrl = wildan.linkedin.startsWith("http")
          ? wildan.linkedin
          : `https://www.linkedin.com/in/${wildan.linkedin}`;
      }
    }

    const actions: AssistantAction[] = [
      { label: "Lihat Profil Wildan", payload: profileUrl },
      { label: "Divisi Lab", payload: "divisi lab" },
      { label: "Hubungi WiTECH", payload: "kontak" },
    ];

    return {
      type: "direct",
      text: "Website WiTECH ini dikembangkan oleh Wildan, Ketua WiTECH Lab 2026.\nKalau mau lihat karya atau profil lainnya, kamu bisa cek profil Wildan.",
      actions,
    };
  }

  const mentionedDivision = findMentionedDivision(normalized, data.divisions);

  // 6. Specific Division details (e.g. "divisi web itu apa", "web ngapain", "jelasin divisi ai")
  const asksAboutDivision =
    /divisi|belajar apa|ngapain|fokus|teknologi|tools|itu apa/i.test(normalized);

  if (mentionedDivision && (asksAboutDivision || normalized === mentionedDivision.shortName.toLowerCase() || normalized === `divisi ${mentionedDivision.shortName.toLowerCase()}`)) {
    const techList =
      mentionedDivision.technologies && mentionedDivision.technologies.length > 0
        ? `\n\n🛠️ Teknologi/Fokus: ${mentionedDivision.technologies.join(", ")}`
        : "";

    const memberInfo =
      mentionedDivision.memberCount && mentionedDivision.memberCount > 0
        ? `\n👥 Anggota Aktif: ${mentionedDivision.memberCount} orang`
        : "";

    return {
      type: "direct",
      text: `📌 Divisi ${mentionedDivision.name} (${mentionedDivision.shortName})\n\n${mentionedDivision.description}${techList}${memberInfo}`,
      items: { divisions: [mentionedDivision] },
      actions: [
        { label: `Project ${mentionedDivision.shortName}`, payload: `project ${mentionedDivision.shortName}` },
        { label: `Anggota ${mentionedDivision.shortName}`, payload: `anggota ${mentionedDivision.shortName}` },
        { label: "Divisi Lainnya", payload: "divisi" },
      ],
    };
  }

  // 7. All Divisions Listing
  const isSubjectiveDivisionQuery =
    /paling (bagus|baik|keren|seru|cocok|populer|favorit)|terbaik|terfavorit/i.test(normalized);

  if (
    !isSubjectiveDivisionQuery &&
    (normalized === "divisi" ||
    normalized === "list divisi" ||
    normalized === "daftar divisi" ||
    normalized === "divisinya apa aja" ||
    normalized === "ada divisi apa aja" ||
    normalized === "divisinya ada apaan aja" ||
    normalized === "bagian witech ada apa" ||
    normalized === "jelasin divisi witech" ||
    (/divisi|bidang/i.test(normalized) && /apa|list|daftar|ada|semua|macam/i.test(normalized)))
  ) {
    if (data.divisions.length === 0) {
      return {
        type: "direct",
        text: "Saat ini data divisi belum tersedia.",
        actions: DEFAULT_QUICK_ACTIONS,
      };
    }

    const divisionSummary = data.divisions
      .map((d) => `• ${d.name} (${d.shortName}): ${d.description}`)
      .join("\n\n");

    return {
      type: "direct",
      text: `WiTECH saat ini memiliki ${data.divisions.length} divisi aktif:\n\n${divisionSummary}\n\nKetik nama divisi untuk info lengkap atau pilih aksi di bawah.`,
      items: { divisions: data.divisions },
      actions: data.divisions.map((d) => ({
        label: d.shortName,
        payload: `divisi ${d.shortName}`,
      })),
    };
  }

  // 8. Projects / Portofolio
  const isProjectQuery =
    /project|projek|portofolio|portfolio|karya/i.test(normalized);

  if (isProjectQuery) {
    // Subjective project queries → needs_ai
    if (/paling (bagus|baik|keren|seru|favorit)|terbaik|terfavorit|terkeren/i.test(normalized)) {
      return {
        type: "needs_ai",
        text: "Pertanyaan itu butuh penilaian kontekstual. Fitur rekomendasi pintar WiTECH Assistant akan tersedia di tahap berikutnya. Untuk sekarang, aku bisa bantu menampilkan daftar proyek yang ada.",
        actions: [{ label: "Lihat Semua Project", payload: "project" }],
      };
    }

    const publishedProjects = data.projects.filter((p) => p.status === "published");

    // Filter by division if mentioned
    if (mentionedDivision) {
      const filtered = publishedProjects.filter(
        (p) => p.divisionId === mentionedDivision.id
      );

      if (filtered.length === 0) {
        return {
          type: "direct",
          text: `Belum ada portofolio proyek yang dipublikasikan untuk divisi ${mentionedDivision.name}.`,
          actions: [
            { label: "Semua Project", payload: "project" },
            { label: `Info Divisi ${mentionedDivision.shortName}`, payload: `divisi ${mentionedDivision.shortName}` },
          ],
        };
      }

      const sample = filtered.slice(0, 3);
      const projectList = sample
        .map(
          (p) =>
            `• ${p.title} (${p.year})\n  ${p.subtitle || p.description.slice(0, 80) + "..."}\n  Tags: ${p.tags.join(", ")}`
        )
        .join("\n\n");

      return {
        type: "direct",
        text: `Proyek dari divisi ${mentionedDivision.name}:\n\n${projectList}`,
        items: { projects: sample },
        actions: [
          { label: "Semua Project", payload: "project" },
          { label: "Divisi Lainnya", payload: "divisi" },
        ],
      };
    }

    // Extract extra keyword beyond the project intent words
    const projectIntentWords = /\b(project|projek|portofolio|portfolio|karya|witech|ada|apa|aja|saja|terbaru|terkini|semua|list|daftar|ga|gak|tidak|yang)\b/gi;
    const extraKeywords = normalized
      .replace(projectIntentWords, "")
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 1);

    // If extra keywords exist, try to match against project fields
    if (extraKeywords.length > 0) {
      const keywordFiltered = publishedProjects.filter((p) => {
        const searchable = [
          p.title, p.subtitle, p.description, ...p.tags,
        ].join(" ").toLowerCase();
        return extraKeywords.some((kw) => searchable.includes(kw));
      });

      if (keywordFiltered.length === 0) {
        return {
          type: "not_found",
          text: `Tidak ditemukan proyek yang cocok dengan "${extraKeywords.join(" ")}". Kamu bisa melihat semua proyek atau cari berdasarkan divisi.`,
          actions: [
            { label: "Semua Project", payload: "project" },
            { label: "Divisi", payload: "divisi" },
          ],
        };
      }

      const sample = keywordFiltered.slice(0, 3);
      const projectList = sample
        .map(
          (p) =>
            `• ${p.title} (${p.year})\n  ${p.subtitle || p.description.slice(0, 80) + "..."}`
        )
        .join("\n\n");

      return {
        type: "direct",
        text: `Proyek yang cocok:\n\n${projectList}`,
        items: { projects: sample },
        actions: [
          { label: "Semua Project", payload: "project" },
          { label: "Divisi", payload: "divisi" },
        ],
      };
    }

    // General project query (no extra filter keyword)
    if (publishedProjects.length === 0) {
      return {
        type: "direct",
        text: "Saat ini belum ada proyek yang dipublikasikan.",
        actions: DEFAULT_QUICK_ACTIONS,
      };
    }

    const sample = publishedProjects.slice(0, 3);
    const projectList = sample
      .map(
        (p) =>
          `• ${p.title} (${p.year})\n  ${p.subtitle || p.description.slice(0, 80) + "..."}`
      )
      .join("\n\n");

    return {
      type: "direct",
      text: `Berikut beberapa proyek karya anggota WiTECH:\n\n${projectList}\n\nKamu juga bisa melihat karya divisi tertentu, misalnya "project web" atau "project mobile".`,
      items: { projects: sample },
      actions: [
        { label: "Project Web", payload: "project web" },
        { label: "Project Mobile", payload: "project mobile" },
        { label: "Project AI", payload: "project ai" },
      ],
    };
  }

  // 9. Events & Kegiatan
  const isEventQuery =
    /event|kegiatan|acara|workshop|seminar|bootcamp|jadwal/i.test(normalized);

  if (isEventQuery) {
    // Extract extra keywords beyond common event intent/time words
    const eventIntentWords =
      /\b(event|events|kegiatan|acara|workshop|seminar|bootcamp|jadwal|witech|terdekat|berikutnya|mendatang|terkini|ada|ga|gak|nih|dong|kapan|hari ini|besok|tahun ini|tahun depan|tahun|depan|bulan|minggu|apa|aja|saja|daftar|list)\b/gi;
    const extraKeywords = normalized
      .replace(eventIntentWords, "")
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 1);

    // If extra search term is supplied, search real event fields
    if (extraKeywords.length > 0) {
      const keywordFiltered = data.events.filter((e) => {
        const searchable = [
          e.title,
          e.type,
          e.description,
          e.location,
        ]
          .join(" ")
          .toLowerCase();
        return extraKeywords.some((kw) => searchable.includes(kw));
      });

      if (keywordFiltered.length === 0) {
        return {
          type: "not_found",
          text: `Tidak ditemukan kegiatan atau event yang cocok dengan "${extraKeywords.join(" ")}". Kamu bisa melihat jadwal kegiatan terdekat atau pantau media sosial kami.`,
          actions: [
            { label: "Semua Event", payload: "event" },
            { label: "Kontak", payload: "kontak" },
          ],
        };
      }

      const sample = keywordFiltered.slice(0, 3);
      const eventList = sample
        .map((e) => {
          const regStatus = e.registrationOpen
            ? "✅ Pendaftaran Dibuka"
            : "⏳ Pendaftaran Ditutup";
          return `• ${e.title}\n  📅 ${formatEventDate(e.date)} (${formatEventTime(e)})\n  📍 ${e.location}\n  ${regStatus}`;
        })
        .join("\n\n");

      return {
        type: "direct",
        text: `Kegiatan yang cocok:\n\n${eventList}`,
        items: { events: sample },
        actions: [
          { label: "Semua Event", payload: "event" },
          { label: "Kontak", payload: "kontak" },
        ],
      };
    }

    const today = todayInJakarta();

    // Filter upcoming events (date >= today)
    const upcomingEvents = data.events
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (upcomingEvents.length === 0) {
      return {
        type: "direct",
        text: "Saat ini belum ada jadwal event atau kegiatan mendatang yang dipublikasikan. Pantau terus linimasa kami atau media sosial resmi WiTECH untuk update kegiatan terbaru!",
        actions: [
          { label: "FAQ", payload: "faq" },
          { label: "Kontak", payload: "kontak" },
        ],
      };
    }

    const eventList = upcomingEvents
      .slice(0, 3)
      .map((e) => {
        const regStatus = e.registrationOpen
          ? "✅ Pendaftaran Dibuka"
          : "⏳ Pendaftaran Ditutup";
        return `• ${e.title}\n  📅 ${formatEventDate(e.date)} (${formatEventTime(e)})\n  📍 ${e.location}\n  ${regStatus}`;
      })
      .join("\n\n");

    return {
      type: "direct",
      text: `Berikut jadwal kegiatan WiTECH terdekat:\n\n${eventList}`,
      items: { events: upcomingEvents.slice(0, 3) },
      actions: [
        { label: "Cara Gabung", payload: "cara gabung" },
        { label: "Kontak", payload: "kontak" },
      ],
    };
  }

  // 10. Cara Gabung / Pendaftaran
  const isJoinQuery =
    /gabung|daftar|pendaftaran|oprec|open recruitment|registrasi|join/i.test(
      normalized
    );

  if (isJoinQuery) {
    // Check if any FAQ explicitly answers registration
    const joinFaq = data.faqs.find((f) =>
      /daftar|gabung|oprec|rekrutmen/i.test(f.question)
    );

    if (joinFaq) {
      return {
        type: "direct",
        text: `📌 Informasi Pendaftaran WiTECH:\n\n${joinFaq.answer}\n\nUntuk pengumuman batch terbaru, pastikan memantau media sosial kami atau hubungi kami melalui halaman Kontak.`,
        items: { faqs: [joinFaq] },
        actions: [
          { label: "FAQ Lainnya", payload: "faq" },
          { label: "Kontak Resmi", payload: "kontak" },
        ],
      };
    }

    return {
      type: "direct",
      text: "Informasi jadwal pendaftaran atau open recruitment WiTECH saat ini belum tersedia secara resmi di website. Kamu bisa mengecek halaman Tanya Jawab (FAQ) atau langsung menghubungi kami melalui kontak resmi untuk informasi rekrutmen terbaru.",
      actions: [
        { label: "Lihat FAQ", payload: "faq" },
        { label: "Hubungi Kontak", payload: "kontak" },
      ],
    };
  }

  // 11. FAQ matching
  const matchingFaq = findMatchingFaq(normalized, data.faqs);
  if (matchingFaq) {
    return {
      type: "direct",
      text: `❓ ${matchingFaq.question}\n\n💡 ${matchingFaq.answer}`,
      items: { faqs: [matchingFaq] },
      actions: [
        { label: "FAQ Lainnya", payload: "faq" },
        { label: "Cara Gabung", payload: "cara gabung" },
      ],
    };
  }

  // General FAQ listing
  if (
    normalized === "faq" ||
    normalized === "tanya jawab" ||
    normalized === "pertanyaan umum" ||
    /faq|tanya jawab|pertanyaan umum/i.test(normalized)
  ) {
    if (data.faqs.length === 0) {
      return {
        type: "direct",
        text: "Saat ini daftar FAQ belum tersedia.",
        actions: DEFAULT_QUICK_ACTIONS,
      };
    }

    const sampleFaqs = data.faqs.slice(0, 3);
    const faqList = sampleFaqs
      .map((f) => `❓ ${f.question}\n💡 ${f.answer}`)
      .join("\n\n");

    return {
      type: "direct",
      text: `Berikut beberapa pertanyaan umum seputar WiTECH:\n\n${faqList}`,
      items: { faqs: sampleFaqs },
      actions: [
        { label: "Cara Gabung", payload: "cara gabung" },
        { label: "Divisi", payload: "divisi" },
        { label: "Kontak", payload: "kontak" },
      ],
    };
  }

  // 12. Contact / Hubungi Kami
  const isContactQuery =
    /kontak|hubungi|contact|email|instagram|sosmed|social media|alamat|lokasi sekretariat|dm/i.test(
      normalized
    );
  // Exclude common Indonesian phrases that contain "kontak" / "alamat" but are not WiTECH contact requests
  const isContactFalsePositive =
    /kontak (mata|lensa|fisik|senjata)|alamat (ip|palsu|mac)/i.test(normalized);

  if (isContactQuery && !isContactFalsePositive) {
    return {
      type: "direct",
      text: `Kamu dapat menghubungi WiTECH melalui kanal resmi berikut:\n\n• ✉️ Email: contact@witech.id\n• 🤝 Partnership: partnership@witech.id\n• 📸 Instagram: @witech.unija (https://www.instagram.com/witech.unija/)\n• 📍 Alamat: Universitas Wiraraja, Jl. Raya Pamekasan - Sumenep No.KM. 05, Panitian Utara, Patean, Kec. Batuan, Kabupaten Sumenep, Jawa Timur 69451 (Peta: https://www.google.com/search?sca_esv=c2f28d3b49117e12&sxsrf=APpeQnvKwELWn4Nvks5F8yeunTiOSu5twg:1789860472011&q=wiraraja+alamat&ludocid=413712058463513967&sa=X&sqi=2&ved=2ahUKEwjpwIbt5fuWAxUDimMGHf7HACcQ6BN6BAglEAI)`,
      actions: [
        { label: "Divisi", payload: "divisi" },
        { label: "FAQ", payload: "faq" },
      ],
    };
  }

  // 13. Members / Pengurus / Struktur
  const isMemberQuery =
    /anggota|member|ketua|pengurus|struktur|lead|bendahara|sekretaris/i.test(
      normalized
    );
  // Exclude common Indonesian phrases where "anggota" means something else
  const isMemberFalsePositive =
    /anggota (badan|tubuh|gerak|dpr|dprd|keluarga)/i.test(normalized);

  if (isMemberQuery && !isMemberFalsePositive) {
    const activeMembers = data.members.filter((m) => m.active);

    // If a division is specified
    if (mentionedDivision) {
      const divisionMembers = activeMembers.filter(
        (m) => m.divisionId === mentionedDivision.id
      );

      if (divisionMembers.length === 0) {
        return {
          type: "direct",
          text: `Belum ada data anggota aktif yang terdaftar untuk divisi ${mentionedDivision.name}.`,
          actions: [
            { label: "Semua Divisi", payload: "divisi" },
            { label: "Kontak", payload: "kontak" },
          ],
        };
      }

      const memberList = divisionMembers
        .slice(0, 5)
        .map((m) => `• ${m.name} — ${m.role}`)
        .join("\n");

      return {
        type: "direct",
        text: `Anggota aktif di divisi ${mentionedDivision.name} (${divisionMembers.length} orang):\n\n${memberList}`,
        items: { members: divisionMembers },
        actions: [
          { label: `Project ${mentionedDivision.shortName}`, payload: `project ${mentionedDivision.shortName}` },
          { label: "Divisi Lainnya", payload: "divisi" },
        ],
      };
    }

    // If asking about ketua / leadership
    if (/ketua|pimpinan|presiden|lead/i.test(normalized)) {
      const leads = activeMembers.filter((m) =>
        /ketua/i.test(m.role)
      );

      if (leads.length > 0) {
        const leadList = leads.map((m) => `• ${m.name} (${m.role})`).join("\n");
        return {
          type: "direct",
          text: `Pimpinan di kepengurusan WiTECH:\n\n${leadList}`,
          items: { members: leads },
          actions: [
            { label: "Divisi", payload: "divisi" },
            { label: "Kontak", payload: "kontak" },
          ],
        };
      }

      return {
        type: "direct",
        text: "Informasi spesifik untuk ketua/pimpinan belum tercantum pada daftar anggota publik saat ini.",
        actions: [
          { label: "Lihat Divisi", payload: "divisi" },
          { label: "Hubungi Kontak", payload: "kontak" },
        ],
      };
    }

    // If asking about specific roles like bendahara / sekretaris
    if (/bendahara|sekretaris/i.test(normalized)) {
      const matched = activeMembers.filter((m) =>
        /bendahara|sekretaris/i.test(m.role)
      );

      if (matched.length > 0) {
        const list = matched.map((m) => `• ${m.name} (${m.role})`).join("\n");
        return {
          type: "direct",
          text: `Pengurus WiTECH:\n\n${list}`,
          items: { members: matched },
          actions: DEFAULT_QUICK_ACTIONS.slice(0, 4),
        };
      }

      return {
        type: "direct",
        text: "Informasi untuk posisi tersebut belum tersedia pada data publik saat ini.",
        actions: [
          { label: "Divisi", payload: "divisi" },
          { label: "Kontak", payload: "kontak" },
        ],
      };
    }

    // General members query
    return {
      type: "direct",
      text: `WiTECH memiliki ${activeMembers.length} anggota aktif yang terdaftar di berbagai divisi. Kamu bisa melihat daftar anggota berdasarkan divisi dengan mengetik misalnya "anggota web" atau "anggota mobile".`,
      items: { members: activeMembers.slice(0, 4) },
      actions: [
        { label: "Anggota Web", payload: "anggota web" },
        { label: "Anggota Mobile", payload: "anggota mobile" },
        { label: "Divisi", payload: "divisi" },
      ],
    };
  }

  // 14. Fallback / Not Found
  return {
    type: "not_found",
    text: "Maaf, aku belum menemukan informasi yang cocok untuk pertanyaan tersebut. Kamu bisa memilih topik di bawah ini atau menanyakan hal seputar divisi, project, event, cara gabung, atau kontak WiTECH:",
    actions: DEFAULT_QUICK_ACTIONS,
  };
}
