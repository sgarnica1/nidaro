import { getExpenseCategories, getBudgetCategoriesWithSubs } from "@/lib/actions/expense-categories";
import { CategoryPageHeader } from "./category-page-header";
import { CategoriasClient } from "./categorias-client";

export default async function CategoriasPage() {
  const [categories, budgetCategories] = await Promise.all([
    getExpenseCategories(),
    getBudgetCategoriesWithSubs(),
  ]);

  return (
    <div className="space-y-6">
      <CategoryPageHeader budgetCategories={budgetCategories} />
      <CategoriasClient categories={categories} budgetCategories={budgetCategories} />
    </div>
  );
}
