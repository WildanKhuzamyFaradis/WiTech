import { useState } from "react";
import { Mail, MapPin, Camera, GitFork, Briefcase, MessageCircle, ArrowRight, Send, Clock, Sparkles } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "join",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="public-page bg-background text-foreground font-sans pt-12 pb-24 overflow-hidden min-h-screen">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-20 relative">
        
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted text-xs font-medium normal-case tracking-normal mb-6">
            <Sparkles size={16} className="text-secondary" strokeWidth={2.5} />
            Hubungi kami
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            Mari berbincang.
          </h1>
          <p className="text-xl font-medium text-muted-foreground leading-relaxed max-w-2xl">
            Hubungi kami untuk informasi pendaftaran, kerja sama, atau pertanyaan tentang kegiatan WiTECH.
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
              <p className="text-xs font-medium normal-case tracking-normal text-muted-foreground mb-4">Informasi kontak</p>
              
              <div className="neo-card rounded-md p-6 transition-all bg-white group">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail size={20} className="text-primary" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Email</p>
                    <p className="text-sm font-medium text-muted-foreground">contact@witech.id</p>
                    <p className="text-sm font-medium text-muted-foreground">partnership@witech.id</p>
                  </div>
                </div>
              </div>
              
              <div className="neo-card rounded-md p-6 transition-all bg-white group">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-md bg-secondary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin size={20} className="text-secondary" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Alamat</p>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Gedung Student Center Lt. 3<br />
                      Universitas Teknologi Nasional<br />
                      Jakarta, Indonesia 12640
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-xs font-medium normal-case tracking-normal text-muted-foreground mb-4">Media sosial</p>
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
                    className="neo-card flex items-center gap-4 px-5 py-4 rounded-md group transition-all bg-white"
                  >
                    <div
                      className="size-10 rounded-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${s.color}15` }}
                    >
                      <s.icon size={18} style={{ color: s.color }} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium normal-case tracking-wider text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-medium text-foreground truncate">{s.handle}</p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" strokeWidth={2.5} />
                  </a>
                ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="neo-card bg-muted rounded-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-muted-foreground" strokeWidth={2.5} />
                <p className="text-xs font-medium normal-case tracking-normal text-muted-foreground">Jam operasional</p>
              </div>
              <div className="space-y-3">
                {[
                  { day: "Senin – Jumat", time: "09:00 – 21:00" },
                  { day: "Sabtu", time: "10:00 – 17:00" },
                  { day: "Minggu", time: "Libur" },
                ].map((h) => (
                  <div key={h.day} className="flex justify-between text-sm">
                    <span className="font-medium">{h.day}</span>
                    <span className="font-medium text-muted-foreground font-mono">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Form ───────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="neo-card bg-white rounded-md p-8 md:p-10 sticky top-28">
              {submitted ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="size-24 bg-secondary/10 rounded-full flex items-center justify-center text-4xl mb-6">
                    🎉
                  </div>
                  <h3 className="text-3xl font-semibold mb-3 tracking-tight">Pesan belum dikirim</h3>
                  <p className="font-medium text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Formulir ini masih berupa demo. Pesan belum dikirim atau disimpan. Silakan hubungi kontak yang tercantum.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 px-6 py-3 bg-foreground text-background font-medium rounded-md border border-border transition-transform"
                  >
                    Kembali ke formulir
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 bg-primary/10 rounded-md flex items-center justify-center">
                      <Send size={18} className="text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-xl tracking-tight">Formulir kontak (demo)</h2>
                      <p className="text-xs font-medium text-muted-foreground">Mode demo. Formulir ini belum mengirim atau menyimpan pesan.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium normal-case tracking-wider mb-2 text-muted-foreground">
                        Nama lengkap *
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                        className="w-full px-4 py-3.5 bg-muted border border-transparent rounded-md text-sm font-medium placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium normal-case tracking-wider mb-2 text-muted-foreground">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@university.ac.id"
                        className="w-full px-4 py-3.5 bg-muted border border-transparent rounded-md text-sm font-medium placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-medium normal-case tracking-wider mb-2 text-muted-foreground">
                      Subjek *
                    </label>
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3.5 bg-muted border border-transparent rounded-md text-sm font-medium focus:outline-none focus:border-border transition-colors"
                    >
                      <option value="join">Pendaftaran anggota WiTECH</option>
                      <option value="belajar">Belajar teknologi dasar</option>
                      <option value="partnership">Kerja sama dan kolaborasi</option>
                      <option value="sponsorship">Dukungan sponsor</option>
                      <option value="project">Pertanyaan tentang proyek</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-medium normal-case tracking-wider mb-2 text-muted-foreground">
                      Pesan *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tuliskan pertanyaan atau keperluanmu"
                      className="w-full px-4 py-3.5 bg-muted border border-transparent rounded-md text-sm font-medium placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-white border border-border rounded-md font-semibold text-base transition-all flex items-center justify-center gap-2"
                  >
                    Coba formulir demo <Send size={18} strokeWidth={3} />
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
