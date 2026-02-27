"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Pencil, Trash2, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
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
  onAddExpense?: () => void;
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

export function ExpenseList({ expenses, expenseCategories, budgetId, onAddExpense }: Props) {
  const isMobile = useIsMobile();
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | null>(null);
  const [mobileActionExpense, setMobileActionExpense] = useState<ExpenseWithCategory | null>(null);

  function handleDelete(id: string) {
    setDeletingId(null);
    startTransition(async () => {
      await deleteExpense(id);
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
      <EmptyState
        icon={Receipt}
        title="No hay gastos este mes"
        description="Agrega tu primer gasto para comenzar a rastrear tus finanzas y mantener el control de tu dinero."
        action={
          onAddExpense
            ? {
              label: "Agregar mi primer gasto",
              onClick: onAddExpense,
            }
            : undefined
        }
      />
    );
  }

  const groups = groupByMonth(expenses);
  const showMonthHeaders = groups.length > 1;

  return (
    <>
      <div className="space-y-6">
        <AnimatePresence>
          {groups.map((group, groupIndex) => (
            <motion.div
              key={group.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: groupIndex * 0.05 }}
            >
              {showMonthHeaders && (
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatCurrency(group.total)}
                  </p>
                </div>
              )}
              <Card className="rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-background">
                <CardContent className="p-0">
                  <AnimatePresence>
                    {group.expenses.map((expense, index) => {
                      const isFirst = index === 0;
                      const isLast = index === group.expenses.length - 1;
                      return (
                        <motion.div
                          key={expense.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          layout
                        >
                          <motion.div
                            whileHover={{ y: -2 }}
                            className={cn(
                              "flex items-center justify-between px-5 hover:bg-muted/40 transition-colors duration-200",
                              isFirst ? "pt-0 pb-4" : isLast ? "pt-4 pb-0" : "py-4"
                            )}
                            role={isMobile ? "button" : undefined}
                            tabIndex={isMobile ? 0 : undefined}
                            onClick={isMobile ? () => setMobileActionExpense(expense) : undefined}
                            onKeyDown={isMobile ? (e) => e.key === "Enter" && setMobileActionExpense(expense) : undefined}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3 mb-1.5">
                                <p className="text-sm font-medium truncate">{expense.name}</p>
                                <span className="font-semibold text-sm shrink-0 tabular-nums">
                                  {formatCurrency(expense.amount)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                                <Badge
                                  variant="secondary"
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

                            {!isMobile && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-2 shrink-0"
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
                          </motion.div>
                          {index < group.expenses.length - 1 && <Separator />}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
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
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base" onClick={handleMobileEdit}>
              <Pencil className="h-5 w-5" />
              Editar
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-base text-destructive hover:text-destructive"
              onClick={handleMobileDelete}
            >
              <Trash2 className="h-5 w-5" />
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
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-12 text-base flex-1" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={pending}
              className="h-12 text-base flex-1"
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
