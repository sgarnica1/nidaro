export const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#3B82F6", // blue
  Gustos: "#F59E0B", // orange
  Ahorro: "#22C55E", // green
};

export function getCategoryColor(categoryName: string, fallback: string = "#6B7280"): string {
  return CATEGORY_COLORS[categoryName] || fallback;
}
