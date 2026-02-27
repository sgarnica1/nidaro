"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus, AlertCircle } from "lucide-react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseForm } from "./expense-form";
import { cn } from "@/lib/utils";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenses: ExpenseWithCategory[];
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetId: string;
  totalIncome: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getCategoryIcon(category: ExpenseCategoryWithRelations) {
  const IconMap: Record<string, string> = {
    Supermercado: "🛒",
    Salidas: "🍽️",
    Hogar: "🏠",
    Transporte: "🚗",
    Salud: "🏥",
    Ropa: "👕",
    Entretenimiento: "🎬",
    Educación: "📚",
  };
  return IconMap[category.name] || "💰";
}

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#3B82F6",
  Gustos: "#F59E0B",
  Ahorro: "#10B981",
};

export function MonthlyExpensesSheet({
  open,
  onOpenChange,
  expenses,
  expenseCategories,
  budgetId,
  totalIncome,
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const expensePercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, ExpenseWithCategory[]>();
    expenses.forEach((exp) => {
      const catId = exp.expenseCategory.budgetCategory.id;
      const existing = map.get(catId) ?? [];
      existing.push(exp);
      map.set(catId, existing);
    });
    return map;
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((exp) => {
      const catId = exp.expenseCategory.budgetCategory.id;
      totals[catId] = (totals[catId] ?? 0) + exp.amount;
    });
    return totals;
  }, [expenses]);

  const categoryData = useMemo(() => {
    const catMap = new Map<string, { name: string; order: number; color: string }>();
    expenses.forEach((exp) => {
      const cat = exp.expenseCategory.budgetCategory;
      if (!catMap.has(cat.id)) {
        catMap.set(cat.id, {
          name: cat.name,
          order: cat.order,
          color: CATEGORY_COLORS[cat.name] || "#6B7280",
        });
      }
    });
    return Array.from(catMap.entries())
      .map(([id, data]) => ({
        id,
        ...data,
        expenses: expensesByCategory.get(id) ?? [],
        total: categoryTotals[id] ?? 0,
      }))
      .sort((a, b) => a.order - b.order);
  }, [expenses, expensesByCategory, categoryTotals]);

  const categoryPercentages = useMemo(() => {
    const pcts: Record<string, number> = {};
    categoryData.forEach((cat) => {
      pcts[cat.id] = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
    });
    return pcts;
  }, [categoryData, totalExpenses]);

  function toggleSection(categoryId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  const hasData = categoryData.some((cat) => cat.expenses.length > 0);

  useEffect(() => {
    if (open && hasData && expandedSections.size === 0) {
      const firstWithData = categoryData.find((cat) => cat.expenses.length > 0);
      if (firstWithData) {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setExpandedSections(new Set([firstWithData.id]));
        }, 0);
      }
    }
  }, [open, hasData, categoryData, expandedSections.size]);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Gastos Mensuales"
      showDragHandle={true}
    >
      <div className="flex flex-col h-full">
        {/* Header Stats */}
        <div className="px-4 pb-4 border-b border-[#F3F4F6]">
          <div className="flex gap-2 mb-3">
            <Badge className="bg-[#F3F4F6] text-[#111111] border-0 px-3 py-1.5 text-[13px] font-medium">
              {formatCurrency(totalExpenses)} total
            </Badge>
            <Badge
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium border-0",
                expensePercentage > 50
                  ? "bg-[#FEF3C7] text-[#92400E]"
                  : expensePercentage > 40
                    ? "bg-[#FDE68A] text-[#78350F]"
                    : "bg-[#D1FAE5] text-[#065F46]"
              )}
            >
              {expensePercentage.toFixed(1)}% del ingreso
            </Badge>
          </div>
          <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className="h-full flex">
              {categoryData.map((cat) => {
                const pct = categoryPercentages[cat.id] ?? 0;
                return (
                  <div
                    key={cat.id}
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
          {categoryData.map((category) => {
            const isExpanded = expandedSections.has(category.id);
            const topExpense = category.expenses[0];

            return (
              <div key={category.id} className="mb-4">
                <button
                  type="button"
                  onClick={() => toggleSection(category.id)}
                  className="w-full flex items-center justify-between h-12 px-4 bg-white rounded-xl mb-2 border border-[#F3F4F6] transition-colors active:bg-[#F8F8F6]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-sm shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-[11px] font-bold text-[#111111] uppercase tracking-wider">
                      {category.name}
                    </span>
                    <Badge className="bg-[#F3F4F6] text-[#6B7280] border-0 text-[11px] px-2 py-0.5 font-medium">
                      {category.expenses.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-[#111111]">
                      {formatCurrency(category.total)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[#6B7280]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#6B7280]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-white rounded-2xl border border-[#F3F4F6] overflow-hidden mb-2">
                    {category.expenses.length === 0 ? (
                      <div className="py-12 px-4 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F3F4F6] mb-3">
                          <AlertCircle className="h-6 w-6 text-[#6B7280]" />
                        </div>
                        <p className="text-[15px] text-[#111111] font-medium mb-1">Sin gastos</p>
                        <p className="text-[13px] text-[#6B7280]">Toca el botón + para agregar</p>
                      </div>
                    ) : (
                      category.expenses.map((expense, index) => {
                        const expCategory = expenseCategories.find(
                          (c) => c.id === expense.expenseCategoryId
                        );
                        if (!expCategory) return null;

                        const itemPct =
                          category.total > 0 ? (expense.amount / category.total) * 100 : 0;
                        const isLargeExpense = (expense.amount / totalExpenses) * 100 > 30;

                        return (
                          <div
                            key={expense.id}
                            className={cn(
                              "flex items-center gap-4 h-14 px-4 border-b border-[#F3F4F6] last:border-b-0",
                              index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                            )}
                          >
                            <div
                              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                              style={{
                                backgroundColor: `${expCategory.color}20`,
                              }}
                            >
                              {getCategoryIcon(expCategory)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[15px] font-medium text-[#111111] truncate">
                                {expense.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isLargeExpense && (
                                <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
                              )}
                              <div className="text-right">
                                <p className="text-[15px] font-bold text-[#111111] tabular-nums">
                                  {formatCurrency(expense.amount)}
                                </p>
                                <p className="text-[11px] text-[#6B7280] font-medium">
                                  {itemPct.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {!isExpanded && topExpense && (() => {
                  const topExpCategory = expenseCategories.find((c) => c.id === topExpense.expenseCategoryId);
                  if (!topExpCategory) return null;
                  return (
                    <div className="bg-white rounded-xl border border-[#F3F4F6] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                          style={{
                            backgroundColor: `${topExpCategory.color}20`,
                          }}
                        >
                          {getCategoryIcon(topExpCategory)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-[#111111] font-medium truncate">
                            {topExpense.name}
                          </p>
                        </div>
                        <p className="text-[13px] font-bold text-[#111111] tabular-nums">
                          {formatCurrency(topExpense.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white border-t border-[#F3F4F6] px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <ExpenseForm
            budgetId={budgetId}
            expenseCategories={expenseCategories}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
          >
            <Button className="w-full h-[52px] text-base font-bold rounded-[14px] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white active:scale-[0.98] transition-transform">
              <Plus className="h-5 w-5 mr-2" />
              Agregar gasto
            </Button>
          </ExpenseForm>
        </div>
      </div>

      {isFormOpen && (
        <ExpenseForm
          budgetId={budgetId}
          expenseCategories={expenseCategories}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
        >
          <span className="sr-only" />
        </ExpenseForm>
      )}
    </ResponsiveSheet>
  );
}
