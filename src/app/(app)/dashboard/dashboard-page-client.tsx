"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardHeader } from "./dashboard-header";
import { MonthlySpendingCard } from "./monthly-spending-card";
import { UnifiedCategoryCard } from "./unified-category-card";
import { RecentExpensesPreview } from "./recent-expenses-preview";
import { ExpenseCategoryDetailSheet } from "./expense-category-detail-sheet";
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
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
}

function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCategoryDetailSheetOpen, setIsCategoryDetailSheetOpen] = useState(false);

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

  const CATEGORY_COLORS: Record<string, string> = {
    Necesidades: "#3B82F6",
    Gustos: "#F59E0B",
    Ahorro: "#22C55E",
  };

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    
    // Build a map of category IDs to names from all available sources
    const catNameMap: Record<string, string> = {};
    
    // From expense plans
    for (const plan of expensePlans) {
      catNameMap[plan.expenseCategory.budgetCategory.id] = plan.expenseCategory.budgetCategory.name;
    }
    
    // From expenses
    for (const exp of expenses) {
      catNameMap[exp.expenseCategory.budgetCategory.id] = exp.expenseCategory.budgetCategory.name;
    }
    
    // From expense categories (this covers cases like "Ahorro" with no plans/expenses)
    for (const expCat of expenseCategories) {
      catNameMap[expCat.budgetCategory.id] = expCat.budgetCategory.name;
    }
    
    const categoryName = catNameMap[selectedCategoryId];
    if (!categoryName) return null;
    
    return {
      id: selectedCategoryId,
      name: categoryName,
      color: CATEGORY_COLORS[categoryName] || "#1C3D2E",
    };
  }, [selectedCategoryId, expensePlans, expenses, expenseCategories]);

  function handleCategoryClick(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setIsCategoryDetailSheetOpen(true);
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DashboardHeader
          monthLabel={monthLabel}
          dateRange={dateRange}
          budgetId={budgetId}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </motion.div>

      <MonthlySpendingCard
        totalSpent={totalReal}
        totalPlanned={totalPlanned}
        remaining={remaining}
        totalIncome={totalIncome}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
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
        onCategoryClick={handleCategoryClick}
      />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <RecentExpensesPreview expenses={expenses} />
      </motion.div>

      {selectedCategory && (
        <ExpenseCategoryDetailSheet
          open={isCategoryDetailSheetOpen}
          onOpenChange={setIsCategoryDetailSheetOpen}
          budgetCategoryId={selectedCategory.id}
          budgetCategoryName={selectedCategory.name}
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
          categoryColor={selectedCategory.color}
        />
      )}

      <NewBudgetFAB />
    </div>
  );
}
