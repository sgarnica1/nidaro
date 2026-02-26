import { Card, CardContent } from "@/components/ui/card";
import { getTemplates } from "@/lib/actions/templates";
import { getExpenseCategories } from "@/lib/actions/expense-categories";
import { getIncomeSources } from "@/lib/actions/income";
import { TemplateCard } from "./template-card";
import { NewTemplateButton } from "./new-template-button";

export default async function PlantillasPage() {
  const [templates, expenseCategories, incomeSources] = await Promise.all([
    getTemplates(),
    getExpenseCategories(),
    getIncomeSources(),
  ]);

  const totalIncome = incomeSources
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plantillas</h1>
          <p className="text-sm text-muted-foreground">Estructuras de presupuesto reutilizables</p>
        </div>
        <NewTemplateButton />
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No tienes plantillas aún.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crea una plantilla para reutilizarla en tus presupuestos mensuales.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              expenseCategories={expenseCategories}
              totalIncome={totalIncome}
            />
          ))}
        </div>
      )}
    </div>
  );
}
