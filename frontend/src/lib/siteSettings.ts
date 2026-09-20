import { supabase } from "./supabaseClient";
import { deleteMediaFiles, isManagedStoragePath } from "./storage";
import type { MutationResult } from "./dataContract";

const LOGO_KEY = "logo_url";
const DEFAULT_LOGO_URL = "/logo.png";

export function getDefaultLogoUrl(): string {
  return DEFAULT_LOGO_URL;
}

export async function fetchLogoUrl(): Promise<string> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", LOGO_KEY)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat pengaturan logo: ${error.message}`);
  return typeof data?.value === "string" && data.value.trim() ? data.value.trim() : DEFAULT_LOGO_URL;
}

export async function saveLogoUrl(value: string): Promise<MutationResult> {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: "Logo wajib diisi dengan URL atau path." };

  const { error } = await supabase.from("site_settings").upsert(
    { key: LOGO_KEY, value: trimmed, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  if (error) return { ok: false, error: "Gagal menyimpan pengaturan logo." };
  return { ok: true };
}

export async function deleteStoredLogo(value: string): Promise<void> {
  if (isManagedStoragePath(value)) await deleteMediaFiles([value]);
}
