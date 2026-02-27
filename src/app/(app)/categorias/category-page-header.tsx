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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categorías de Gastos</h1>
          <p className="text-sm text-muted-foreground">Organiza tus gastos en categorías</p>
        </div>
        <CategoryForm budgetCategories={budgetCategories}>
          <Button className="hidden md:flex bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva categoría
          </Button>
        </CategoryForm>
      </div>

      <CategoryForm budgetCategories={budgetCategories}>
        <Button
          size="icon"
          className="fixed bottom-18 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-[60] bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </CategoryForm>
    </>
  );
}
