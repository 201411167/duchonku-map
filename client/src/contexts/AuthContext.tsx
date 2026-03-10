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
    await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          null,
      },
      { onConflict: "id" }
    );
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

    // Set session immediately so header can start resolving
    setSession(sess);

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
    setLoading(false);
  }

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function init() {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();

      const hasOAuthHash = window.location.hash.includes("access_token");

      // Subscribe to auth changes BEFORE reading the session, so we don't
      // miss the SIGNED_IN event fired right after an OAuth redirect
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, s) => {
          processUser(s?.user ?? null, s);
          // Clean up the URL hash after Supabase has processed it
          if (hasOAuthHash && window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      );
      unsubscribe = () => subscription.unsubscribe();

      // Also read the current session in case the user was already logged in
      const { data: { session: sess } } = await supabase.auth.getSession();
      if (sess) {
        await processUser(sess.user, sess);
      } else {
        setLoading(false);
      }

      // Clean up hash if still present (e.g. session already existed)
      if (hasOAuthHash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    init().catch(err => {
      console.error("Auth init error:", err);
      setLoading(false);
    });

    return () => { unsubscribe?.(); };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
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
