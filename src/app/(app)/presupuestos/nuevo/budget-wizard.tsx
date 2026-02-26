"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createBudget } from "@/lib/actions/budgets";
import type { IncomeSource, BudgetTemplate } from "@/generated/prisma/client";

const schema = z.object({
  name: z.string().optional(),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  templateId: z.string().optional(),
  incomeSourceIds: z.array(z.string()).min(1, "Selecciona al menos un ingreso"),
  deductions: z.array(
    z.object({
      name: z.string().min(1, "El nombre es requerido"),
      type: z.enum(["PERCENTAGE", "FIXED"]),
      value: z.coerce.number().positive("Debe ser positivo"),
    })
  ).default([]),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  incomeSources: IncomeSource[];
  templates: BudgetTemplate[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function BudgetWizard({ incomeSources, templates }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [previewIncome, setPreviewIncome] = useState(0);

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      templateId: undefined,
      incomeSourceIds: [],
      deductions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deductions",
  });

  const selectedIncomeIds = form.watch("incomeSourceIds");
  const deductions = form.watch("deductions");

  const grossIncome = incomeSources
    .filter((s) => selectedIncomeIds.includes(s.id) && s.isActive)
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const totalDeductions = deductions.reduce((sum, d) => {
    const v = Number(d.value) || 0;
    return d.type === "PERCENTAGE" ? sum + (grossIncome * v) / 100 : sum + v;
  }, 0);

  const availableIncome = grossIncome - totalDeductions;

  function toggleIncome(id: string, checked: boolean) {
    const current = form.getValues("incomeSourceIds");
    form.setValue(
      "incomeSourceIds",
      checked ? [...current, id] : current.filter((x) => x !== id)
    );
    setPreviewIncome((p) => p + 1);
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createBudget(values);
      if (result.success) {
        toast.success("Presupuesto creado");
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>1. Información general</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Enero 2026..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de fin</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {templates.length > 0 && (
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plantilla (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin plantilla" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>2. Fuentes de ingreso</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {incomeSources.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tienes fuentes de ingreso. Agrega una en la sección de Ingresos.
              </p>
            )}
            {incomeSources.map((source) => (
              <div key={source.id} className="flex items-center gap-3">
                <Checkbox
                  id={source.id}
                  checked={selectedIncomeIds.includes(source.id)}
                  onCheckedChange={(c) => toggleIncome(source.id, !!c)}
                  disabled={!source.isActive}
                />
                <label htmlFor={source.id} className="flex-1 flex items-center justify-between cursor-pointer">
                  <span className={!source.isActive ? "text-muted-foreground line-through" : ""}>
                    {source.name}
                  </span>
                  <span className="text-sm font-medium">{formatCurrency(Number(source.amount))}</span>
                </label>
                {!source.isActive && <Badge variant="secondary" className="text-xs">Inactivo</Badge>}
              </div>
            ))}
            <FormField control={form.control} name="incomeSourceIds" render={() => (
              <FormItem><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>3. Deducciones</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "Diezmo", type: "PERCENTAGE", value: 10 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin deducciones.</p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_120px_100px_auto] gap-2 items-end">
                <FormField
                  control={form.control}
                  name={`deductions.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Nombre</FormLabel>}
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`deductions.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Tipo</FormLabel>}
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">%</SelectItem>
                          <SelectItem value="FIXED">Fijo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`deductions.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Valor</FormLabel>}
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ingreso bruto</span>
              <span>{formatCurrency(grossIncome)}</span>
            </div>
            {totalDeductions > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deducciones</span>
                <span className="text-destructive">- {formatCurrency(totalDeductions)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Ingreso disponible</span>
              <span className="text-primary">{formatCurrency(availableIncome)}</span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creando..." : "Crear presupuesto"}
        </Button>
      </form>
    </Form>
  );
}
