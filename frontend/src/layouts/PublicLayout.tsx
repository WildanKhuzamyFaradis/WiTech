import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";
import { PublicDataProvider } from "../context/PublicDataContext";
import WiTechAssistant from "../components/public/assistant/WiTechAssistant";

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
    <PublicDataProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WiTechAssistant />
      </div>
    </PublicDataProvider>
  );
}
