"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2, Wallet } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useIsMobile } from "@/hooks/use-is-mobile";

type Props = {
  sources: SerializedIncomeSource[];
  onAddIncome?: () => void;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function IncomeList({ sources, onAddIncome }: Props) {
  const isMobile = useIsMobile();
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<SerializedIncomeSource | null>(null);
  const [mobileActionSource, setMobileActionSource] = useState<SerializedIncomeSource | null>(null);

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

  function handleMobileEdit() {
    const source = mobileActionSource;
    setMobileActionSource(null);
    setTimeout(() => setEditingSource(source), 150);
  }

  function handleMobileDelete() {
    const source = mobileActionSource;
    setMobileActionSource(null);
    setTimeout(() => setDeletingId(source?.id ?? null), 150);
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
      <div className="divide-y rounded-lg border overflow-hidden">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Switch
                checked={source.isActive}
                onCheckedChange={() => handleToggle(source.id)}
                disabled={pending}
                onClick={(e) => e.stopPropagation()}
              />
              <div
                className="min-w-0"
                role={isMobile ? "button" : undefined}
                tabIndex={isMobile ? 0 : undefined}
                onClick={isMobile ? () => setMobileActionSource(source) : undefined}
                onKeyDown={isMobile ? (e) => e.key === "Enter" && setMobileActionSource(source) : undefined}
              >
                <p className={source.isActive ? "font-medium" : "font-medium text-muted-foreground line-through"}>
                  {source.name}
                </p>
                <p className="text-sm text-muted-foreground">{formatCurrency(source.amount)}</p>
              </div>
              {!source.isActive && (
                <Badge variant="secondary" className="text-xs">Inactivo</Badge>
              )}
            </div>

            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingSource(source)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeletingId(source.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
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

      <Sheet open={!!mobileActionSource} onOpenChange={(o) => !o && setMobileActionSource(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl border-t px-4 pt-6 pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base">{mobileActionSource?.name}</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base" onClick={handleMobileEdit}>
              <Pencil className="h-5 w-5" />
              Editar
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-base text-destructive hover:text-destructive"
              onClick={handleMobileDelete}
            >
              <Trash2 className="h-5 w-5" />
              Eliminar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar ingreso</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-12 text-base flex-1" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={pending}
              className="h-12 text-base flex-1"
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
