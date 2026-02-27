import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getActiveBudget, getBudgets, getBudgetById } from "@/lib/actions/budgets";
import { getExpensesByBudget } from "@/lib/actions/expenses";
import { getCategoriesWithPercentages } from "@/lib/actions/budget-structure";
import { getExpenseCategories } from "@/lib/actions/expense-categories";
import { BudgetTable } from "./budget-table";
import { BudgetFilter } from "./budget-filter";
import { ExpenseComparisonTable } from "./expense-comparison-table";
import { BudgetExpensePlanForm } from "./budget-expense-plan-form";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function budgetLabel(b: { name: string | null; startDate: Date }): string {
  if (b.name) return b.name;
  const raw = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(b.startDate));
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ budgetId?: string }>;
}) {
  const { budgetId: selectedId } = await searchParams;

  const [allBudgets, categories, expenseCategories] = await Promise.all([
    getBudgets(),
    getCategoriesWithPercentages(),
    getExpenseCategories(),
  ]);

  if (allBudgets.length === 0) {
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

  const selectedBudget = selectedId
    ? await getBudgetById(selectedId)
    : await getActiveBudget();

  if (!selectedBudget) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tu centro de control financiero</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <p className="text-muted-foreground text-lg">Presupuesto no encontrado</p>
            <Button asChild>
              <Link href="/dashboard">
                Ver presupuesto activo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const budget = selectedBudget;

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

  const budgetOptions = allBudgets.map((b) => ({ id: b.id, label: budgetLabel(b) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{budget.name ?? "Presupuesto activo"}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(budget.startDate)} — {formatDate(budget.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BudgetExpensePlanForm
            budgetId={budget.id}
            expenseCategories={expenseCategories}
            existingCategoryIds={budget.expensePlans.map((p) => p.expenseCategory.id)}
          >
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Plus className="h-4 w-4 mr-1" />
              Agregar categoría
            </Button>
          </BudgetExpensePlanForm>
          <Button asChild variant="outline" size="sm">
            <Link href="/presupuestos/nuevo">
              <Plus className="h-4 w-4 mr-1" />
              Nuevo presupuesto
            </Link>
          </Button>
        </div>
      </div>

      <BudgetFilter budgets={budgetOptions} selectedId={budget.id} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className='px-4'>
            <p className="text-xs text-muted-foreground">Ingreso disponible</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(available)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='px-4'>
            <p className="text-xs text-muted-foreground">Planeado</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(totalPlanned)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='px-4'>
            <p className="text-xs text-muted-foreground">Real</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(totalReal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='px-4'>
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

      <ExpenseComparisonTable
        expensePlans={budget.expensePlans.map((p) => ({
          plannedAmount: p.plannedAmount,
          expenseCategory: {
            id: p.expenseCategory.id,
            name: p.expenseCategory.name,
            budgetCategory: {
              id: p.expenseCategory.budgetCategory.id,
              name: p.expenseCategory.budgetCategory.name,
              order: p.expenseCategory.budgetCategory.order,
            },
            subcategory: p.expenseCategory.subcategory
              ? {
                id: p.expenseCategory.subcategory.id,
                name: p.expenseCategory.subcategory.name,
              }
              : null,
          },
        }))}
        expenses={expenses.map((e) => ({
          amount: e.amount,
          expenseCategory: {
            id: e.expenseCategory.id,
            name: e.expenseCategory.name,
            budgetCategory: {
              id: e.expenseCategory.budgetCategory.id,
              name: e.expenseCategory.budgetCategory.name,
              order: e.expenseCategory.budgetCategory.order,
            },
            subcategory: e.expenseCategory.subcategory
              ? {
                id: e.expenseCategory.subcategory.id,
                name: e.expenseCategory.subcategory.name,
              }
              : null,
          },
        }))}
      />

      <BudgetExpensePlanForm
        budgetId={budget.id}
        expenseCategories={expenseCategories}
        existingCategoryIds={budget.expensePlans.map((p) => p.expenseCategory.id)}
      >
        <Button
          size="icon"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </BudgetExpensePlanForm>
    </div>
  );
}
