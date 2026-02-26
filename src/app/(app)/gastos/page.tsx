import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBudgets } from "@/lib/actions/budgets";
import { getExpensesByBudget } from "@/lib/actions/expenses";
import { getExpenseCategories } from "@/lib/actions/expense-categories";
import { ExpenseList } from "./expense-list";
import { FAB } from "./fab";
import { DesktopExpenseButton } from "./desktop-expense-button";
import { BudgetFilter } from "./budget-filter";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

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
        <h1 className="text-2xl font-semibold">Gastos</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <p className="text-muted-foreground">No tienes un presupuesto activo.</p>
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

  const today = new Date();
  const activeBudget =
    rawBudgets.find((b) => new Date(b.startDate) <= today && new Date(b.endDate) >= today) ??
    rawBudgets[0];
  const selectedBudget =
    (selectedId ? rawBudgets.find((b) => b.id === selectedId) : null) ?? activeBudget;

  const expenses = await getExpensesByBudget(selectedBudget.id);
  const totalReal = expenses.reduce((sum, e) => sum + e.amount, 0);

  const budgetOptions = rawBudgets.map((b) => ({ id: b.id, label: budgetLabel(b) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gastos</h1>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatCurrency(totalReal)}</span>
          </p>
        </div>
        <DesktopExpenseButton budgetId={selectedBudget.id} expenseCategories={expenseCategories} />
      </div>

      <BudgetFilter budgets={budgetOptions} selectedId={selectedBudget.id} />

      <ExpenseList expenses={expenses} expenseCategories={expenseCategories} budgetId={selectedBudget.id} />
      <FAB budgetId={selectedBudget.id} expenseCategories={expenseCategories} />
    </div>
  );
}
