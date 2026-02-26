"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TemplateCard } from "./template-card";
import type { TemplateWithItems } from "@/lib/actions/templates";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";

type Props = {
  template: TemplateWithItems | null;
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
  totalIncome: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TemplateDetailSheet({
  template,
  expenseCategories,
  budgetCategories,
  totalIncome,
  open,
  onOpenChange,
}: Props) {
  if (!template) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{template.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <TemplateCard
            template={template}
            expenseCategories={expenseCategories}
            budgetCategories={budgetCategories}
            totalIncome={totalIncome}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
