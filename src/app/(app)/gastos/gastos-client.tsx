"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
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
  budgetName: string | null;
  startDate: Date;
  endDate: Date;
  budgetOptions: Array<{ id: string; label: string; startDate: Date; endDate: Date }>;
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
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: "UTC" }).format(date);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
}

function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export function GastosClient({
  expenses,
  expenseCategories,
  budgetId,
  budgetName,
  startDate,
  endDate,
  budgetOptions,
}: Props) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const initialIndex = budgetOptions.findIndex((b) => b.id === budgetId);
  const [currentBudgetIndex, setCurrentBudgetIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  useEffect(() => {
    const newIndex = budgetOptions.findIndex((b) => b.id === budgetId);
    if (newIndex >= 0) {
      setCurrentBudgetIndex(newIndex);
    }
  }, [budgetId, budgetOptions]);

  const monthLabel = budgetName || formatMonthYear(new Date(startDate));
  const dateRange = `${formatDate(new Date(startDate))} – ${formatDate(new Date(endDate))}`;

  const canGoPrevious = currentBudgetIndex > 0;
  const canGoNext = currentBudgetIndex < budgetOptions.length - 1;

  function handlePrevious() {
    if (canGoPrevious) {
      const newIndex = currentBudgetIndex - 1;
      setCurrentBudgetIndex(newIndex);
      router.push(`/gastos?budgetId=${budgetOptions[newIndex].id}`);
    }
  }

  function handleNext() {
    if (canGoNext) {
      const newIndex = currentBudgetIndex + 1;
      setCurrentBudgetIndex(newIndex);
      router.push(`/gastos?budgetId=${budgetOptions[newIndex].id}`);
    }
  }

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
    if (!selectedMonth) {
      return expenses;
    }
    return expenses.filter((exp) => {
      const date = new Date(exp.date);
      return getMonthKey(date) === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  const currentMonthTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const currentMonthCount = filteredExpenses.length;

  const selectedMonthLabel = selectedMonth
    ? availableMonths.find((m) => m.key === selectedMonth)?.label
    : null;

  return (
    <div className="overflow-x-hidden pb-5">
      <div className="mb-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center justify-between gap-2 w-full">
              <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">
                Gastos
              </h1>
              {budgetOptions.length > 1 && (
                <div className="flex items-center gap-1">
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6]"
                      onClick={handlePrevious}
                      disabled={!canGoPrevious}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6]"
                      onClick={handleNext}
                      disabled={!canGoNext}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
            <ExpenseForm
              budgetId={budgetId}
              expenseCategories={expenseCategories}
              open={isFormOpen}
              onOpenChange={setIsFormOpen}
            >
              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
                <Button className="hidden md:flex bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white h-10 px-4 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo gasto
                </Button>
              </motion.div>
            </ExpenseForm>
          </div>
          <p className="text-[12px] text-[#6B7280]"><span className="font-bold">{monthLabel}</span> - {dateRange}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-5 mb-6"
        >
          <motion.p
            key={currentMonthTotal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[28px] font-bold text-[#111111] tracking-tight mb-1"
          >
            {formatCurrency(currentMonthTotal)}
          </motion.p>
          <p className="text-[13px] text-[#6B7280]">
            {currentMonthCount} {currentMonthCount === 1 ? "gasto" : "gastos"}{" "}
            {selectedMonthLabel ? `en ${selectedMonthLabel}` : "en total"}
          </p>
        </motion.div>

        {availableMonths.length > 1 && (
          <div className="mb-6 -mx-5 px-5">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
              <motion.button
                type="button"
                onClick={() => setSelectedMonth(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all",
                  selectedMonth === null
                    ? "bg-[#1C3D2E] text-white shadow-sm"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                )}
              >
                Todos
              </motion.button>
              {availableMonths.map((month) => (
                <motion.button
                  key={month.key}
                  type="button"
                  onClick={() => setSelectedMonth(month.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all capitalize",
                    selectedMonth === month.key
                      ? "bg-[#1C3D2E] text-white shadow-sm"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  )}
                >
                  {month.label}
                </motion.button>
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
        <motion.div
          className={cn("fixed bottom-24 right-5 md:hidden z-60", isFormOpen && "hidden")}
          whileTap={{ scale: 0.9 }}
          initial={false}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-[#1C3D2E] opacity-20"
            initial={{ scale: 1, opacity: 0 }}
            whileTap={{ scale: 4, opacity: [0, 0.2, 0] }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <Button
            size="icon"
            className="relative h-14 w-14 rounded-full bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white shadow-[0_4px_16px_rgba(28,61,46,0.35)]"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      </ExpenseForm>
    </div>
  );
}
