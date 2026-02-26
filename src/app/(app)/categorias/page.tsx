import { getExpenseCategories, getBudgetCategoriesWithSubs } from "@/lib/actions/expense-categories";
import { CategoryList } from "./category-list";
import { CategoryPageHeader } from "./category-page-header";

export default async function CategoriasPage() {
  const [categories, budgetCategories] = await Promise.all([
    getExpenseCategories(),
    getBudgetCategoriesWithSubs(),
  ]);

  return (
    <div className="space-y-6">
      <CategoryPageHeader budgetCategories={budgetCategories} />
      <CategoryList categories={categories} budgetCategories={budgetCategories} />
    </div>
  );
}
