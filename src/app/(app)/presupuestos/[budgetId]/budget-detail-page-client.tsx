"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BudgetCard } from "../budget-card";
import type { BudgetWithDetails } from "@/lib/actions/budgets";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";

type Props = {
  budget: BudgetWithDetails;
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
  totalIncome: number;
};

export function BudgetDetailPageClient({
  budget,
  expenseCategories,
  budgetCategories,
  totalIncome,
}: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-[#F8F8F6] flex flex-col overflow-hidden">
      <div className="bg-white border-b border-[#F3F4F6] shrink-0 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="h-5 w-5 text-[#6B7280]" />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-[#111111]">
              {budget.name || "Presupuesto"}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-40">
        <BudgetCard
          budget={budget}
          expenseCategories={expenseCategories}
          budgetCategories={budgetCategories}
          totalIncome={totalIncome}
        />
      </div>
    </div>
  );
}
