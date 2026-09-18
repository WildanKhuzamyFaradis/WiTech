import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { signOutAdmin } from "../auth/adminAuth";
import { AdminDataProvider } from "../context/AdminDataContext";
import {
  LayoutDashboard,
  Building2,
  FolderOpen,
  Images,
  CalendarDays,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

const sidebarLinks = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true, color: "#ff5e5b", group: "Navigasi" },
  { label: "Divisi", to: "/admin/divisions", icon: Building2, color: "#6366f1", group: "Konten" },
  { label: "Portofolio", to: "/admin/portfolio", icon: FolderOpen, color: "#8b5cf6", group: "Konten" },
  { label: "Galeri", to: "/admin/gallery", icon: Images, color: "#00cecb", group: "Konten" },
  { label: "Event", to: "/admin/events", icon: CalendarDays, color: "#10b981", group: "Konten" },
  { label: "Member", to: "/admin/members", icon: Users, color: "#f59e0b", group: "Konten" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLogoutError("");
    const { error } = await signOutAdmin();

    if (error) {
      setLogoutError("Gagal keluar. Silakan coba lagi.");
      return;
    }

    navigate("/admin/login", { replace: true });
  };

  const isActive = (link: { to: string; exact?: boolean }) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  };

  const currentPage = sidebarLinks.find((l) => isActive(l))?.label ?? "Admin";

  return (
    <AdminDataProvider>
      <div className="min-h-screen bg-background text-foreground flex font-sans">

      {/* ── Sidebar ───────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r-4 border-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{ boxShadow: "4px 0 0 0 #111" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b-4 border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-primary border-2 border-border flex items-center justify-center neo-shadow">
              <span className="text-white text-sm font-black">W</span>
            </div>
            <div>
              <span className="font-black text-base tracking-tight">
                WI<span className="text-primary">TECH</span>
              </span>
              <p className="text-xs font-bold text-muted-foreground -mt-0.5">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg border-2 border-border bg-muted neo-shadow"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Nav */}
        <div className="px-4 py-5 flex-1 overflow-y-auto space-y-2">
          {sidebarLinks.map((link, i) => {
            const showGroup = i === 0 || link.group !== sidebarLinks[i - 1].group;
            return (
              <div key={link.to}>
                {showGroup && (
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 mt-4 px-2 first:mt-0">
                    {link.group}
                  </p>
                )}
                <Link
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all mb-2 ${
                    isActive(link)
                      ? "border-border neo-shadow -translate-y-0.5 text-foreground"
                      : "border-transparent hover:border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  style={isActive(link) ? { backgroundColor: link.color + "22", borderColor: "#111" } : {}}
                >
                  <div
                    className="size-8 rounded-lg border-2 border-border flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isActive(link) ? link.color : "#fff" }}
                  >
                    <link.icon size={16} className={isActive(link) ? "text-white" : "text-foreground"} strokeWidth={2.5} />
                  </div>
                  {link.label}
                </Link>
              </div>
            );
          })}
        </div>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t-4 border-border space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-xl bg-primary border-2 border-border flex items-center justify-center neo-shadow">
              <span className="text-white text-sm font-black">A</span>
            </div>
            <div>
              <p className="text-sm font-black">Administrator</p>
              <p className="text-xs font-medium text-muted-foreground">admin@witech.id</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 border-border bg-card font-bold text-sm neo-shadow hover:-translate-y-0.5 transition-transform text-destructive"
          >
            <LogOut size={16} strokeWidth={2.5} />
            Keluar
          </button>
          {logoutError && <p className="text-xs font-bold text-destructive">{logoutError}</p>}
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ──────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b-4 border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-30" style={{ boxShadow: "0 4px 0 0 #111" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl border-2 border-border bg-muted neo-shadow hover:-translate-y-0.5 transition-transform"
          >
            <Menu size={18} strokeWidth={2.5} />
          </button>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Admin</p>
            <h1 className="font-black text-lg leading-none">{currentPage}</h1>
          </div>

          <div className="flex-1" />

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-border bg-muted text-sm font-bold neo-shadow hover:-translate-y-0.5 transition-transform"
          >
            <ExternalLink size={14} strokeWidth={2.5} />
            Lihat Website
          </Link>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
    </AdminDataProvider>
  );
}
