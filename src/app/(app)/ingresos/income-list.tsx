"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function IncomeList({ sources }: Props) {
  const isMobile = useIsMobile();
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<SerializedIncomeSource | null>(null);
  const [mobileActionSource, setMobileActionSource] = useState<SerializedIncomeSource | null>(null);

  function handleToggle(id: string) {
    startTransition(async () => {
      const result = await toggleIncomeSource(id);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDelete(id: string) {
    setDeletingId(null);
    startTransition(async () => {
      const result = await deleteIncomeSource(id);
      if (result.success) {
        toast.success("Ingreso eliminado");
      } else {
        toast.error(result.error);
      }
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No tienes fuentes de ingreso aún.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Agrega tu primer ingreso para comenzar.
          </p>
        </CardContent>
      </Card>
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
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleMobileEdit}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleMobileDelete}
            >
              <Trash2 className="h-4 w-4" />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={pending}
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
