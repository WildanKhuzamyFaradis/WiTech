/**
 * Server-side Scope Gate for WiTECH Assistant AI endpoint.
 *
 * Checks queries independently of frontend before Copilot is reached:
 * 1. Malicious / Prompt Injections -> "out_of_scope"
 * 2. Unrelated General Topics (Naruto, politics, homework, etc.) -> "out_of_scope"
 * 3. Queries better served deterministically (e.g. direct FAQ, plain contact, plain divisions) -> "deterministic_preferred"
 * 4. Legitimate WiTECH reasoning queries (recommendations, comparisons, synthesis) -> "needs_ai"
 */

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s/+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Prompt injection, jailbreak, credential extraction.
 */
function isMalicious(text) {
  const norm = text.toLowerCase();
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
    /malware/i,
    /reverse shell/i,
    /exploit/i,
  ];
  return patterns.some((p) => p.test(norm));
}

/**
 * General non-WiTECH topics.
 */
function isGeneralOutOfScope(text) {
  const norm = text.toLowerCase();

  // Homework, code generation, essays
  if (
    /buatkan kode|tuliskan kode|bikin kodingan|buatkan script|bikin program|kerjain tugas|tugas matematika|bikin essay|buat essay|buat minecraft|minecraft plugin|buatkan malware/i.test(
      norm
    )
  ) {
    return true;
  }

  // World trivia / entertainment / general news
  if (
    /presiden indonesia|siapa presiden|ceritain naruto|naruto|resep makanan|cuaca hari ini|ibu kota|cerita dongeng|harga crypto|lirik lagu/i.test(
      norm
    )
  ) {
    return true;
  }

  // General coding tutorials unrelated to WiTECH structure
  if (/jelaskan javascript|apa itu c\+\+|belajar python dari nol/i.test(norm)) {
    return true;
  }

  return false;
}

/**
 * Check if the query is a simple static question that is preferred to be handled deterministically.
 */
function isDeterministicPreferred(text) {
  const norm = normalize(text);

  // Exact greetings / thanks
  if (/^(halo|hai|hi|hey|p|terima kasih|makasih|thanks|thank you)$/i.test(norm)) {
    return true;
  }

  // Pure FAQ / contact / registration keywords with no reasoning or preference keywords
  const hasReasoning = /cocok|saran|rekomendasi|bingung|pilih|bagus|mana|bedanya|bandingkan|bandingin/i.test(norm);
  if (!hasReasoning) {
    if (
      /^(kontak|alamat|email|instagram|sosmed|hubungi)$/i.test(norm) ||
      /^(cara gabung|daftar|pendaftaran|oprec)$/i.test(norm) ||
      /^(faq|tanya jawab)$/i.test(norm) ||
      /^(divisi|list divisi|daftar divisi)$/i.test(norm) ||
      /^(project|projek|portofolio)$/i.test(norm)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates the query for AI scope.
 * Returns: { allowed: boolean, reason?: "out_of_scope" | "deterministic_preferred" }
 */
export function evaluateScope(rawMessage) {
  const trimmed = typeof rawMessage === "string" ? rawMessage.trim() : "";
  if (!trimmed) {
    return { allowed: false, reason: "out_of_scope" };
  }

  if (isMalicious(trimmed) || isGeneralOutOfScope(trimmed)) {
    return { allowed: false, reason: "out_of_scope" };
  }

  if (isDeterministicPreferred(trimmed)) {
    return { allowed: false, reason: "deterministic_preferred" };
  }

  // Also support typos like "devisi" or casual interest queries
  const norm = normalize(trimmed);
  const isReasoning =
    /cocok|rekomendasi|saran|pilih|bingung|mana|terbaik|paling keren|bandingkan|bandingin/i.test(norm);
  const isWiTechContext =
    /witech|divisi|devisi|bidang|minat|suka|desain|koding|coding|web|mobile|ai|iot|robotik|cyber|creative|connect|lab|academy|research|project|karya/i.test(norm);

  if (isReasoning || isWiTechContext) {
    return { allowed: true };
  }

  // Fallback: if not even remotely related to WiTECH or reasoning, reject
  return { allowed: false, reason: "out_of_scope" };
}
