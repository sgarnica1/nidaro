"use client";

import { useState } from "react";
import { BudgetCategoryCards } from "./budget-category-cards";
import { MonthlyExpensesSheet } from "@/app/(app)/gastos/monthly-expenses-sheet";
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
  expenses: ExpenseWithCategory[];
  totalIncome: number;
  categoryPercentages: Record<string, number>;
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetId: string;
};

export function DashboardClient({
  expensePlans,
  expenses,
  totalIncome,
  categoryPercentages,
  expenseCategories,
  budgetId,
}: Props) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const expensesData: Expense[] = expenses.map((e) => ({
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
  }));

  return (
    <>
      <div onClick={() => setIsSheetOpen(true)} className="cursor-pointer">
        <BudgetCategoryCards
          expensePlans={expensePlans}
          expenses={expensesData}
          totalIncome={totalIncome}
          categoryPercentages={categoryPercentages}
        />
      </div>
      <MonthlyExpensesSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        expenses={expenses}
        expenseCategories={expenseCategories}
        budgetId={budgetId}
        totalIncome={totalIncome}
      />
    </>
  );
}
