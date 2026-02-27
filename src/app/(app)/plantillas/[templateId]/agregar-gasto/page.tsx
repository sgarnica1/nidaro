import { getTemplate } from "@/lib/actions/templates";
import { getExpenseCategories, getBudgetCategoriesWithSubs } from "@/lib/actions/expense-categories";
import { AddExpenseToTemplatePageClient } from "./add-expense-page-client";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ categoria?: string }>;
};

export default async function AddExpenseToTemplatePage({ params, searchParams }: Props) {
  const { templateId } = await params;
  const { categoria } = await searchParams;

  const [template, expenseCategories, budgetCategories] = await Promise.all([
    getTemplate(templateId),
    getExpenseCategories(),
    getBudgetCategoriesWithSubs(),
  ]);

  if (!template) {
    redirect("/plantillas");
  }

  const existingCategoryIds = template.items.map((i) => i.expenseCategory.id);
  const filterBudgetCategoryId = categoria || undefined;

  return (
    <AddExpenseToTemplatePageClient
      templateId={templateId}
      templateName={template.name}
      expenseCategories={expenseCategories}
      budgetCategories={budgetCategories}
      existingItemCategoryIds={existingCategoryIds}
      filterBudgetCategoryId={filterBudgetCategoryId}
    />
  );
}
