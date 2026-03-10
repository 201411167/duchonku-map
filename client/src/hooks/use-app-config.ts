import { useQuery } from "@tanstack/react-query";
import { initSupabase } from "@/lib/supabase";

type AppConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  naverMapsClientId: string;
};

let supabaseInitialized = false;

export function useAppConfig() {
  const { data: config, isLoading, isSuccess, error } = useQuery<AppConfig>({
    queryKey: ["/api/config"],
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
    queryFn: async () => {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to load config");
      const data: AppConfig = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        initSupabase(data.supabaseUrl, data.supabaseAnonKey);
        supabaseInitialized = true;
      }
      return data;
    },
  });

  const isReady = isSuccess && supabaseInitialized && !!config?.naverMapsClientId;

  return { config, isLoading, error, isReady };
}
