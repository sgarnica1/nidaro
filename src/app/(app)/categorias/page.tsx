import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getExpenseCategories, getBudgetCategoriesWithSubs } from "@/lib/actions/expense-categories";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";

export default async function CategoriasPage() {
  const [categories, budgetCategories] = await Promise.all([
    getExpenseCategories(),
    getBudgetCategoriesWithSubs(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categorías de Gastos</h1>
          <p className="text-sm text-muted-foreground">Organiza tus gastos en categorías</p>
        </div>
        <CategoryForm budgetCategories={budgetCategories}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva
          </Button>
        </CategoryForm>
      </div>
      <CategoryList categories={categories} budgetCategories={budgetCategories} />
    </div>
  );
}
