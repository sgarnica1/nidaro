import { getCategoriesWithPercentages } from "@/lib/actions/budget-structure";
import { StructureEditor } from "./structure-editor";
import { MobileBackButton } from "@/components/ui/mobile-back-button";

export default async function EstructuraPage() {
  const categories = await getCategoriesWithPercentages();

  return (
    <div className="space-y-6">
      <MobileBackButton href="/perfil" />
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
