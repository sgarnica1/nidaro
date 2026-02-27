import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getActiveBudget, getBudgets, getBudgetById } from "@/lib/actions/budgets";
import { getExpensesByBudget } from "@/lib/actions/expenses";
import { getCategoriesWithPercentages } from "@/lib/actions/budget-structure";
import { getExpenseCategories } from "@/lib/actions/expense-categories";
import { BudgetTable } from "./budget-table";
import { BudgetFilter } from "./budget-filter";
import { BudgetCategoryCards } from "./budget-category-cards";
import { BudgetPlanFAB } from "./budget-plan-fab";

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
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tu centro de control financiero</p>
        </div>
        <EmptyState
          icon="receipt"
          title="Empieza tu primer presupuesto"
          description="Organiza tus gastos y toma el control de tu dinero este mes."
          action={{
            label: "Crear mi presupuesto",
            href: "/presupuestos/nuevo",
          }}
        />
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
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tu centro de control financiero</p>
        </div>
        <EmptyState
          icon="receipt"
          title="Presupuesto no encontrado"
          description="El presupuesto que buscas no está disponible. Regresa al dashboard para ver tu presupuesto activo."
          action={{
            label: "Ver presupuesto activo",
            href: "/dashboard",
          }}
        />
      </div>
    );
  }

  const budget = selectedBudget;

  if (!budget) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tu centro de control financiero</p>
        </div>
        <EmptyState
          icon="receipt"
          title="Empieza tu primer presupuesto"
          description="Organiza tus gastos y toma el control de tu dinero este mes."
          action={{
            label: "Crear mi presupuesto",
            href: "/presupuestos/nuevo",
          }}
        />
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{budget.name ?? "Presupuesto activo"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
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

      <Card className="p-6 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
        <p className="text-sm text-muted-foreground">Ingreso disponible</p>
        <p className="text-4xl font-semibold tracking-tight mt-1">{formatCurrency(available)}</p>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent>
            <p className="text-sm text-muted-foreground">Planeado</p>
            <p className="text-2xl font-semibold tracking-tight mt-1">{formatCurrency(totalPlanned)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent>
            <p className="text-sm text-muted-foreground">Real</p>
            <p className="text-2xl font-semibold tracking-tight mt-1">{formatCurrency(totalReal)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent>
            <p className="text-sm text-muted-foreground">Restante</p>
            <p className={`text-2xl font-semibold tracking-tight mt-1 ${remaining < 0 ? "text-red-600" : "text-emerald-600"}`}>
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

      <BudgetCategoryCards
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
        totalIncome={available}
        categoryPercentages={categoryPercentages}
      />

      <BudgetPlanFAB
        budgetId={budget.id}
        expenseCategories={expenseCategories}
        existingCategoryIds={budget.expensePlans.map((p) => p.expenseCategory.id)}
      />
    </div>
  );
}
