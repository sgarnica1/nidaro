"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IncomeForm } from "./income-form";
import { toggleIncomeSource, deleteIncomeSource } from "@/lib/actions/income";
import type { IncomeSource } from "@/generated/prisma/client";

type Props = {
  sources: IncomeSource[];
};

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(amount)
  );
}

export function IncomeList({ sources }: Props) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    <div className="space-y-3">
      {sources.map((source) => (
        <Card key={source.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={source.isActive}
                onCheckedChange={() => handleToggle(source.id)}
                disabled={pending}
              />
              <div>
                <p className={source.isActive ? "font-medium" : "font-medium text-muted-foreground line-through"}>
                  {source.name}
                </p>
                <p className="text-sm text-muted-foreground">{formatCurrency(Number(source.amount))}</p>
              </div>
              {!source.isActive && (
                <Badge variant="secondary" className="text-xs">Inactivo</Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              <IncomeForm source={source}>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </IncomeForm>

              <Dialog open={deletingId === source.id} onOpenChange={(o) => !o && setDeletingId(null)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingId(source.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Eliminar ingreso</DialogTitle>
                    <DialogDescription>
                      ¿Eliminar &quot;{source.name}&quot;? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
                    <Button variant="destructive" onClick={() => handleDelete(source.id)}>Eliminar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
