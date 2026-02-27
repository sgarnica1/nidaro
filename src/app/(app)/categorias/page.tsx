import { getExpenseCategories, getBudgetCategoriesWithSubs } from "@/lib/actions/expense-categories";
import { CategoryPageHeader } from "./category-page-header";
import { CategoriasClient } from "./categorias-client";
import { MobileBackButton } from "@/components/ui/mobile-back-button";

export default async function CategoriasPage() {
  const [categories, budgetCategories] = await Promise.all([
    getExpenseCategories(),
    getBudgetCategoriesWithSubs(),
  ]);

  return (
    <div>
      <MobileBackButton href="/perfil" />
      <CategoryPageHeader budgetCategories={budgetCategories} />
      <CategoriasClient categories={categories} budgetCategories={budgetCategories} />
    </div>
  );
}
