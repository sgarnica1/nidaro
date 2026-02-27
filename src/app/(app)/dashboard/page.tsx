import { EmptyState } from "@/components/ui/empty-state";
import { getActiveBudget, getBudgets, getBudgetById } from "@/lib/actions/budgets";
import { getExpensesByBudget } from "@/lib/actions/expenses";
import { getCategoriesWithPercentages } from "@/lib/actions/budget-structure";
import { getExpenseCategories } from "@/lib/actions/expense-categories";
import { DashboardPageClient } from "./dashboard-page-client";



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


  const budgetOptions = allBudgets.map((b) => ({
    id: b.id,
    label: budgetLabel(b),
    startDate: b.startDate,
    endDate: b.endDate,
  }));

  const currentBudgetIndex = budgetOptions.findIndex((b) => b.id === budget.id);

  return (
    <DashboardPageClient
      budgetId={budget.id}
      budgetName={budget.name}
      startDate={budget.startDate}
      endDate={budget.endDate}
      available={available}
      totalPlanned={totalPlanned}
      totalReal={totalReal}
      remaining={remaining}
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
      expenses={expenses}
      totalIncome={available}
      categoryPercentages={categoryPercentages}
      expenseCategories={expenseCategories}
      budgetOptions={budgetOptions}
    />
  );
}
