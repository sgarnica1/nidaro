"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetExpensePlanForm } from "./budget-expense-plan-form";
import { cn } from "@/lib/utils";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type Props = {
  budgetId: string;
  expenseCategories: ExpenseCategoryWithRelations[];
  existingCategoryIds: string[];
};

export function BudgetPlanFAB({ budgetId, expenseCategories, existingCategoryIds }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <BudgetExpensePlanForm
      budgetId={budgetId}
      expenseCategories={expenseCategories}
      existingCategoryIds={existingCategoryIds}
      open={isFormOpen}
      onOpenChange={setIsFormOpen}
    >
      <Button
        size="icon"
        className={cn(
          "fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-[60] bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200",
          isFormOpen && "hidden"
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </BudgetExpensePlanForm>
  );
}
