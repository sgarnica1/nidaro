"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExpenseForm } from "./expense-form";
import { deleteExpense } from "@/lib/actions/expenses";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type Props = {
  expenses: ExpenseWithCategory[];
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetId: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(new Date(date));
}

export function ExpenseList({ expenses, expenseCategories, budgetId }: Props) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No hay gastos registrados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full shrink-0"
                style={{ backgroundColor: expense.expenseCategory.color }}
              />
              <div>
                <p className="text-sm font-medium">{expense.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs">
                    {expense.expenseCategory.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{formatCurrency(Number(expense.amount))}</span>
              <ExpenseForm budgetId={budgetId} expenseCategories={expenseCategories} expense={expense}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </ExpenseForm>
              <Dialog open={deletingId === expense.id} onOpenChange={(o) => !o && setDeletingId(null)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingId(expense.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Eliminar gasto</DialogTitle>
                    <DialogDescription>
                      ¿Eliminar &quot;{expense.name}&quot;? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
                    <Button variant="destructive" disabled={pending} onClick={() => handleDelete(expense.id)}>Eliminar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
