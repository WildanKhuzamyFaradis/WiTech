import {
  service,
  BUCKET,
  MAX_BYTES,
  json,
  signature,
  readJsonBody,
} from "./_shared.js"
import sharp from "sharp"

async function restoreUploading(submissionId) {
  await service
    .from("member_photo_submissions")
    .update({ status: "uploading" })
    .eq("id", submissionId)
    .eq("status", "processing")
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return json(res, 405, { ok: false, error: "Method not allowed." })
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
  const { data: existing } = await service
    .from("member_photo_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle()
  if (!existing)
    return json(res, 404, { ok: false, error: "Upload tidak ditemukan." })
  if (existing.status !== "uploading")
    return json(res, 409, {
      ok: false,
      error: "Submission sudah diproses atau tidak dapat diulang.",
    })
  const { data: claimed, error: claimError } = await service
    .from("member_photo_submissions")
    .update({ status: "processing" })
    .eq("id", submissionId)
    .eq("status", "uploading")
    .select("id,storage_path,mime_type")
    .maybeSingle()
  if (claimError)
    return json(res, 503, { ok: false, error: "Foto belum dapat diproses." })
  if (!claimed)
    return json(res, 409, { ok: false, error: "Submission sedang diproses." })
  const rawPath = claimed.storage_path
  if (!rawPath.endsWith(".upload")) {
    await restoreUploading(submissionId)
    return json(res, 400, { ok: false, error: "Path upload tidak valid." })
  }
  const { data: downloaded, error } = await service.storage
    .from(BUCKET)
    .download(rawPath)
  if (error || !downloaded) {
    await restoreUploading(submissionId)
    return json(res, 400, { ok: false, error: "Foto belum selesai diunggah." })
  }
  const buffer = Buffer.from(await downloaded.arrayBuffer())
  const detected = signature(buffer)
  if (
    !detected ||
    buffer.length > MAX_BYTES ||
    detected !== claimed.mime_type
  ) {
    await service.storage.from(BUCKET).remove([rawPath])
    await service
      .from("member_photo_submissions")
      .delete()
      .eq("id", submissionId)
      .eq("status", "processing")
    return json(res, 400, { ok: false, error: "File foto tidak valid." })
  }
  let normalized
  try {
    normalized = await sharp(buffer)
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer()
  } catch {
    await restoreUploading(submissionId)
    return json(res, 400, { ok: false, error: "Foto tidak dapat dibaca." })
  }
  if (normalized.length > MAX_BYTES) {
    await restoreUploading(submissionId)
    return json(res, 400, {
      ok: false,
      error: "Hasil foto melebihi batas ukuran.",
    })
  }
  const finalPath = rawPath.replace(/\.upload$/, ".webp")
  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(finalPath, normalized, { contentType: "image/webp", upsert: false })
  if (uploadError) {
    await restoreUploading(submissionId)
    return json(res, 503, { ok: false, error: "Foto belum dapat diproses." })
  }
  const { data: updated, error: updateError } = await service
    .from("member_photo_submissions")
    .update({
      storage_path: finalPath,
      status: "pending",
      mime_type: "image/webp",
      file_size: normalized.length,
    })
    .eq("id", submissionId)
    .eq("status", "processing")
    .select("id")
    .maybeSingle()
  if (updateError || !updated) {
    await service.storage.from(BUCKET).remove([finalPath])
    await restoreUploading(submissionId)
    return json(res, 503, {
      ok: false,
      error: "Pengiriman belum dapat diselesaikan.",
    })
  }
  await service.storage.from(BUCKET).remove([rawPath])
  return json(res, 200, { ok: true, submissionId })
}
