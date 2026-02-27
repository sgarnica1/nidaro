"use client";

import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
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
  const [tempSelected, setTempSelected] = useState<string | null>(selectedCategoryId);

  const handleConfirm = () => {
    if (tempSelected) {
      onSelect(tempSelected);
    }
    onOpenChange(false);
  };

  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title="Seleccionar categoría" showDragHandle={true}>
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {categories.map((cat) => {
          const isSelected = tempSelected === cat.id;
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
              <span className={cn("text-sm font-medium", isSelected ? "text-[#1C3D2E]" : "text-[#6B7280]")}>
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
      <div className="sticky bottom-0 bg-white border-t border-[#F3F4F6] px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <Button
          onClick={handleConfirm}
          disabled={!tempSelected}
          className="w-full h-[52px] text-base font-bold rounded-[14px] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white disabled:bg-[#9CA3AF] disabled:opacity-50"
        >
          Confirmar
        </Button>
      </div>
    </ResponsiveSheet>
  );
}
