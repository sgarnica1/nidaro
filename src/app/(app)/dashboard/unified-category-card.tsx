"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
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
  onRowClick?: () => void;
};

type CategoryData = {
  categoryId: string;
  categoryName: string;
  assignedPct: number;
  assignedAmount: number;
  realAmount: number;
  color: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#1C3D2E",
  Gustos: "#52796F",
  Ahorro: "#84A98C",
};

export function UnifiedCategoryCard({ expensePlans, expenses, totalIncome, categoryPercentages, onRowClick }: Props) {
  const categories = useMemo(() => {
    const realByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      const catId = exp.expenseCategory.budgetCategory.id;
      realByCategory[catId] = (realByCategory[catId] ?? 0) + exp.amount;
    }

    const catNameMap: Record<string, string> = {};
    for (const plan of expensePlans) {
      catNameMap[plan.expenseCategory.budgetCategory.id] = plan.expenseCategory.budgetCategory.name;
    }
    for (const exp of expenses) {
      catNameMap[exp.expenseCategory.budgetCategory.id] = exp.expenseCategory.budgetCategory.name;
    }

    const categoryIds = Array.from(
      new Set([...Object.keys(categoryPercentages), ...Object.keys(realByCategory)])
    );

    const categoryData: CategoryData[] = categoryIds.map((catId) => {
      const assignedPct = categoryPercentages[catId] ?? 0;
      const assignedAmount = (totalIncome * assignedPct) / 100;
      const realAmount = realByCategory[catId] ?? 0;
      const categoryName = catNameMap[catId] ?? catId;
      return {
        categoryId: catId,
        categoryName,
        assignedPct,
        assignedAmount,
        realAmount,
        color: CATEGORY_COLORS[categoryName] || "#1C3D2E",
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
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-5">
      <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Por categoría</p>
      
      <div className="space-y-0">
        {categories.map((category, index) => {
          const usagePct = category.assignedAmount > 0 ? (category.realAmount / category.assignedAmount) * 100 : 0;
          const progressColor =
            usagePct < 70 ? "#22C55E" : usagePct < 90 ? "#F59E0B" : "#DC2626";

          return (
            <div key={category.categoryId}>
              {index > 0 && <div className="h-px bg-[#F3F4F6]" />}
              <button
                type="button"
                onClick={onRowClick}
                className={cn(
                  "w-full flex items-center gap-4 h-[52px] px-0",
                  onRowClick && "hover:opacity-80 transition-opacity cursor-pointer"
                )}
              >
                {/* Left: Colored square + name + badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-[15px] font-medium text-[#111111] capitalize">
                    {category.categoryName}
                  </span>
                  <Badge
                    className="text-[11px] px-2 py-0.5 border-0"
                    style={{
                      backgroundColor: `${category.color}1A`,
                      color: category.color,
                    }}
                  >
                    {category.assignedPct.toFixed(0)}%
                  </Badge>
                </div>

                {/* Center: Progress bar */}
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

                {/* Right: Two-line stat */}
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-bold text-[#111111] tabular-nums">
                    {formatCurrency(category.realAmount)}
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    de {formatCurrency(category.assignedAmount)}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
