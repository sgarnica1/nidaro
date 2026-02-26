import { getIncomeSources } from "@/lib/actions/income";
import { getTemplates } from "@/lib/actions/templates";
import { BudgetWizard } from "./budget-wizard";

export default async function NuevoPresupuestoPage() {
  const [incomeSources, templates] = await Promise.all([
    getIncomeSources(),
    getTemplates(),
  ]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo Presupuesto</h1>
        <p className="text-sm text-muted-foreground">
          Configura tu presupuesto mensual paso a paso
        </p>
      </div>
      <BudgetWizard incomeSources={incomeSources} templates={templates.map((t) => ({ id: t.id, userId: t.userId, name: t.name }))} />
    </div>
  );
}
