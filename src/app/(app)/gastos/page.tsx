import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBudgets } from "@/lib/actions/budgets";
import { getExpensesByBudget } from "@/lib/actions/expenses";
import { getExpenseCategories } from "@/lib/actions/expense-categories";
import { GastosClient } from "./gastos-client";

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
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold tracking-tight">Gastos</h1>
          <Card className="rounded-2xl border border-border/40 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <Receipt className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes un presupuesto activo.</p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/presupuestos/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear presupuesto
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
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
    <GastosClient
      expenses={expenses}
      expenseCategories={expenseCategories}
      budgetId={selectedBudget.id}
      budgetOptions={budgetOptions}
      selectedBudgetId={selectedBudget.id}
      totalReal={totalReal}
    />
  );
}
