import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", to: "/about" },
  { label: "Divisions", to: "/divisions" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Members", to: "/members" },
  { label: "Gallery", to: "/gallery" },
  { label: "Events", to: "/events" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 anim-fade-in ${
        scrolled
          ? "bg-card/80 backdrop-blur-xl border-b-2 border-border shadow-[0_4px_0_0_rgba(0,0,0,0.05)] py-2"
          : "bg-transparent py-4"
      }`}
    >
      <nav className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img src="/logo.png" alt="Witech Logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
        </Link>

        <div className="hidden lg:flex items-center gap-1 bg-card/60 backdrop-blur-md px-2 py-1.5 rounded-full border-2 border-border neo-shadow-sm">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <Link
            to="/admin"
            className="text-sm text-foreground font-bold hover:text-primary transition-colors"
          >
            Admin
          </Link>
          <Link
            to="/contact"
            className="px-6 py-2.5 bg-foreground text-background border-2 border-border rounded-full text-sm font-bold neo-shadow-sm hover:bg-primary hover:text-white transition-all hover:-translate-y-0.5"
          >
            Gabung Yuk!
          </Link>
        </div>

        <button
          className="lg:hidden p-2 rounded-xl bg-card border-2 border-border neo-shadow-sm text-foreground transition-transform hover:-translate-y-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="lg:hidden bg-card border-b-2 border-border anim-slide-down">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t-2 border-border mt-2 flex flex-col gap-3">
              <Link to="/admin" className="px-4 py-3 text-sm text-foreground font-bold rounded-xl hover:bg-muted">
                Admin Dashboard
              </Link>
              <Link
                to="/contact"
                className="px-4 py-3 bg-primary text-white border-2 border-border rounded-xl text-sm font-bold text-center neo-shadow-sm"
              >
                Gabung Yuk!
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
