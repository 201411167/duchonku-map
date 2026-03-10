import { CATEGORIES, type Category } from "@shared/schema";

export function getCategoryColor(category: string): string {
  return CATEGORIES.find(c => c.value === category)?.color ?? "#6B7280";
}

export function createMarkerIcon(category: string, selected = false): google.maps.Symbol {
  const color = getCategoryColor(category);
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: selected ? "#fff" : "rgba(255,255,255,0.8)",
    strokeWeight: selected ? 3 : 2,
    scale: selected ? 12 : 9,
  };
}
