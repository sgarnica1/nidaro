"use client";

import { useMemo } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { cn } from "@/lib/utils";

type ExpensePlan = {
  plannedAmount: number;
  expenseCategory: {
    id: string;
    name: string;
    budgetCategory: {
      id: string;
      name: string;
      order: number;
    };
    subcategory: {
      id: string;
      name: string;
    } | null;
  };
};

type Expense = {
  amount: number;
  expenseCategory: {
    id: string;
    name: string;
    budgetCategory: {
      id: string;
      name: string;
      order: number;
    };
    subcategory: {
      id: string;
      name: string;
    } | null;
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetCategoryId: string | null;
  budgetCategoryName: string;
  expensePlans: ExpensePlan[];
  expenses: Expense[];
  categoryColor: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ExpenseCategoryDetailSheet({
  open,
  onOpenChange,
  budgetCategoryId,
  budgetCategoryName,
  expensePlans,
  expenses,
  categoryColor,
}: Props) {
  const expenseCategories = useMemo(() => {
    if (!budgetCategoryId) return [];

    const realByExpenseCategory: Record<string, number> = {};
    for (const exp of expenses) {
      if (exp.expenseCategory.budgetCategory.id === budgetCategoryId) {
        const expCatId = exp.expenseCategory.id;
        realByExpenseCategory[expCatId] = (realByExpenseCategory[expCatId] ?? 0) + exp.amount;
      }
    }

    const expenseCategoriesData = expensePlans
      .filter((plan) => plan.expenseCategory.budgetCategory.id === budgetCategoryId)
      .map((plan) => {
        const spentAmount = realByExpenseCategory[plan.expenseCategory.id] ?? 0;
        const remainingAmount = plan.plannedAmount - spentAmount;
        return {
          id: plan.expenseCategory.id,
          name: plan.expenseCategory.name,
          plannedAmount: plan.plannedAmount,
          spentAmount,
          remainingAmount,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return expenseCategoriesData;
  }, [budgetCategoryId, expensePlans, expenses]);

  const totalPlanned = useMemo(
    () => expenseCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0),
    [expenseCategories]
  );
  const totalSpent = useMemo(
    () => expenseCategories.reduce((sum, cat) => sum + cat.spentAmount, 0),
    [expenseCategories]
  );
  const totalRemaining = totalPlanned - totalSpent;

  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title={budgetCategoryName}>
      <div className="px-6 pb-6 space-y-6">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-sm shrink-0"
            style={{ backgroundColor: categoryColor }}
          />
          <div>
            <h2 className="text-lg font-semibold text-[#111111] capitalize">{budgetCategoryName}</h2>
            <p className="text-sm text-[#6B7280]">
              {expenseCategories.length} {expenseCategories.length === 1 ? "categoría" : "categorías"}
            </p>
          </div>
        </div>

        <div className="bg-[#F9FAFB] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7280]">Total planeado</span>
            <span className="text-base font-semibold text-[#111111] tabular-nums">
              {formatCurrency(totalPlanned)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7280]">Total gastado</span>
            <span className="text-base font-semibold text-[#111111] tabular-nums">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div className="h-px bg-[#E5E7EB]" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#111111]">Restante</span>
            <span
              className={cn(
                "text-base font-bold tabular-nums",
                totalRemaining >= 0 ? "text-[#10B981]" : "text-[#DC2626]"
              )}
            >
              {formatCurrency(Math.abs(totalRemaining))}
            </span>
          </div>
        </div>

        <div className="space-y-0">
          <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
            Por categoría de gasto
          </p>
          {expenseCategories.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-8">
              No hay categorías de gasto configuradas
            </p>
          ) : (
            <div className="space-y-0">
              {expenseCategories.map((expCat, index) => {
                const usagePct =
                  expCat.plannedAmount > 0 ? (expCat.spentAmount / expCat.plannedAmount) * 100 : 0;
                const progressColor =
                  usagePct < 70 ? "#22C55E" : usagePct < 90 ? "#F59E0B" : "#DC2626";

                return (
                  <div key={expCat.id}>
                    {index > 0 && <div className="h-px bg-[#F3F4F6]" />}
                    <div className="flex items-center gap-4 h-[60px]">
                      <div className="flex items-center gap-3 shrink-0 flex-1 min-w-0">
                        <span className="text-[15px] font-medium text-[#111111]">
                          {expCat.name}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(usagePct, 100)}%`,
                              backgroundColor: progressColor,
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[15px] font-bold text-[#111111] tabular-nums">
                          {formatCurrency(expCat.spentAmount)}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">
                          de {formatCurrency(expCat.plannedAmount)}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] font-medium mt-0.5",
                            expCat.remainingAmount >= 0 ? "text-[#10B981]" : "text-[#DC2626]"
                          )}
                        >
                          {expCat.remainingAmount >= 0 ? "Quedan" : "Excedido"}{" "}
                          {formatCurrency(Math.abs(expCat.remainingAmount))}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ResponsiveSheet>
  );
}
