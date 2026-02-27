import { getIncomeSources } from "@/lib/actions/income";
import { getTemplates } from "@/lib/actions/templates";
import { getCategoriesWithPercentages } from "@/lib/actions/budget-structure";
import { BudgetWizardV2 } from "./budget-wizard-v2";

export default async function NuevoPresupuestoPage() {
  const [incomeSources, templates, categories] = await Promise.all([
    getIncomeSources(),
    getTemplates(),
    getCategoriesWithPercentages(),
  ]);

  return (
    <BudgetWizardV2
      incomeSources={incomeSources}
      templates={templates.map((t) => ({ id: t.id, userId: t.userId, name: t.name }))}
      categories={categories}
    />
  );
}
