"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "./dashboard-header";
import { HeroSummaryCard } from "./hero-summary-card";
import { BudgetHealthSummary } from "./budget-health-summary";
import { UnifiedCategoryCard } from "./unified-category-card";
import { RecentExpensesPreview } from "./recent-expenses-preview";
import { MonthlyExpensesSheet } from "@/app/(app)/gastos/monthly-expenses-sheet";
import { NewBudgetFAB } from "./new-budget-fab";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

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

type Props = {
  budgetId: string;
  budgetName: string | null;
  startDate: Date;
  endDate: Date;
  available: number;
  totalPlanned: number;
  totalReal: number;
  remaining: number;
  expensePlans: ExpensePlan[];
  expenses: ExpenseWithCategory[];
  totalIncome: number;
  categoryPercentages: Record<string, number>;
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetOptions: Array<{ id: string; label: string; startDate: Date; endDate: Date }>;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(date);
}

function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(date);
}

export function DashboardPageClient({
  budgetId,
  budgetName,
  startDate,
  endDate,
  available,
  totalPlanned,
  totalReal,
  remaining,
  expensePlans,
  expenses,
  totalIncome,
  categoryPercentages,
  expenseCategories,
  budgetOptions,
}: Props) {
  const router = useRouter();
  const initialIndex = budgetOptions.findIndex((b) => b.id === budgetId);
  const [currentBudgetIndex, setCurrentBudgetIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const monthLabel = budgetName || formatMonthYear(new Date(startDate));
  const dateRange = `${formatDate(new Date(startDate))} – ${formatDate(new Date(endDate))}`;

  const canGoPrevious = currentBudgetIndex > 0;
  const canGoNext = currentBudgetIndex < budgetOptions.length - 1;

  function handlePrevious() {
    if (canGoPrevious) {
      const newIndex = currentBudgetIndex - 1;
      setCurrentBudgetIndex(newIndex);
      router.push(`/dashboard?budgetId=${budgetOptions[newIndex].id}`);
    }
  }

  function handleNext() {
    if (canGoNext) {
      const newIndex = currentBudgetIndex + 1;
      setCurrentBudgetIndex(newIndex);
      router.push(`/dashboard?budgetId=${budgetOptions[newIndex].id}`);
    }
  }

  const budgetData = {
    totalIncome: available,
    expensePlans: expensePlans.map((p) => ({
      plannedAmount: p.plannedAmount,
      expenseCategory: {
        budgetCategory: {
          id: p.expenseCategory.budgetCategory.id,
          name: p.expenseCategory.budgetCategory.name,
        },
      },
    })),
  };

  const expensesData = expenses.map((e) => ({
    amount: e.amount,
    expenseCategory: {
      budgetCategory: {
        id: e.expenseCategory.budgetCategory.id,
        name: e.expenseCategory.budgetCategory.name,
      },
    },
  }));


  return (
    <div className="space-y-4 overflow-x-hidden">
      <DashboardHeader
        monthLabel={monthLabel}
        dateRange={dateRange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />

      <HeroSummaryCard available={available} totalPlanned={totalPlanned} totalReal={totalReal} remaining={remaining} />

      <BudgetHealthSummary totalReal={totalReal} totalPlanned={totalPlanned} available={available} />

      <UnifiedCategoryCard
        expensePlans={expensePlans}
        expenses={expenses.map((e) => ({
          amount: e.amount,
          expenseCategory: {
            id: e.expenseCategory.id,
            name: e.expenseCategory.name,
            budgetCategory: {
              id: e.expenseCategory.budgetCategory.id,
              name: e.expenseCategory.budgetCategory.name,
              order: e.expenseCategory.budgetCategory.order,
            },
            subcategory: e.expenseCategory.subcategory
              ? {
                id: e.expenseCategory.subcategory.id,
                name: e.expenseCategory.subcategory.name,
              }
              : null,
          },
        }))}
        totalIncome={totalIncome}
        categoryPercentages={categoryPercentages}
        onRowClick={() => setIsSheetOpen(true)}
      />

      <RecentExpensesPreview expenses={expenses} />

      <MonthlyExpensesSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        expenses={expenses}
        expenseCategories={expenseCategories}
        budgetId={budgetId}
        totalIncome={totalIncome}
      />

      <NewBudgetFAB />
    </div>
  );
}
