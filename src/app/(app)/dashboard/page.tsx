import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getActiveBudget } from "@/lib/actions/budgets";
import { getExpensesByBudget } from "@/lib/actions/expenses";
import { getCategoriesWithPercentages } from "@/lib/actions/budget-structure";
import { BudgetTable } from "./budget-table";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default async function DashboardPage() {
  const [budget, categories] = await Promise.all([
    getActiveBudget(),
    getCategoriesWithPercentages(),
  ]);

  if (!budget) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tu centro de control financiero</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <p className="text-muted-foreground text-lg">No tienes un presupuesto activo</p>
            <p className="text-sm text-muted-foreground">
              Crea un presupuesto para empezar a controlar tus gastos.
            </p>
            <Button asChild>
              <Link href="/presupuestos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Crear presupuesto
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expenses = await getExpensesByBudget(budget.id);
  const available = budget.totalIncome;
  const totalReal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPlanned = budget.totalPlanned;
  const remaining = available - totalReal;

  const categoryPercentages: Record<string, number> = Object.fromEntries(
    categories.map((c) => [c.id, c.userPercentage])
  );

  const budgetData = {
    totalIncome: available,
    expensePlans: budget.expensePlans.map((p) => ({
      plannedAmount: p.plannedAmount,
      expenseCategory: {
        budgetCategory: {
          id: p.expenseCategory.budgetCategory.id,
          name: p.expenseCategory.budgetCategory.name,
        },
      },
    })),
  };

  const expensesData = expenses.map((e) => ({
    amount: e.amount,
    expenseCategory: {
      budgetCategory: {
        id: e.expenseCategory.budgetCategory.id,
        name: e.expenseCategory.budgetCategory.name,
      },
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{budget.name ?? "Presupuesto activo"}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(budget.startDate)} — {formatDate(budget.endDate)}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/presupuestos/nuevo">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Ingreso disponible</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(available)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Planeado</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(totalPlanned)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Real</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(totalReal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Restante</p>
            <p className={`text-xl font-semibold mt-1 ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
              {formatCurrency(remaining)}
            </p>
            {remaining < 0 && <Badge variant="destructive" className="text-xs mt-1">Excedido</Badge>}
          </CardContent>
        </Card>
      </div>

      <BudgetTable
        budget={budgetData}
        expenses={expensesData}
        categoryPercentages={categoryPercentages}
      />
    </div>
  );
}
