import { consumeRateLimit } from "./_rateLimit.js"

const MAX_BODY_BYTES = 16 * 1024
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const json = (response, status, body) => response.status(status).json(body)
const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST")
    return json(response, 405, { error: "Method not allowed" })
  }
  let body
  try {
    const raw =
      typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body ?? {})
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES)
      return json(response, 413, { error: "Payload terlalu besar." })
    body =
      typeof request.body === "string"
        ? JSON.parse(request.body)
        : (request.body ?? {})
  } catch {
    return json(response, 400, { error: "Permintaan JSON tidak valid." })
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return json(response, 400, { error: "Data formulir tidak valid." })
  if (body.website) return json(response, 200, { success: true })
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const subject = typeof body.subject === "string" ? body.subject.trim() : ""
  const message = typeof body.message === "string" ? body.message.trim() : ""
  if (
    name.length < 2 ||
    name.length > 100 ||
    email.length < 1 ||
    email.length > 254 ||
    !EMAIL_PATTERN.test(email) ||
    subject.length < 2 ||
    subject.length > 150 ||
    message.length < 1 ||
    message.length > 5000
  )
    return json(response, 400, { error: "Data formulir tidak valid." })
  const rate = await consumeRateLimit(request, "contact", 5, 3600)
  if (rate.unavailable)
    return json(response, 503, { error: "Layanan kontak belum tersedia." })
  if (!rate.allowed)
    return json(response, 429, {
      error: "Terlalu banyak pesan. Coba lagi nanti.",
    })
  const apiKey = process.env.CONTACT_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  const to = process.env.CONTACT_TO_EMAIL
  if (!apiKey || !from || !to) {
    console.error("[contact] Email configuration incomplete", {
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(from),
      hasTo: Boolean(to),
    })
    return json(response, 500, { error: "Email service is not configured" })
  }
  const safeName = escapeHtml(name),
    safeEmail = escapeHtml(email),
    safeSubject = escapeHtml(subject),
    safeMessage = escapeHtml(message).replace(/\n/g, "<br>")
  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `<p><strong>FROM:</strong> ${safeName}</p><p><strong>EMAIL:</strong> ${safeEmail}</p><p><strong>SUBJECT:</strong> ${safeSubject}</p><p><strong>MESSAGE:</strong><br>${safeMessage}</p>`,
      }),
    })
    if (!resendResponse.ok) {
      console.error("[contact] Provider rejected request", {
        status: resendResponse.status,
      })
      return json(response, 502, { error: "Unable to send email" })
    }
    return json(response, 200, { success: true })
  } catch (error) {
    console.error("[contact] Handler failed", {
      name: error?.name,
      message: error?.message,
    })
    return json(response, 502, { error: "Unable to reach email service" })
  }
}
