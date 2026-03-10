import { CATEGORIES } from "@shared/schema";

export function getCategoryColor(category: string): string {
  return CATEGORIES.find(c => c.value === category)?.color ?? "#6B7280";
}
