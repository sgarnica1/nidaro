import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getActiveBudget } from "@/lib/actions/budgets";
import { getExpensesByBudget } from "@/lib/actions/expenses";
import { getExpenseCategories } from "@/lib/actions/expense-categories";
import { ExpenseList } from "./expense-list";
import { FAB } from "./fab";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export default async function GastosPage() {
  const [budget, expenseCategories] = await Promise.all([
    getActiveBudget(),
    getExpenseCategories(),
  ]);

  if (!budget) {
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

  const expenses = await getExpensesByBudget(budget.id);
  const totalReal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gastos</h1>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatCurrency(totalReal)}</span>
          </p>
        </div>
      </div>

      <ExpenseList expenses={expenses} expenseCategories={expenseCategories} budgetId={budget.id} />
      <FAB budgetId={budget.id} expenseCategories={expenseCategories} />
    </div>
  );
}
