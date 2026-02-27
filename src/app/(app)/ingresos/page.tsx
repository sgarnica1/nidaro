import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIncomeSources } from "@/lib/actions/income";
import { IncomeForm } from "./income-form";
import { IncomeFAB } from "./income-fab";
import { IngresosClient } from "./ingresos-client";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export default async function IngresosPage() {
  const sources = await getIncomeSources();
  const totalActive = sources
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ingresos</h1>
          <p className="text-sm text-muted-foreground">Gestiona tus fuentes de ingreso</p>
        </div>
        <IncomeForm>
          <Button className="hidden md:flex bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Agregar ingreso
          </Button>
        </IncomeForm>
      </div>

      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">Total ingreso activo</p>
          <p className="text-3xl font-semibold mt-1">{formatCurrency(totalActive)}</p>
        </CardContent>
      </Card>

      <IngresosClient sources={sources} totalActive={totalActive} />
      <IncomeFAB />
    </div>
  );
}
