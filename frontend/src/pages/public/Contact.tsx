import { useState } from "react";
import { Mail, MapPin, Camera, GitFork, Briefcase, MessageCircle, ArrowRight, Send, Sparkles } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "join",
    message: "",
    website: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit", body: JSON.stringify(form) });
      if (!response.ok) throw new Error("send_failed");
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "join", message: "", website: "" });
    } catch {
      setStatus("Pesan belum dapat dikirim. Silakan coba lagi beberapa saat.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-background text-foreground font-sans pt-32 pb-24 overflow-hidden min-h-screen">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-20 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-muted text-xs font-bold uppercase tracking-widest mb-6 neo-shadow-sm">
            <Sparkles size={16} className="text-secondary" strokeWidth={2.5} />
            Hubungi Kami
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
            Yuk Ngobrol! <span>👋</span>
          </h1>
          <p className="text-xl font-medium text-muted-foreground leading-relaxed max-w-2xl">
            Mau bergabung dengan WiTech, berkolaborasi dalam proyek, atau sekadar menanyakan hal terkait teknologi? Kami selalu terbuka untuk berdiskusi.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* ── LEFT: Contact Info ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Contact Cards */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Info Kontak</p>
              
              <div className="neo-card rounded-2xl p-6 neo-shadow-sm hover:neo-shadow-md hover:-translate-y-1 transition-all bg-white group">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail size={20} className="text-primary" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-black text-foreground mb-1">Email</p>
                    <p className="text-sm font-medium text-muted-foreground">contact@witech.id</p>
                    <p className="text-sm font-medium text-muted-foreground">partnership@witech.id</p>
                  </div>
                </div>
              </div>
              
              <a
                href="https://www.google.com/search?sca_esv=c2f28d3b49117e12&sxsrf=APpeQnvKwELWn4Nvks5F8yeunTiOSu5twg:1789860472011&q=wiraraja+alamat&ludocid=413712058463513967&sa=X&sqi=2&ved=2ahUKEwjpwIbt5fuWAxUDimMGHf7HACcQ6BN6BAglEAI"
                target="_blank"
                rel="noopener noreferrer"
                className="neo-card rounded-2xl p-6 neo-shadow-sm hover:neo-shadow-md hover:-translate-y-1 transition-all bg-white group block"
              >
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin size={20} className="text-secondary" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-black text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      Alamat
                      <span className="text-xs font-normal text-muted-foreground underline">(Buka Peta)</span>
                    </p>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Universitas Wiraraja<br />
                      Jl. Raya Pamekasan - Sumenep No.KM. 05, Panitian Utara, Patean, Kec. Batuan, Kabupaten Sumenep, Jawa Timur 69451
                    </p>
                  </div>
                </div>
              </a>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Sosial Media</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Instagram", handle: "@witech.unija", icon: Camera, href: "https://www.instagram.com/witech.unija/", color: "var(--color-primary)" },
                  { label: "GitHub", handle: "github.com/witech", icon: GitFork, href: "https://github.com", color: "var(--color-foreground)" },
                  { label: "LinkedIn", handle: "linkedin.com/company/witech", icon: Briefcase, href: "https://linkedin.com", color: "var(--color-secondary)" },
                  { label: "Twitter", handle: "@witech_id", icon: MessageCircle, href: "https://twitter.com", color: "var(--color-accent)" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neo-card flex items-center gap-4 px-5 py-4 rounded-2xl neo-shadow-sm group hover:neo-shadow-md hover:-translate-y-1 transition-all bg-white"
                  >
                    <div
                      className="size-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${s.color}15` }}
                    >
                      <s.icon size={18} style={{ color: s.color }} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-bold text-foreground truncate">{s.handle}</p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" strokeWidth={2.5} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Form ───────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="neo-card bg-white rounded-3xl p-8 md:p-10 neo-shadow-md sticky top-28">
              {submitted ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="size-24 bg-secondary/10 rounded-full flex items-center justify-center text-4xl mb-6">
                    🎉
                  </div>
                  <h3 className="text-3xl font-black mb-3 tracking-tight">Pesan Belum Dikirim</h3>
                  <p className="font-medium text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Form ini masih berupa demo. Pesan belum dikirim atau disimpan. Silakan hubungi kontak yang tercantum.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 px-6 py-3 bg-foreground text-background font-bold rounded-xl border-2 border-border neo-shadow-sm hover:-translate-y-1 transition-transform"
                  >
                    Kembali ke Form
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Send size={18} className="text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="font-black text-xl tracking-tight">Kirim Pesan</h2>
                      <p className="text-xs font-medium text-muted-foreground">Kami akan membalas melalui email yang kamu berikan.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                        Nama Lengkap *
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Nama kamu"
                        className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl text-sm font-bold placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@university.ac.id"
                        className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl text-sm font-bold placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                      Subjek *
                    </label>
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl text-sm font-bold focus:outline-none focus:border-border transition-colors"
                    >
                      <option value="join">Mau gabung Witech</option>
                      <option value="belajar">Mau belajar teknologi dasar</option>
                      <option value="partnership">Kerja sama / Kolaborasi</option>
                      <option value="sponsorship">Sponsorship</option>
                      <option value="project">Tanya soal proyek</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input id="website" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} tabIndex={-1} autoComplete="off" />
                  </div>
                  {status && <p role="alert" className="text-sm font-bold text-red-600">{status}</p>}

                  <div>
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                      Pesan *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Ceritain sedikit tentang kamu dan apa yang kamu cari..."
                      className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl text-sm font-bold placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    aria-busy={sending}
                    className="w-full py-4 bg-primary text-white border-2 border-border rounded-2xl font-black text-base neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {sending ? "Mengirim..." : "Kirim Pesan"} <Send size={18} strokeWidth={3} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
