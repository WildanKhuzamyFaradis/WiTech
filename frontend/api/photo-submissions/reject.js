import { service, json, readJsonBody } from "./_shared.js"
export default async function handler(req, res) {
  if (req.method !== "POST")
    return json(res, 405, { ok: false, error: "Method not allowed." })
  const { requireAdmin } = await import("./_shared.js")
  if (!(await requireAdmin(req)))
    return json(res, 403, { ok: false, error: "Akses admin diperlukan." })
  if (!service)
    return json(res, 503, {
      ok: false,
      error: "Layanan upload belum tersedia.",
    })
  let body
  try {
    body = readJsonBody(req)
  } catch {
    return json(res, 400, { ok: false, error: "Permintaan JSON tidak valid." })
  }
  const { submissionId } = body
  if (
    typeof submissionId !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(submissionId)
  )
    return json(res, 400, { ok: false, error: "Submission tidak valid." })
  const { data: row } = await service
    .from("member_photo_submissions")
    .select("storage_path")
    .eq("id", submissionId)
    .eq("status", "pending")
    .maybeSingle()
  if (!row)
    return json(res, 404, { ok: false, error: "Submission tidak ditemukan." })
  const { error } = await service
    .from("member_photo_submissions")
    .update({ status: "rejected" })
    .eq("id", submissionId)
    .eq("status", "pending")
  if (error)
    return json(res, 500, {
      ok: false,
      error: "Submission belum dapat ditolak.",
    })
  return json(res, 200, { ok: true })
}
