import { service, BUCKET, json, readJsonBody, requireAdmin } from "./_shared.js";

async function restorePending(submissionId) {
  await service.from("member_photo_submissions").update({ status: "pending" }).eq("id", submissionId).eq("status", "processing");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed." });
  if (!(await requireAdmin(req))) return json(res, 403, { ok: false, error: "Akses admin diperlukan." });
  if (!service) return json(res, 503, { ok: false, error: "Layanan upload belum tersedia." });
  let body; try { body = readJsonBody(req); } catch { return json(res, 400, { ok: false, error: "Permintaan JSON tidak valid." }); }
  const { submissionId, memberId } = body;
  if (typeof submissionId !== "string" || !/^[a-f0-9-]{36}$/i.test(submissionId) || typeof memberId !== "string" || !/^[^/\\\\]{1,128}$/.test(memberId)) return json(res, 400, { ok: false, error: "Data submission tidak valid." });
  const { data: claimed, error: claimError } = await service.from("member_photo_submissions").update({ status: "processing" }).eq("id", submissionId).eq("status", "pending").select("*").maybeSingle();
  if (claimError) return json(res, 503, { ok: false, error: "Submission belum dapat diproses." });
  if (!claimed) return json(res, 409, { ok: false, error: "Submission sudah diproses atau tidak tersedia." });
  const { data: member } = await service.from("members").select("id,avatar").eq("id", memberId).maybeSingle();
  if (!member) { await restorePending(submissionId); return json(res, 404, { ok: false, error: "Member tidak ditemukan." }); }
  const approvedPath = `members/${memberId}-${submissionId}.webp`;
  const { data: file, error: downloadError } = await service.storage.from(BUCKET).download(claimed.storage_path);
  if (downloadError || !file) { await restorePending(submissionId); return json(res, 400, { ok: false, error: "Foto submission tidak tersedia." }); }
  const buffer = Buffer.from(await file.arrayBuffer());
  let uploadedHere = false;
  if (member.avatar !== approvedPath) {
    const { error: uploadError } = await service.storage.from("witech-media").upload(approvedPath, buffer, { contentType: "image/webp", upsert: false });
    if (uploadError) { const { data: existingApproved } = await service.storage.from("witech-media").download(approvedPath); if (!existingApproved) { await restorePending(submissionId); return json(res, 503, { ok: false, error: "Foto belum dapat dipublikasikan." }); } } else uploadedHere = true;
    const { data: changedMember, error: memberError } = await service.from("members").update({ avatar: approvedPath }).eq("id", memberId).select("id").maybeSingle();
    if (memberError || !changedMember) { if (uploadedHere) await service.storage.from("witech-media").remove([approvedPath]); await restorePending(submissionId); return json(res, 500, { ok: false, error: "Member belum dapat diperbarui." }); }
  }
  const { data: used, error: usedError } = await service.from("member_photo_submissions").update({ status: "used", used_by_member_id: memberId, used_at: new Date().toISOString() }).eq("id", submissionId).eq("status", "processing").select("id").maybeSingle();
  if (usedError || !used) {
    if (member.avatar !== approvedPath) await service.from("members").update({ avatar: member.avatar || "" }).eq("id", memberId).eq("avatar", approvedPath);
    if (uploadedHere) await service.storage.from("witech-media").remove([approvedPath]);
    await restorePending(submissionId);
    return json(res, 503, { ok: false, error: "Status submission belum dapat diperbarui. Coba lagi." });
  }
  await service.storage.from(BUCKET).remove([claimed.storage_path]);
  return json(res, 200, { ok: true, avatar: approvedPath });
}

