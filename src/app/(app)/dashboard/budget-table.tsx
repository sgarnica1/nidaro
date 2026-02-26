"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { BudgetWithDetails } from "@/lib/actions/budgets";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";

type Props = {
  budget: BudgetWithDetails;
  expenses: ExpenseWithCategory[];
  categoryPercentages: Record<string, number>;
};

type CategoryRow = {
  categoryId: string;
  categoryName: string;
  assignedPct: number;
  assignedAmount: number;
  plannedAmount: number;
  realAmount: number;
  plannedPct: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function BudgetTable({ budget, expenses, categoryPercentages }: Props) {
  const available = Number(budget.totalIncome);

  const realByCategory: Record<string, number> = {};
  for (const exp of expenses) {
    const catId = exp.expenseCategory.budgetCategory.id;
    realByCategory[catId] = (realByCategory[catId] ?? 0) + Number(exp.amount);
  }

  const plannedByCategory: Record<string, number> = {};
  for (const plan of budget.expensePlans) {
    const catId = plan.expenseCategory.budgetCategory.id;
    plannedByCategory[catId] = (plannedByCategory[catId] ?? 0) + Number(plan.plannedAmount);
  }

  const categoryIds = Array.from(
    new Set([
      ...Object.keys(categoryPercentages),
      ...Object.keys(realByCategory),
      ...Object.keys(plannedByCategory),
    ])
  );

  const rows: CategoryRow[] = categoryIds.map((catId) => {
    const assignedPct = categoryPercentages[catId] ?? 0;
    const assignedAmount = (available * assignedPct) / 100;
    const plannedAmount = plannedByCategory[catId] ?? 0;
    const realAmount = realByCategory[catId] ?? 0;
    const plannedPct = available > 0 ? (plannedAmount / available) * 100 : 0;
    return {
      categoryId: catId,
      categoryName: "",
      assignedPct,
      assignedAmount,
      plannedAmount,
      realAmount,
      plannedPct,
    };
  });

  const catNameMap: Record<string, string> = {};
  for (const plan of budget.expensePlans) {
    catNameMap[plan.expenseCategory.budgetCategory.id] = plan.expenseCategory.budgetCategory.name;
  }
  for (const exp of expenses) {
    catNameMap[exp.expenseCategory.budgetCategory.id] = exp.expenseCategory.budgetCategory.name;
  }
  for (const row of rows) {
    row.categoryName = catNameMap[row.categoryId] ?? row.categoryId;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">% Asignado</TableHead>
              <TableHead className="text-right">$ Asignado</TableHead>
              <TableHead className="text-right">% Planeado</TableHead>
              <TableHead className="text-right">$ Planeado</TableHead>
              <TableHead className="text-right">$ Real</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const exceeded = row.realAmount > row.assignedAmount;
              return (
                <TableRow key={row.categoryId}>
                  <TableCell className="font-medium">{row.categoryName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{row.assignedPct}%</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(row.assignedAmount)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {row.plannedPct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(row.plannedAmount)}
                  </TableCell>
                  <TableCell className={cn("text-right font-medium", exceeded ? "text-destructive" : "text-green-600")}>
                    {formatCurrency(row.realAmount)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const pct = row.assignedAmount > 0 ? Math.min((row.realAmount / row.assignedAmount) * 100, 100) : 0;
          const exceeded = row.realAmount > row.assignedAmount;
          return (
            <div key={row.categoryId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{row.categoryName}</span>
                <span className={cn("font-medium", exceeded ? "text-destructive" : "text-muted-foreground")}>
                  {formatCurrency(row.realAmount)} / {formatCurrency(row.assignedAmount)}
                </span>
              </div>
              <Progress
                value={pct}
                className={cn("h-2", exceeded && "[&>div]:bg-destructive")}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
