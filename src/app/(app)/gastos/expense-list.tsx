"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Pencil, Trash2, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm } from "./expense-form";
import { deleteExpense } from "@/lib/actions/expenses";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type Props = {
  expenses: ExpenseWithCategory[];
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetId: string;
  onAddExpense?: () => void;
};

type MonthGroup = {
  key: string;
  label: string;
  expenses: ExpenseWithCategory[];
  total: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(new Date(date));
}

function darkenHex(hex: string, factor = 0.7): string {
  const clean = hex.replace("#", "");
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * factor);
  return `rgb(${r}, ${g}, ${b})`;
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

function groupByMonth(expenses: ExpenseWithCategory[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const exp of expenses) {
    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map.has(key)) {
      const raw = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(d);
      map.set(key, {
        key,
        label: raw.charAt(0).toUpperCase() + raw.slice(1),
        expenses: [],
        total: 0,
      });
    }
    const group = map.get(key)!;
    group.expenses.push(exp);
    group.total += exp.amount;
  }
  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}

export function ExpenseList({ expenses, expenseCategories, budgetId, onAddExpense }: Props) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | null>(null);
  const [pressedRow, setPressedRow] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingId(null);
    startTransition(async () => {
      await deleteExpense(id);
    });
  }

  function handleRowPress(expense: ExpenseWithCategory) {
    setPressedRow(expense.id);
    setTimeout(() => setPressedRow(null), 150);
    setTimeout(() => setEditingExpense(expense), 150);
  }

  if (expenses.length === 0) {
    const currentMonth = new Intl.DateTimeFormat("es-MX", { month: "long" }).format(new Date());
    return (
      <div className="py-16 text-center">
        <Receipt className="h-12 w-12 text-[#6B7280] mx-auto mb-4 opacity-50" />
        <p className="text-[15px] font-medium text-[#111111] mb-1">
          Sin gastos en {currentMonth}
        </p>
        <p className="text-[13px] text-[#6B7280]">Toca + para registrar uno</p>
      </div>
    );
  }

  const groups = groupByMonth(expenses);
  const showMonthHeaders = groups.length > 1;

  return (
    <>
      <div className="space-y-8">
        {groups.map((group, groupIndex) => (
          <div key={group.key}>
            {showMonthHeaders && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.8px]">
                    {group.label}
                  </p>
                  <p className="text-[13px] font-semibold text-[#1C3D2E]">
                    {formatCurrency(group.total)}
                  </p>
                </div>
                {groupIndex > 0 && <div className="h-px bg-[#E5E7EB] mb-6" />}
              </>
            )}
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {group.expenses.map((expense) => {
                const category = expenseCategories.find((c) => c.id === expense.expenseCategoryId);
                if (!category) return null;

                return (
                  <button
                    key={expense.id}
                    type="button"
                    onClick={() => handleRowPress(expense)}
                    className={cn(
                      "w-full flex items-center gap-4 h-16 px-5 transition-colors",
                      pressedRow === expense.id ? "bg-[#F3F4F6]" : "bg-white hover:bg-[#F3F4F6]"
                    )}
                  >
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
                      style={{
                        backgroundColor: `${category.color}1F`,
                      }}
                    >
                      {getCategoryIcon(category)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[15px] font-medium text-[#111111] truncate">
                          {expense.name}
                        </p>
                        <Badge
                          className="text-[11px] px-2 py-0.5 rounded-full border-0"
                          style={{
                            backgroundColor: `${category.color}1A`,
                            color: darkenHex(category.color),
                          }}
                        >
                          {category.name}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-[#6B7280]">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-[16px] font-bold text-[#111111] tabular-nums">
                        {formatCurrency(expense.amount)}
                      </p>
                      <ChevronRight className="h-5 w-5 text-[#6B7280] shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {editingExpense && (
        <ExpenseForm
          budgetId={budgetId}
          expenseCategories={expenseCategories}
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(o) => !o && setEditingExpense(null)}
        >
          <span className="sr-only" />
        </ExpenseForm>
      )}

      <Dialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-semibold">Eliminar gasto</DialogTitle>
            <DialogDescription className="text-[15px] text-[#6B7280]">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-6">
            <Button
              variant="outline"
              className="h-12 text-base flex-1 rounded-xl"
              onClick={() => setDeletingId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              className="h-12 text-base flex-1 rounded-xl bg-[#DC2626] hover:bg-[#DC2626]/90"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
