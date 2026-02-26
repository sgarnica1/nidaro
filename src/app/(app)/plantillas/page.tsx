import { getTemplates } from "@/lib/actions/templates";
import { getExpenseCategories, getBudgetCategoriesWithSubs } from "@/lib/actions/expense-categories";
import { getIncomeSources } from "@/lib/actions/income";
import { TemplatesClient } from "./templates-client";

export default async function PlantillasPage() {
  const [templates, expenseCategories, budgetCategories, incomeSources] = await Promise.all([
    getTemplates(),
    getExpenseCategories(),
    getBudgetCategoriesWithSubs(),
    getIncomeSources(),
  ]);

  const totalIncome = incomeSources
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <TemplatesClient
      templates={templates}
      expenseCategories={expenseCategories}
      budgetCategories={budgetCategories}
      totalIncome={totalIncome}
    />
  );
}
