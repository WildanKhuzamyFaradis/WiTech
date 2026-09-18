import "../public.css";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";

// Auto scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function PublicLayout() {
  return (
    <div className="public-site min-h-screen bg-background text-foreground flex flex-col">
      <ScrollToTop />
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
