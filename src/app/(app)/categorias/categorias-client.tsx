"use client";

import { useState } from "react";
import { CategoryList } from "./category-list";
import { CategoryForm } from "./category-form";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";

type Props = {
  categories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
};

export function CategoriasClient({ categories, budgetCategories }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <CategoryList 
        categories={categories} 
        budgetCategories={budgetCategories}
        onAddCategory={() => setIsFormOpen(true)}
      />
      {isFormOpen && (
        <CategoryForm 
          budgetCategories={budgetCategories}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
        >
          <span className="sr-only">Trigger</span>
        </CategoryForm>
      )}
    </>
  );
}
