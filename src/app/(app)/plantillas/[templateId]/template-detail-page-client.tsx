"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TemplateCard } from "../template-card";
import type { TemplateWithItems } from "@/lib/actions/templates";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";

type Props = {
  template: TemplateWithItems;
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
  totalIncome: number;
};

export function TemplateDetailPage({
  template,
  expenseCategories,
  budgetCategories,
  totalIncome,
}: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-[#F8F8F6] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#F3F4F6] shrink-0 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="h-5 w-5 text-[#6B7280]" />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-[#111111]">{template.name}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-20">
        <TemplateCard
          template={template}
          expenseCategories={expenseCategories}
          budgetCategories={budgetCategories}
          totalIncome={totalIncome}
        />
      </div>
    </div>
  );
}
