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
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:bottom-6 z-40"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </ExpenseForm>
  );
}
