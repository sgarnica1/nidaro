"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "./expense-form";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type Props = {
  budgetId: string;
  expenseCategories: ExpenseCategoryWithRelations[];
};

export function FAB({ budgetId, expenseCategories }: Props) {
  return (
    <ExpenseForm budgetId={budgetId} expenseCategories={expenseCategories}>
      <Button
        size="icon"
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-[60] bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </ExpenseForm>
  );
}
