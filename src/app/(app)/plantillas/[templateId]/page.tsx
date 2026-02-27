import { getTemplate } from "@/lib/actions/templates";
import { getExpenseCategories, getBudgetCategoriesWithSubs } from "@/lib/actions/expense-categories";
import { getIncomeSources } from "@/lib/actions/income";
import { TemplateDetailPage } from "./template-detail-page-client";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function TemplateDetailPageServer({ params }: Props) {
  const { templateId } = await params;

  const [template, expenseCategories, budgetCategories, incomeSources] = await Promise.all([
    getTemplate(templateId),
    getExpenseCategories(),
    getBudgetCategoriesWithSubs(),
    getIncomeSources(),
  ]);

  if (!template) {
    redirect("/plantillas");
  }

  const totalIncome = incomeSources
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <TemplateDetailPage
      template={template}
      expenseCategories={expenseCategories}
      budgetCategories={budgetCategories}
      totalIncome={totalIncome}
    />
  );
}
