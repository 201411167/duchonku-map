import { pgTable, text, varchar, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pins = pgTable("pins", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  lat: numeric("lat").notNull(),
  lng: numeric("lng").notNull(),
  category: varchar("category").notNull().default("general"),
  image_url: varchar("image_url"),
  created_by: uuid("created_by"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertPinSchema = createInsertSchema(pins).omit({
  id: true,
  created_at: true,
  created_by: true,
});

export type InsertPin = z.infer<typeof insertPinSchema>;
export type Pin = typeof pins.$inferSelect;

export type Category = "general" | "food" | "cafe" | "shop" | "landmark";

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: "general", label: "일반", color: "#6B7280" },
  { value: "food", label: "음식", color: "#EF4444" },
  { value: "cafe", label: "카페", color: "#D97706" },
  { value: "shop", label: "쇼핑", color: "#8B5CF6" },
  { value: "landmark", label: "랜드마크", color: "#3B82F6" },
];

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email"),
  full_name: varchar("full_name"),
  role_id: uuid("role_id"),
});

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
});

export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
