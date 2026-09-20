/**
 * PublicDataContext.tsx
 * Provides Supabase-backed public data to all public pages.
 *
 * ARCHITECTURE BOUNDARY:
 * - Public pages use usePublicData() from this context.
 * - Admin pages use useAdminData() from the Supabase-backed admin context.
 * - This provider is mounted ONLY inside PublicLayout, so admin routes are
 *   completely unaffected.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { StoreData } from "../lib/dataContract";
import { fetchPublicData } from "../lib/publicData";

interface PublicDataState {
  data: StoreData | null;
  logoUrl: string;
  loading: boolean;
  error: string | null;
}

const PublicDataContext = createContext<PublicDataState | null>(null);

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PublicDataState>({
    data: null,
    logoUrl: "/logo.png",
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, logoUrl: "/logo.png", loading: true, error: null });

    fetchPublicData()
      .then((result) => {
        if (!cancelled) setState({ data: result.data, logoUrl: result.logoUrl, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error("Failed to load public Supabase data:", err);
          const msg =
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan saat memuat data.";
          setState({ data: null, logoUrl: "/logo.png", loading: false, error: msg });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.type = "image/png";
    icon.href = state.logoUrl;
  }, [state.logoUrl]);

  return (
    <PublicDataContext.Provider value={state}>
      {children}
    </PublicDataContext.Provider>
  );
}

/** Use inside any public page component to access Supabase-backed data. */
export function usePublicData(): PublicDataState {
  const ctx = useContext(PublicDataContext);
  if (!ctx) {
    throw new Error("usePublicData must be used within PublicDataProvider");
  }
  return ctx;
}
