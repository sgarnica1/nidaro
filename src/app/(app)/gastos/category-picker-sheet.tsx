"use client";

import { useState, useMemo } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Search } from "lucide-react";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

function getCategoryIcon(category: ExpenseCategoryWithRelations): string {
  const IconMap: Record<string, string> = {
    Supermercado: "🛒",
    Salidas: "🍽️",
    Hogar: "🏠",
    Transporte: "🚗",
    Salud: "🏥",
    Ropa: "👕",
    Entretenimiento: "🎬",
    Educación: "📚",
  };
  return IconMap[category.name] || "💰";
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ExpenseCategoryWithRelations[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
};

export function CategoryPickerSheet({ open, onOpenChange, categories, selectedCategoryId, onSelect }: Props) {
  const [tempSelected, setTempSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleConfirm = () => {
    if (tempSelected) {
      onSelect(tempSelected);
    }
    setTempSelected(null);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTempSelected(null);
      setSearchQuery("");
    }
    onOpenChange(newOpen);
  };

  const sortedCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));
    if (!searchQuery.trim()) return sorted;
    const query = searchQuery.toLowerCase();
    return sorted.filter((cat) => cat.name.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  const currentSelected = tempSelected ?? selectedCategoryId;

  return (
    <ResponsiveSheet open={open} onOpenChange={handleOpenChange} title="Seleccionar categoría" showDragHandle={true}>
      <div className="px-4 pb-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <Input
            type="text"
            placeholder="Buscar categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-[#E5E7EB] focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sortedCategories.map((cat) => {
            const isSelected = currentSelected === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setTempSelected(cat.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                  isSelected
                    ? "border-[#1C3D2E] bg-[#1C3D2E]/12"
                    : "border-[#F3F4F6] bg-white"
                )}
              >
                <div
                  className="w-12 h-12 rounded-full mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <span className="text-2xl">{getCategoryIcon(cat)}</span>
                </div>
                <span className={cn("text-sm font-medium text-center line-clamp-2", isSelected ? "text-[#1C3D2E]" : "text-[#6B7280]")}>
                  {cat.name}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1C3D2E] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {sortedCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[15px] text-[#6B7280]">No se encontraron categorías</p>
          </div>
        )}
      </div>
      <div className="sticky bottom-0 bg-white border-t border-[#F3F4F6] px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <Button
          onClick={handleConfirm}
          disabled={!currentSelected}
          className="w-full h-[52px] text-base font-bold rounded-[14px] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white disabled:bg-[#9CA3AF] disabled:opacity-50"
        >
          Confirmar
        </Button>
      </div>
    </ResponsiveSheet>
  );
}
