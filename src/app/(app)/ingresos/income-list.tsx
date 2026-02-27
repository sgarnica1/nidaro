"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Pencil, Trash2, Wallet } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IncomeForm } from "./income-form";
import { toggleIncomeSource, deleteIncomeSource, type SerializedIncomeSource } from "@/lib/actions/income";
import { cn } from "@/lib/utils";

type Props = {
  sources: SerializedIncomeSource[];
  totalActive: number;
  onAddIncome?: () => void;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function IncomeList({ sources, totalActive, onAddIncome }: Props) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<SerializedIncomeSource | null>(null);
  const [pressedRow, setPressedRow] = useState<string | null>(null);

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleIncomeSource(id);
    });
  }

  function handleDelete(id: string) {
    setDeletingId(null);
    startTransition(async () => {
      await deleteIncomeSource(id);
    });
  }

  function handleRowPress(id: string) {
    setPressedRow(id);
    setTimeout(() => setPressedRow(null), 150);
    setTimeout(() => setEditingSource(sources.find((s) => s.id === id) ?? null), 150);
  }

  if (sources.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Agrega tu primera fuente de ingreso"
        description="Registra tus ingresos para tener una visión completa de tus finanzas y crear presupuestos más precisos."
        action={
          onAddIncome
            ? {
              label: "Agregar ingreso",
              onClick: onAddIncome,
            }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        {sources.map((source, index) => {
          const percentage = totalActive > 0 ? ((source.amount / totalActive) * 100).toFixed(0) : "0";
          const isActive = source.isActive;

          return (
            <div key={source.id}>
              {index > 0 && <div className="h-px bg-[#F3F4F6] ml-14" />}
              <div
                onClick={() => handleRowPress(source.id)}
                className={cn(
                  "w-full flex items-center justify-between h-16 px-5 transition-colors cursor-pointer",
                  pressedRow === source.id ? "bg-[#F3F4F6]" : "bg-white hover:bg-[#F3F4F6]"
                )}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-full bg-[#EAF2EC] flex items-center justify-center shrink-0">
                    <span className="text-[13px] font-semibold text-[#1C3D2E]">
                      {getInitials(source.name)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-[15px] font-semibold mb-0.5",
                      isActive ? "text-[#111111]" : "text-[#6B7280] line-through"
                    )}>
                      {source.name}
                    </p>
                    <p className="text-[13px] text-[#6B7280]">
                      {formatCurrency(source.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[12px] text-[#6B7280] font-medium">
                      {percentage}%
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => handleToggle(source.id)}
                        disabled={pending}
                        className="data-[state=checked]:bg-[#1C3D2E]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingSource && (
        <IncomeForm
          source={editingSource}
          open={!!editingSource}
          onOpenChange={(o) => !o && setEditingSource(null)}
        >
          <span className="sr-only" />
        </IncomeForm>
      )}

      <Dialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-semibold">Eliminar ingreso</DialogTitle>
            <DialogDescription className="text-[15px] text-[#6B7280]">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-6">
            <Button
              variant="outline"
              className="h-12 text-base flex-1 rounded-xl"
              onClick={() => setDeletingId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              className="h-12 text-base flex-1 rounded-xl bg-[#DC2626] hover:bg-[#DC2626]/90"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
