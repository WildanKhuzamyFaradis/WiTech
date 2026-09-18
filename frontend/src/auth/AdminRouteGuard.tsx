import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import type { Session } from "@supabase/supabase-js";
import { getAdminSession, subscribeToAdminAuthState } from "./adminAuth";

export default function AdminRouteGuard() {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const { data } = subscribeToAdminAuthState((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    getAdminSession()
      .then((currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
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

  return <Outlet />;
}