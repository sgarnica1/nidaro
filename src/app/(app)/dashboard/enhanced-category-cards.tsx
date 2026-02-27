"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  expensePlans: ExpensePlan[];
  expenses: Expense[];
  totalIncome: number;
  categoryPercentages: Record<string, number>;
  onCardClick?: () => void;
};

type CategoryData = {
  categoryId: string;
  categoryName: string;
  assignedPct: number;
  assignedAmount: number;
  plannedAmount: number;
  realAmount: number;
  color: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#3B82F6",
  Gustos: "#F59E0B",
  Ahorro: "#10B981",
};

export function EnhancedCategoryCards({ expensePlans, expenses, totalIncome, categoryPercentages, onCardClick }: Props) {
  const categories = useMemo(() => {
    const realByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      const catId = exp.expenseCategory.budgetCategory.id;
      realByCategory[catId] = (realByCategory[catId] ?? 0) + exp.amount;
    }

    const plannedByCategory: Record<string, number> = {};
    for (const plan of expensePlans) {
      const catId = plan.expenseCategory.budgetCategory.id;
      plannedByCategory[catId] = (plannedByCategory[catId] ?? 0) + plan.plannedAmount;
    }

    const catNameMap: Record<string, string> = {};
    for (const plan of expensePlans) {
      catNameMap[plan.expenseCategory.budgetCategory.id] = plan.expenseCategory.budgetCategory.name;
    }
    for (const exp of expenses) {
      catNameMap[exp.expenseCategory.budgetCategory.id] = exp.expenseCategory.budgetCategory.name;
    }

    const categoryIds = Array.from(
      new Set([...Object.keys(categoryPercentages), ...Object.keys(realByCategory), ...Object.keys(plannedByCategory)])
    );

    const categoryData: CategoryData[] = categoryIds.map((catId) => {
      const assignedPct = categoryPercentages[catId] ?? 0;
      const assignedAmount = (totalIncome * assignedPct) / 100;
      const plannedAmount = plannedByCategory[catId] ?? 0;
      const realAmount = realByCategory[catId] ?? 0;
      const categoryName = catNameMap[catId] ?? catId;
      return {
        categoryId: catId,
        categoryName,
        assignedPct,
        assignedAmount,
        plannedAmount,
        realAmount,
        color: CATEGORY_COLORS[categoryName] || "#6B7280",
      };
    });

    return categoryData.sort((a, b) => {
      const aOrder = expensePlans.find((p) => p.expenseCategory.budgetCategory.id === a.categoryId)
        ?.expenseCategory.budgetCategory.order ?? 999;
      const bOrder = expensePlans.find((p) => p.expenseCategory.budgetCategory.id === b.categoryId)
        ?.expenseCategory.budgetCategory.order ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.categoryName.localeCompare(b.categoryName);
    });
  }, [expensePlans, expenses, totalIncome, categoryPercentages]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => {
        const plannedPct = totalIncome > 0 ? (category.plannedAmount / totalIncome) * 100 : 0;
        const realPct = totalIncome > 0 ? (category.realAmount / totalIncome) * 100 : 0;
        const realExceedsPlanned = category.realAmount > category.plannedAmount;
        const realExceedsAssigned = category.realAmount > category.assignedAmount;

        const realPosition = category.plannedAmount > 0 ? (category.realAmount / category.plannedAmount) * 100 : 0;

        return (
          <Card
            key={category.categoryId}
            onClick={onCardClick}
            className={cn(
              "rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] relative overflow-hidden",
              onCardClick && "cursor-pointer hover:shadow-md transition-shadow"
            )}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: category.color }} />
            <CardContent className="p-5 relative">
              <div className="absolute top-8 right-5 text-[80px] font-bold text-[#F3F4F6] leading-none select-none">
                {category.assignedPct.toFixed(0)}
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-[#111111] capitalize">{category.categoryName}</h3>
                  <span className="text-[12px] font-medium text-[#6B7280]">{category.assignedPct.toFixed(1)}%</span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="relative h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        width: `${Math.min(plannedPct, 100)}%`,
                        backgroundColor: category.color,
                      }}
                    />
                    {category.plannedAmount > 0 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-white shadow-sm"
                        style={{
                          left: `${Math.min(realPosition, 100)}%`,
                          backgroundColor: realExceedsPlanned ? "#DC2626" : "#22C55E",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1">Asignado</p>
                    <p className="text-[13px] font-medium text-[#111111]">{formatCurrency(category.assignedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1">Planeado</p>
                    <p className="text-[13px] font-medium text-[#111111]">{formatCurrency(category.plannedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1">Real</p>
                    <p
                      className={cn(
                        "text-[13px] font-bold",
                        realExceedsPlanned ? "text-[#DC2626]" : realExceedsAssigned ? "text-[#F59E0B]" : "text-[#22C55E]"
                      )}
                    >
                      {formatCurrency(category.realAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
