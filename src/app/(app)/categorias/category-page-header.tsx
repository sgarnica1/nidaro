"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "./category-form";
import type { BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";

type Props = {
  budgetCategories: BudgetCategoryWithSubs[];
};

export function CategoryPageHeader({ budgetCategories }: Props) {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111111] mb-1">Categorías de Gastos</h1>
          <p className="text-[15px] text-[#6B7280]">Organiza tus gastos en categorías</p>
        </div>
        <CategoryForm budgetCategories={budgetCategories}>
          <Button className="hidden md:flex bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white h-10 px-4 rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Nueva categoría
          </Button>
        </CategoryForm>
      </div>

      <CategoryForm budgetCategories={budgetCategories}>
        <Button
          size="icon"
          className="fixed bottom-24 right-5 h-14 w-14 rounded-full md:hidden z-[60] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white shadow-[0_4px_16px_rgba(28,61,46,0.35)] transition-opacity active:opacity-75"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </CategoryForm>
    </>
  );
}
