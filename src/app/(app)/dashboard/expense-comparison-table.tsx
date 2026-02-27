"use client";

import React, { useMemo } from "react";
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
};

type ExpenseCategoryRow = {
  expenseCategoryId: string;
  expenseCategoryName: string;
  subcategoryName: string | null;
  plannedAmount: number;
  realAmount: number;
};

type BudgetCategoryGroup = {
  budgetCategoryName: string;
  budgetCategoryOrder: number;
  subcategories: {
    subcategoryName: string | null;
    expenses: ExpenseCategoryRow[];
  }[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function ExpenseComparisonTable({ expensePlans, expenses }: Props) {
  const grouped = useMemo(() => {
    const plannedByExpenseCategory: Record<string, number> = {};
    const expenseCategoryMap: Record<string, { name: string; budgetCategoryId: string; budgetCategoryName: string; budgetCategoryOrder: number; subcategoryName: string | null }> = {};

    for (const plan of expensePlans) {
      const expCatId = plan.expenseCategory.id;
      plannedByExpenseCategory[expCatId] = (plannedByExpenseCategory[expCatId] ?? 0) + plan.plannedAmount;
      expenseCategoryMap[expCatId] = {
        name: plan.expenseCategory.name,
        budgetCategoryId: plan.expenseCategory.budgetCategory.id,
        budgetCategoryName: plan.expenseCategory.budgetCategory.name,
        budgetCategoryOrder: plan.expenseCategory.budgetCategory.order,
        subcategoryName: plan.expenseCategory.subcategory?.name ?? null,
      };
    }

    const realByExpenseCategory: Record<string, number> = {};
    for (const exp of expenses) {
      const expCatId = exp.expenseCategory.id;
      realByExpenseCategory[expCatId] = (realByExpenseCategory[expCatId] ?? 0) + exp.amount;
      if (!expenseCategoryMap[expCatId]) {
        expenseCategoryMap[expCatId] = {
          name: exp.expenseCategory.name,
          budgetCategoryId: exp.expenseCategory.budgetCategory.id,
          budgetCategoryName: exp.expenseCategory.budgetCategory.name,
          budgetCategoryOrder: exp.expenseCategory.budgetCategory.order,
          subcategoryName: exp.expenseCategory.subcategory?.name ?? null,
        };
      }
    }

    const expenseCategoryRows: ExpenseCategoryRow[] = Object.keys(expenseCategoryMap).map((expCatId) => ({
      expenseCategoryId: expCatId,
      expenseCategoryName: expenseCategoryMap[expCatId].name,
      subcategoryName: expenseCategoryMap[expCatId].subcategoryName,
      plannedAmount: plannedByExpenseCategory[expCatId] ?? 0,
      realAmount: realByExpenseCategory[expCatId] ?? 0,
    }));

    const byBudgetCategory: Record<string, { order: number; rows: ExpenseCategoryRow[] }> = {};
    for (const row of expenseCategoryRows) {
      const budgetCatName = expenseCategoryMap[row.expenseCategoryId].budgetCategoryName;
      const budgetCatOrder = expenseCategoryMap[row.expenseCategoryId].budgetCategoryOrder;
      if (!byBudgetCategory[budgetCatName]) {
        byBudgetCategory[budgetCatName] = { order: budgetCatOrder, rows: [] };
      }
      byBudgetCategory[budgetCatName].rows.push(row);
    }

    const groups: BudgetCategoryGroup[] = Object.entries(byBudgetCategory).map(([budgetCatName, { rows }]) => {
      const bySubcategory: Record<string, ExpenseCategoryRow[]> = {};
      for (const row of rows) {
        const subcatKey = row.subcategoryName ?? "__no_subcategory__";
        if (!bySubcategory[subcatKey]) {
          bySubcategory[subcatKey] = [];
        }
        bySubcategory[subcatKey].push(row);
      }

      const subcategories = Object.entries(bySubcategory).map(([subcatKey, expenseRows]) => ({
        subcategoryName: subcatKey === "__no_subcategory__" ? null : subcatKey,
        expenses: expenseRows.sort((a, b) => a.expenseCategoryName.localeCompare(b.expenseCategoryName)),
      }));

      return {
        budgetCategoryName: budgetCatName,
        budgetCategoryOrder: byBudgetCategory[budgetCatName].order,
        subcategories: subcategories.sort((a, b) => {
          if (a.subcategoryName === null) return -1;
          if (b.subcategoryName === null) return 1;
          return a.subcategoryName.localeCompare(b.subcategoryName);
        }),
      };
    });

    return groups.sort((a, b) => {
      if (a.budgetCategoryOrder !== b.budgetCategoryOrder) return a.budgetCategoryOrder - b.budgetCategoryOrder;
      return a.budgetCategoryName.localeCompare(b.budgetCategoryName);
    });
  }, [expensePlans, expenses]);

  if (grouped.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {grouped.map((group) => {
        const totalPlanned = group.subcategories.reduce(
          (sum, subcat) => sum + subcat.expenses.reduce((s, e) => s + e.plannedAmount, 0),
          0
        );
        const totalReal = group.subcategories.reduce(
          (sum, subcat) => sum + subcat.expenses.reduce((s, e) => s + e.realAmount, 0),
          0
        );

        return (
          <div key={group.budgetCategoryName}>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider capitalize">
                {group.budgetCategoryName}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Planeado: {formatCurrency(totalPlanned)}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    totalReal > totalPlanned
                      ? "text-red-600"
                      : totalReal === totalPlanned
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  )}
                >
                  Real: {formatCurrency(totalReal)}
                </span>
              </div>
            </div>
            {group.subcategories.map((subcat) => {
              const subcatPlanned = subcat.expenses.reduce((sum, e) => sum + e.plannedAmount, 0);
              const subcatReal = subcat.expenses.reduce((sum, e) => sum + e.realAmount, 0);
              const hasMultipleSubcategories = group.subcategories.length > 1;

              return (
                <div key={`${group.budgetCategoryName}-${subcat.subcategoryName ?? "__none__"}`} className="mb-4 last:mb-0">
                  {hasMultipleSubcategories && subcat.subcategoryName && (
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-xs font-medium text-muted-foreground capitalize">
                        {subcat.subcategoryName}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatCurrency(subcatPlanned)}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            subcatReal > subcatPlanned
                              ? "text-red-600"
                              : subcatReal === subcatPlanned
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatCurrency(subcatReal)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="divide-y rounded-lg border overflow-hidden">
                    {subcat.expenses.map((expense) => {
                      const exceeded = expense.realAmount > expense.plannedAmount;
                      return (
                        <div
                          key={expense.expenseCategoryId}
                          className="flex items-center gap-2 px-4 py-3 bg-card hover:bg-muted/40 transition-colors"
                        >
                          <div className="min-w-full flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium truncate capitalize">{expense.expenseCategoryName}</p>
                              <span
                                className={cn(
                                  "font-semibold text-sm shrink-0",
                                  exceeded
                                    ? "text-red-600"
                                    : expense.realAmount === expense.plannedAmount
                                    ? "text-emerald-600"
                                    : "text-muted-foreground"
                                )}
                              >
                                {formatCurrency(expense.realAmount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                Planeado: {formatCurrency(expense.plannedAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
