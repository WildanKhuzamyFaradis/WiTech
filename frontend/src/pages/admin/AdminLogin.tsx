import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { getAdminSession, signInAdmin } from "../../auth/adminAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    getAdminSession()
      .then((session) => {
        if (mounted && session) navigate("/admin", { replace: true });
      })
      .catch(() => {
        // A failed session lookup leaves the login form available.
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await signInAdmin(email.trim(), password);

      if (signInError) {
        setError("Email atau password salah. Silakan coba lagi.");
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      setError("Login tidak tersedia saat ini. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Back button */}
      <div className="p-6 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border-2 border-border rounded-xl font-bold text-sm neo-shadow-sm hover:-translate-y-1 transition-transform"
        >
          <ArrowLeft size={16} strokeWidth={3} />
          Balik ke Website
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-24 relative z-10">
        <div className="w-full max-w-sm anim-fade-up">
          <div className="text-center mb-8">
            <div className="size-20 rounded-3xl bg-foreground flex items-center justify-center mx-auto mb-6 neo-shadow-sm group hover:rotate-3 transition-transform">
              <Shield size={36} className="text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter">
              Admin <span className="gradient-text">Panel</span>
            </h1>
            <p className="text-base font-medium text-muted-foreground">Silakan masuk ke markas Witech.</p>
          </div>

          <div className="neo-card bg-white rounded-3xl p-8 neo-shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@witech.id"
                  className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl text-base font-bold placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 pr-12 bg-muted border-2 border-transparent rounded-xl text-base font-bold placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-primary/10 border-2 border-primary text-sm font-bold text-primary text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white border-2 border-border rounded-2xl font-black text-lg neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? "Masuk..." : "Masuk"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
