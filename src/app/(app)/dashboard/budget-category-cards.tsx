"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
};

type CategoryData = {
  categoryId: string;
  categoryName: string;
  assignedPct: number;
  assignedAmount: number;
  plannedAmount: number;
  realAmount: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function BudgetCategoryCards({ expensePlans, expenses, totalIncome, categoryPercentages }: Props) {
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
      return {
        categoryId: catId,
        categoryName: catNameMap[catId] ?? catId,
        assignedPct,
        assignedAmount,
        plannedAmount,
        realAmount,
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
    <div className="space-y-4">
      {categories.map((category) => {
        const assignedPct = totalIncome > 0 ? (category.assignedAmount / totalIncome) * 100 : 0;
        const plannedPct = totalIncome > 0 ? (category.plannedAmount / totalIncome) * 100 : 0;
        const realPct = totalIncome > 0 ? (category.realAmount / totalIncome) * 100 : 0;

        const plannedExceedsAssigned = category.plannedAmount > category.assignedAmount;
        const realExceedsPlanned = category.realAmount > category.plannedAmount;

        return (
          <Card
            key={category.categoryId}
            className="rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold capitalize">{category.categoryName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {category.assignedPct.toFixed(1)}%
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Asignado vs Planeado</span>
                    <span className={cn(plannedExceedsAssigned && "text-red-600")}>
                      {plannedPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-slate-300 rounded-full"
                      style={{ width: `${Math.min(assignedPct, 100)}%` }}
                    />
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full transition-all duration-300",
                        plannedExceedsAssigned ? "bg-red-600" : "bg-emerald-600"
                      )}
                      style={{ width: `${Math.min(plannedPct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Planeado vs Real</span>
                    <span className={cn(realExceedsPlanned && "text-red-600")}>
                      {realPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-slate-300 rounded-full"
                      style={{ width: `${Math.min(plannedPct, 100)}%` }}
                    />
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full transition-all duration-300",
                        realExceedsPlanned ? "bg-red-600" : "bg-emerald-600"
                      )}
                      style={{ width: `${Math.min(realPct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t border-border/40">
                <span>Asignado: {formatCurrency(category.assignedAmount)}</span>
                <span>Planeado: {formatCurrency(category.plannedAmount)}</span>
                <span className={cn("font-medium", realExceedsPlanned ? "text-red-600" : "text-emerald-600")}>
                  Real: {formatCurrency(category.realAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
