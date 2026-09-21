import { service, BUCKET, json, requireAdmin } from "./_shared.js";
export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { ok: false, error: "Method not allowed." });
  if (!service) return json(res, 503, { ok: false, error: "Layanan upload belum tersedia." });
  if (!(await requireAdmin(req))) return json(res, 403, { ok: false, error: "Akses admin diperlukan." });
  const { data, error } = await service.from("member_photo_submissions").select("id,name,division_id,linkedin_url,github_url,storage_path,created_at,divisions(name)").eq("status", "pending").order("created_at", { ascending: false }).limit(50);
  if (error) return json(res, 500, { ok: false, error: "Data upload belum dapat dimuat." });
  const rows = await Promise.all((data || []).map(async (row) => { const { data: signed } = await service.storage.from(BUCKET).createSignedUrl(row.storage_path, 600); return { ...row, division_name: row.divisions?.name || "", divisions: undefined, preview_url: signed?.signedUrl || "" }; }));
  return json(res, 200, { ok: true, submissions: rows });
}
