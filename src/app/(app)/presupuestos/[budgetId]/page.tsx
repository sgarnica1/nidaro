import { notFound } from "next/navigation";
import { getBudgetById } from "@/lib/actions/budgets";
import { getExpenseCategories, getBudgetCategoriesWithSubs } from "@/lib/actions/expense-categories";
import { BudgetDetailPageClient } from "./budget-detail-page-client";

type Props = {
  params: Promise<{ budgetId: string }>;
};

export default async function BudgetDetailPageServer({ params }: Props) {
  const { budgetId } = await params;
  const [budget, expenseCategories, budgetCategories] = await Promise.all([
    getBudgetById(budgetId),
    getExpenseCategories(),
    getBudgetCategoriesWithSubs(),
  ]);

  if (!budget) {
    notFound();
  }

  return (
    <BudgetDetailPageClient
      budget={budget}
      expenseCategories={expenseCategories}
      budgetCategories={budgetCategories}
      totalIncome={budget.totalIncome}
    />
  );
}
