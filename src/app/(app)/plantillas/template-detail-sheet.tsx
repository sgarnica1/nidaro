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
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-[24px] p-0 flex flex-col bg-[#F8F8F6]"
      >
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-[#F8F8F6] z-10 pb-0 pt-6 px-5 rounded-t-[24px]">
            <div className="w-8 h-1 bg-[#D1D5DB] rounded-full mx-auto mb-6" />
            <SheetHeader className="mb-0">
              <SheetTitle className="sr-only">{template.name}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="px-5 pb-4">
            <TemplateCard
              template={template}
              expenseCategories={expenseCategories}
              budgetCategories={budgetCategories}
              totalIncome={totalIncome}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
