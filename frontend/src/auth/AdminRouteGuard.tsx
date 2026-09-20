import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import type { Session } from "@supabase/supabase-js";
import { getAdminSession, subscribeToAdminAuthState } from "./adminAuth";
import { supabase } from "../lib/supabaseClient";

export default function AdminRouteGuard() {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    const { data } = subscribeToAdminAuthState((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) { setAuthorized(false); setLoading(false); }
    });

    getAdminSession()
      .then(async (currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        if (currentSession) {
          const { data: membership, error } = await supabase.from("admin_users").select("user_id").eq("user_id", currentSession.user.id).maybeSingle();
          if (!error) setAuthorized(Boolean(membership));
        }
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-bold">
        Memeriksa sesi...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!authorized) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-6"><div className="max-w-sm text-center"><h1 className="text-2xl font-black mb-2">Akun tidak memiliki akses administrator.</h1><p className="text-muted-foreground mb-6">Gunakan akun administrator WiTECH untuk membuka panel ini.</p><button onClick={() => supabase.auth.signOut()} className="px-5 py-3 bg-primary text-white border-2 border-border rounded-lg font-bold">Keluar</button></div></div>;
  }

  return <Outlet />;
}
