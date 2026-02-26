"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useIsMobile } from "@/hooks/use-is-mobile";

type Props = {
  expenses: ExpenseWithCategory[];
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetId: string;
};

type MonthGroup = {
  key: string;
  label: string;
  expenses: ExpenseWithCategory[];
  total: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(new Date(date));
}

function darkenHex(hex: string, factor = 0.55): string {
  const clean = hex.replace("#", "");
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * factor);
  return `rgb(${r}, ${g}, ${b})`;
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
  return Array.from(map.values());
}

export function ExpenseList({ expenses, expenseCategories, budgetId }: Props) {
  const isMobile = useIsMobile();
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | null>(null);
  const [mobileActionExpense, setMobileActionExpense] = useState<ExpenseWithCategory | null>(null);

  function handleDelete(id: string) {
    setDeletingId(null);
    startTransition(async () => {
      const result = await deleteExpense(id);
      if (result.success) {
        toast.success("Gasto eliminado");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleMobileEdit() {
    const expense = mobileActionExpense;
    setMobileActionExpense(null);
    setTimeout(() => setEditingExpense(expense), 150);
  }

  function handleMobileDelete() {
    const expense = mobileActionExpense;
    setMobileActionExpense(null);
    setTimeout(() => setDeletingId(expense?.id ?? null), 150);
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No hay gastos registrados.</p>
        </CardContent>
      </Card>
    );
  }

  const groups = groupByMonth(expenses);
  const showMonthHeaders = groups.length > 1;

  return (
    <>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.key}>
            {showMonthHeaders && (
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatCurrency(group.total)}
                </p>
              </div>
            )}
            <div className="divide-y rounded-lg border overflow-hidden">
              {group.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-2 px-4 py-3 bg-card hover:bg-muted/40 transition-colors"
                  role={isMobile ? "button" : undefined}
                  tabIndex={isMobile ? 0 : undefined}
                  onClick={isMobile ? () => setMobileActionExpense(expense) : undefined}
                  onKeyDown={isMobile ? (e) => e.key === "Enter" && setMobileActionExpense(expense) : undefined}
                >
                  <div className="min-w-full flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium truncate">{expense.name}</p>
                      <span className="font-semibold text-sm shrink-0">{formatCurrency(expense.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                      <Badge
                        className="text-xs border-0"
                        style={{
                          backgroundColor: expense.expenseCategory.color + "22",
                          color: darkenHex(expense.expenseCategory.color),
                        }}
                      >
                        {expense.expenseCategory.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0 ml-2">
                    {!isMobile && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeletingId(expense.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
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

      <Sheet open={!!mobileActionExpense} onOpenChange={(o) => !o && setMobileActionExpense(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl border-t px-4 pt-6 pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base">{mobileActionExpense?.name}</SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleMobileEdit}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleMobileDelete}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar gasto</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={pending}
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
