import { getBudgets } from "@/lib/actions/budgets";
import { getExpensesByBudget } from "@/lib/actions/expenses";
import { getExpenseCategories } from "@/lib/actions/expense-categories";
import { GastosClient } from "./gastos-client";
import { EmptyState } from "@/components/ui/empty-state";

function budgetLabel(b: { name: string | null; startDate: Date }): string {
  if (b.name) return b.name;
  const raw = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(b.startDate));
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ budgetId?: string }>;
}) {
  const { budgetId: selectedId } = await searchParams;

  const [rawBudgets, expenseCategories] = await Promise.all([
    getBudgets(),
    getExpenseCategories(),
  ]);

  if (rawBudgets.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Gastos</h1>
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

  const today = new Date();
  const activeBudget =
    rawBudgets.find((b) => new Date(b.startDate) <= today && new Date(b.endDate) >= today) ??
    rawBudgets[0];
  const selectedBudget =
    (selectedId ? rawBudgets.find((b) => b.id === selectedId) : null) ?? activeBudget;

  const expenses = await getExpensesByBudget(selectedBudget.id);

  return (
    <GastosClient
      expenses={expenses}
      expenseCategories={expenseCategories}
      budgetId={selectedBudget.id}
    />
  );
}
