import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    throw new Error("Supabase not initialized. Call initSupabase first.");
  }
  return supabaseInstance;
}

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  supabaseInstance = createClient(url, anonKey);
  return supabaseInstance;
}

export type SupabaseAuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
};
