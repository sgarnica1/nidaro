"use client";

import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { BudgetSubcategory } from "@/generated/prisma/client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategories: BudgetSubcategory[];
  selectedSubcategoryId: string | null;
  onSelect: (subcategoryId: string) => void;
};

export function SubcategoryPickerSheet({ open, onOpenChange, subcategories, selectedSubcategoryId, onSelect }: Props) {
  const [tempSelected, setTempSelected] = useState<string | null>(selectedSubcategoryId);

  const handleConfirm = () => {
    if (tempSelected) {
      onSelect(tempSelected);
    }
    onOpenChange(false);
  };

  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title="Seleccionar subcategoría" showDragHandle={true}>
      <div className="px-4 pb-4 space-y-2">
        {subcategories.map((sub) => {
          const isSelected = tempSelected === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setTempSelected(sub.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                isSelected
                  ? "border-[#1C3D2E] bg-[#1C3D2E]/12"
                  : "border-[#F3F4F6] bg-white"
              )}
            >
              <span className={cn("text-[15px] font-medium", isSelected ? "text-[#1C3D2E]" : "text-[#111111]")}>
                {sub.name}
              </span>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-[#1C3D2E] flex items-center justify-center">
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
