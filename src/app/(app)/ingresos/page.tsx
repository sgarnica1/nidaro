import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIncomeSources } from "@/lib/actions/income";
import { IncomeForm } from "./income-form";
import { IncomeFAB } from "./income-fab";
import { IngresosClient } from "./ingresos-client";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function IngresosPage() {
  const sources = await getIncomeSources();
  const totalActive = sources
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111111] mb-1">Ingresos</h1>
          <p className="text-[15px] text-[#6B7280]">Gestiona tus fuentes de ingreso</p>
        </div>
        <IncomeForm>
          <Button className="hidden md:flex bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white h-10 px-4 rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Agregar ingreso
          </Button>
        </IncomeForm>
      </div>

      <div className="bg-[#1C3D2E] rounded-[20px] p-6 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]">
        <p className="text-[13px] font-medium text-white/60 uppercase tracking-[0.8px] mb-2">
          Total ingreso activo
        </p>
        <p className="text-[38px] font-bold text-white tracking-tight leading-none">
          {formatCurrency(totalActive)}
        </p>
      </div>

      <IngresosClient sources={sources} totalActive={totalActive} />
      <IncomeFAB />
    </div>
  );
}
