import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";

type AppUser = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

async function fetchIsAdmin(userId: string): Promise<boolean> {
  try {
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();
    const { data: userRow } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", userId)
      .single();

    if (!userRow?.role_id) return false;

    const { data: roleRow } = await supabase
      .from("roles")
      .select("name")
      .eq("id", userRow.role_id)
      .single();

    return roleRow?.name === "admin";
  } catch {
    return false;
  }
}

async function upsertUser(user: User): Promise<void> {
  try {
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      full_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        null,
    }, { onConflict: "id" });
  } catch (e) {
    console.error("Failed to upsert user:", e);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function processUser(authUser: User | null, sess: Session | null) {
    if (!authUser) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }
    await upsertUser(authUser);
    const isAdmin = await fetchIsAdmin(authUser.id);
    setUser({
      id: authUser.id,
      email: authUser.email,
      full_name:
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name,
      avatar_url: authUser.user_metadata?.avatar_url,
      isAdmin,
    });
    setSession(sess);
    setLoading(false);
  }

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function init() {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();

      // Handle OAuth hash callback
      const hash = window.location.hash;
      if (hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      const { data: { session: sess } } = await supabase.auth.getSession();
      await processUser(sess?.user ?? null, sess);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
        processUser(s?.user ?? null, s);
      });
      unsubscribe = () => subscription.unsubscribe();
    }

    init().catch(err => {
      console.error("Auth init error:", err);
      setLoading(false);
    });

    return () => { unsubscribe?.(); };
  }, []);

  const signOut = async () => {
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
