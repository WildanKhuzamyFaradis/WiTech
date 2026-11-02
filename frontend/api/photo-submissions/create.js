import {
  service,
  BUCKET,
  TYPES,
  json,
  slug,
  id,
  validHttpsUrl,
  readJsonBody,
  consumeSubmissionRate,
  configMissing,
  missingConfigLabels,
  logSafeError,
} from "./_shared.js"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return json(res, 405, { ok: false, error: "Method not allowed." })
  }
  if (configMissing() || !service) {
    console.error(
      "[photo-submissions/create] Server configuration incomplete",
      missingConfigLabels(),
    )
    return json(res, 500, {
      ok: false,
      reason: "server_config",
      error: "Server configuration is incomplete.",
    })
  }
  let body
  try {
    body = readJsonBody(req)
  } catch {
    return json(res, 400, {
      ok: false,
      reason: "invalid_request",
      error: "Permintaan JSON tidak valid.",
    })
  }
  if (body.website) return json(res, 200, { ok: true, ignored: true })
  try {
    const rate = await consumeSubmissionRate(req)
    if (rate.unavailable)
      return json(res, 503, {
        ok: false,
        reason: "rate_limit_failed",
        error: "Layanan upload belum tersedia.",
      })
    if (!rate.allowed)
      return json(res, 429, {
        ok: false,
        reason: "rate_limited",
        error: "Terlalu banyak pengiriman. Coba lagi nanti.",
      })
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const type =
      typeof body.mimeType === "string" ? body.mimeType.toLowerCase() : ""
    const size = Number(body.fileSize)
    const original =
      typeof body.originalFilename === "string"
        ? body.originalFilename.trim().slice(0, 255)
        : ""
    if (
      name.length < 2 ||
      name.length > 100 ||
      !TYPES.has(type) ||
      !Number.isInteger(size) ||
      size <= 0 ||
      size > 5 * 1024 * 1024 ||
      !original
    )
      return json(res, 400, {
        ok: false,
        reason: "invalid_request",
        error: "Data foto tidak valid.",
      })
    const linkedin = body.linkedin
      ? validHttpsUrl(String(body.linkedin).trim(), "linkedin.com")
      : null
    const github = body.github
      ? validHttpsUrl(String(body.github).trim(), "github.com")
      : null
    if ((body.linkedin && !linkedin) || (body.github && !github))
      return json(res, 400, {
        ok: false,
        reason: "invalid_request",
        error: "URL profil harus menggunakan HTTPS dan domain yang sesuai.",
      })
    const divisionId = String(body.divisionId || "")
    const isCore = divisionId === "core"
    const { data: division, error: divisionError } = isCore
      ? { data: null, error: null }
      : await service
          .from("divisions")
          .select("id")
          .eq("id", divisionId)
          .maybeSingle()
    if (divisionError) {
      logSafeError("create", divisionError)
      return json(res, 500, {
        ok: false,
        reason: "database_error",
        error: "Data upload belum dapat dibuat.",
      })
    }
    if (!isCore && !division)
      return json(res, 400, {
        ok: false,
        reason: "invalid_request",
        error: "Divisi tidak valid.",
      })
    const submissionId = id()
    const path = `pending/${slug(name)}--${submissionId}.upload`
    const { error: insertError } = await service
      .from("member_photo_submissions")
      .insert({
        id: submissionId,
        name,
        division_id: isCore ? null : division.id,
        linkedin_url: linkedin,
        github_url: github,
        storage_path: path,
        original_filename: original,
        mime_type: type,
        file_size: size,
        status: "uploading",
      })
    if (insertError) {
      logSafeError("create", insertError)
      return json(res, 500, {
        ok: false,
        reason: "database_error",
        error: "Pengiriman belum dapat dimulai.",
      })
    }
    const { data: signed, error: signedError } = await service.storage
      .from(BUCKET)
      .createSignedUploadUrl(path)
    if (signedError || !signed?.token) {
      if (signedError) logSafeError("create-storage", signedError)
      await service
        .from("member_photo_submissions")
        .delete()
        .eq("id", submissionId)
        .eq("status", "uploading")
      return json(res, 503, {
        ok: false,
        reason: "storage_error",
        error: "Upload foto belum tersedia.",
      })
    }
    return json(res, 200, { ok: true, submissionId, path, token: signed.token })
  } catch (error) {
    logSafeError("create", error)
    return json(res, 500, {
      ok: false,
      reason: "server_error",
      error: "Pengiriman belum dapat diproses.",
    })
  }
}
