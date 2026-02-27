"use client";

import { useState, useMemo, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Plus, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

function darkenHex(hex: string, factor = 0.7): string {
  const clean = hex.replace("#", "");
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * factor);
  return `rgb(${r}, ${g}, ${b})`;
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
        setExpandedSections(new Set([firstWithData.id]));
      }
    }
  }, [open, hasData, categoryData, expandedSections.size]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[90vh] rounded-t-[24px] p-0 flex flex-col bg-[#F8F8F6]"
        >
          <div className="flex-1 overflow-y-auto">
            <div className="sticky top-0 bg-[#F8F8F6] z-10 pb-4 pt-6 px-5 border-b border-[#E5E7EB] rounded-t-[24px]">
              <div className="w-8 h-1 bg-[#D1D5DB] rounded-full mx-auto mb-4" />
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <SheetHeader className="mb-3 p-0">
                    <SheetTitle className="text-[18px] font-bold text-[#111111]">Gastos Mensuales</SheetTitle>
                  </SheetHeader>
                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-white text-[#111111] border border-[#E5E7EB] px-3 py-1 text-[13px] font-medium">
                      {formatCurrency(totalExpenses)} total
                    </Badge>
                    <Badge
                      className={cn(
                        "px-3 py-1 text-[13px] font-medium border-0",
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
                      {categoryData.map((cat, index) => {
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-[#6B7280] hover:text-[#111111]"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="px-5 pt-6 pb-24">
              {categoryData.map((category) => {
                const isExpanded = expandedSections.has(category.id);
                const sectionPct = category.total > 0 ? (category.total / totalExpenses) * 100 : 0;
                const topExpense = category.expenses[0];

                return (
                  <div key={category.id} className="mb-4">
                    <button
                      type="button"
                      onClick={() => toggleSection(category.id)}
                      className="w-full flex items-center justify-between h-14 px-4 bg-[#F8F8F6] rounded-xl mb-2 transition-colors hover:bg-[#F3F4F6]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.8px]">
                          {category.name}
                        </span>
                        <Badge className="bg-white text-[#6B7280] border border-[#E5E7EB] text-[11px] px-2 py-0.5">
                          {category.expenses.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-semibold text-[#111111]">
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
                      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                        {category.expenses.length === 0 ? (
                          <div className="py-12 text-center">
                            <p className="text-[15px] text-[#6B7280] mb-1">Sin gastos</p>
                            <p className="text-[13px] text-[#6B7280]">Toca + para agregar</p>
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
                                  "flex items-center gap-4 h-16 px-5",
                                  index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                                )}
                              >
                                <div
                                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                                  style={{
                                    backgroundColor: `${expCategory.color}1F`,
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
                                    <p className="text-[12px] text-[#6B7280]">
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
                        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                              style={{
                                backgroundColor: `${topExpCategory.color}1F`,
                              }}
                            >
                              {getCategoryIcon(topExpCategory)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[#6B7280] truncate">
                                {topExpense.name}
                              </p>
                            </div>
                            <p className="text-[13px] font-semibold text-[#111111] tabular-nums">
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
          </div>

          <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-5">
            <ExpenseForm
              budgetId={budgetId}
              expenseCategories={expenseCategories}
              open={isFormOpen}
              onOpenChange={setIsFormOpen}
            >
              <Button className="w-full h-12 text-base rounded-2xl bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white">
                <Plus className="h-5 w-5 mr-2" />
                Agregar gasto
              </Button>
            </ExpenseForm>
          </div>
        </SheetContent>
      </Sheet>

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
    </>
  );
}
