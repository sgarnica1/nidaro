import { getIncomeSources } from "@/lib/actions/income";
import { getTemplates } from "@/lib/actions/templates";
import { BudgetWizard } from "./budget-wizard";

export default async function NuevoPresupuestoPage() {
  const [incomeSources, templates] = await Promise.all([
    getIncomeSources(),
    getTemplates(),
  ]);

  return (
    <div className="px-5 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#111111] mb-1">Nuevo Presupuesto</h1>
        <p className="text-[15px] text-[#6B7280]">
          Configura tu presupuesto mensual paso a paso
        </p>
      </div>
      <BudgetWizard incomeSources={incomeSources} templates={templates.map((t) => ({ id: t.id, userId: t.userId, name: t.name }))} />
    </div>
  );
}
