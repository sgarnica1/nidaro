import { getIncomeSources } from "@/lib/actions/income";
import { getTemplates } from "@/lib/actions/templates";
import { getCategoriesWithPercentages } from "@/lib/actions/budget-structure";
import { BudgetWizardV2 } from "./budget-wizard-v2";

export default async function NuevoPresupuestoPage() {
  try {
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
  } catch (error) {
    console.error("Error loading budget wizard data:", error);
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Error al cargar</h1>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Ocurrió un error inesperado"}
          </p>
        </div>
      </div>
    );
  }
}
