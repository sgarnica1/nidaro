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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 flex items-center justify-center -ml-2 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 text-[#6B7280]" />
        </button>
        <div className="flex-1">
          <h1 className="text-[18px] font-bold text-[#111111]">
            {budget.name || "Presupuesto"}
          </h1>
        </div>
      </div>

      <BudgetCard
        budget={budget}
        expenseCategories={expenseCategories}
        budgetCategories={budgetCategories}
        totalIncome={totalIncome}
      />
    </div>
  );
}
