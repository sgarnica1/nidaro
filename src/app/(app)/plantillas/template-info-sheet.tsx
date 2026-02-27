"use client";

import { Info } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function TemplateInfoSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-[#6B7280] hover:text-[#111111]">
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-[18px] font-bold">¿Qué son las plantillas?</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4 text-[15px] text-[#6B7280] leading-relaxed">
          <p>
            Las plantillas te permiten guardar estructuras de presupuesto reutilizables. Una vez que creas una plantilla con tus categorías y montos, puedes usarla para crear nuevos presupuestos mensuales rápidamente.
          </p>
          <p>
            Esto es especialmente útil si tus gastos son similares cada mes. En lugar de configurar todo desde cero, simplemente selecciona una plantilla y ajusta los montos según sea necesario.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
