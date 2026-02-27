"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseList } from "./expense-list";
import { ExpenseForm } from "./expense-form";
import { cn } from "@/lib/utils";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type Props = {
  expenses: ExpenseWithCategory[];
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetId: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { month: "long" }).format(date);
}

export function GastosClient({
  expenses,
  expenseCategories,
  budgetId,
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      monthSet.add(getMonthKey(date));
    });
    return Array.from(monthSet)
      .map((key) => {
        const [year, month] = key.split("-").map(Number);
        return { key, date: new Date(year, month, 1), label: getMonthLabel(new Date(year, month, 1)) };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (!selectedMonth) return expenses;
    return expenses.filter((exp) => {
      const date = new Date(exp.date);
      return getMonthKey(date) === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  const currentMonthTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const currentMonthCount = filteredExpenses.length;

  const monthLabel = selectedMonth
    ? availableMonths.find((m) => m.key === selectedMonth)?.label
    : null;

  return (
    <div className="overflow-x-hidden">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[#111111] mb-1">Gastos</h1>
          </div>
          <ExpenseForm
            budgetId={budgetId}
            expenseCategories={expenseCategories}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
          >
            <Button className="hidden md:flex bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white h-10 px-4 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo gasto
            </Button>
          </ExpenseForm>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-5 mb-6">
          <p className="text-[28px] font-bold text-[#111111] tracking-tight mb-1">
            {formatCurrency(currentMonthTotal)}
          </p>
          <p className="text-[13px] text-[#6B7280]">
            {currentMonthCount} {currentMonthCount === 1 ? "gasto" : "gastos"}{" "}
            {monthLabel ? `en ${monthLabel}` : "este mes"}
          </p>
        </div>

        {availableMonths.length > 1 && (
          <div className="mb-6 -mx-5 px-5">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
              <button
                type="button"
                onClick={() => setSelectedMonth(null)}
                className={cn(
                  "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all",
                  selectedMonth === null
                    ? "bg-[#1C3D2E] text-white shadow-sm"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                )}
              >
                Todos
              </button>
              {availableMonths.map((month) => (
                <button
                  key={month.key}
                  type="button"
                  onClick={() => setSelectedMonth(month.key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all capitalize",
                    selectedMonth === month.key
                      ? "bg-[#1C3D2E] text-white shadow-sm"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  )}
                >
                  {month.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ExpenseList
        expenses={filteredExpenses}
        expenseCategories={expenseCategories}
        budgetId={budgetId}
        onAddExpense={() => setIsFormOpen(true)}
      />

      <ExpenseForm
        budgetId={budgetId}
        expenseCategories={expenseCategories}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      >
        <Button
          size="icon"
          className={cn(
            "fixed bottom-24 right-5 h-14 w-14 rounded-full md:hidden z-60 bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white shadow-[0_4px_16px_rgba(28,61,46,0.35)] transition-opacity active:opacity-75",
            isFormOpen && "hidden"
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </ExpenseForm>
    </div>
  );
}
