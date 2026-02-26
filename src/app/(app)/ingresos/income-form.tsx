"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createIncomeSource, updateIncomeSource } from "@/lib/actions/income";
import type { IncomeSource } from "@/generated/prisma/client";

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  source?: IncomeSource;
  children: React.ReactNode;
};

export function IncomeForm({ source, children }: Props) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { name: source?.name ?? "", amount: source ? Number(source.amount) : 0 },
  });

  async function onSubmit(values: FormValues) {
    const result = source
      ? await updateIncomeSource(source.id, values)
      : await createIncomeSource(values);

    if (result.success) {
      toast.success(source ? "Ingreso actualizado" : "Ingreso agregado");
      setOpen(false);
      form.reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{source ? "Editar ingreso" : "Nuevo ingreso"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Salario, Freelance..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto mensual</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
