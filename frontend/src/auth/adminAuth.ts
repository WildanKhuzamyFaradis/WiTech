import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

import { supabase } from "../lib/supabaseClient"

export async function signInAdmin(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOutAdmin() {
  return supabase.auth.signOut()
}

export async function getAdminSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export function subscribeToAdminAuthState(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange(callback)
}
