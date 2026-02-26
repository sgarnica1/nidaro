import { getCategoriesWithPercentages } from "@/lib/actions/budget-structure";
import { StructureEditor } from "./structure-editor";

export default async function EstructuraPage() {
  const categories = await getCategoriesWithPercentages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Estructura del Presupuesto</h1>
        <p className="text-sm text-muted-foreground">
          Define qué porcentaje de tu ingreso va a cada categoría. Deben sumar 100%.
        </p>
      </div>
      <StructureEditor categories={categories} />
    </div>
  );
}
