import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/config", (_req, res) => {
    res.json({
      supabaseUrl: process.env.VITE_SUPABASE_URL || "https://jhuvztomhjeebqygxddq.supabase.co",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    });
  });

  return httpServer;
}
