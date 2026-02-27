"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "./expense-form";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type Props = {
  budgetId: string;
  expenseCategories: ExpenseCategoryWithRelations[];
};

export function DesktopExpenseButton({ budgetId, expenseCategories }: Props) {
  return (
    <ExpenseForm budgetId={budgetId} expenseCategories={expenseCategories}>
      <Button className="hidden md:flex bg-primary hover:bg-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        Nuevo gasto
      </Button>
    </ExpenseForm>
  );
}
