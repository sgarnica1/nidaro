"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createBudget } from "@/lib/actions/budgets";
import { createIncomeSource } from "@/lib/actions/income";
import type { IncomeSource, BudgetTemplate } from "@/generated/prisma/client";

const schema = z.object({
  name: z.string().optional(),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  templateId: z.string().optional(),
  incomeSourceIds: z.array(z.string()).min(1, "Selecciona al menos un ingreso"),
  deductions: z
    .array(
      z.object({
        name: z.string().min(1, "El nombre es requerido"),
        type: z.enum(["PERCENTAGE", "FIXED"]),
        value: z.coerce.number().positive("Debe ser positivo"),
      })
    )
    .default([]),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  incomeSources: IncomeSource[];
  templates: BudgetTemplate[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

export function BudgetWizard({ incomeSources: initialSources, templates }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Local income sources — starts from server-fetched, grows as user adds inline
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(initialSources);

  // Range date picker state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Inline income form state
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [newIncomeName, setNewIncomeName] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [addingIncome, startAddingIncome] = useTransition();

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
      checked ? [...current, id] : current.filter((x) => x !== id),
      { shouldValidate: true }
    );
  }

  function handleDateRangeSelect(range: DateRange | undefined) {
    setDateRange(range);
    form.setValue("startDate", range?.from ? range.from.toISOString() : "", {
      shouldValidate: true,
    });
    form.setValue("endDate", range?.to ? range.to.toISOString() : "", {
      shouldValidate: true,
    });
    if (range?.from && range?.to) setCalendarOpen(false);
  }

  function handleAddIncome() {
    if (!newIncomeName.trim() || !newIncomeAmount) return;
    startAddingIncome(async () => {
      const result = await createIncomeSource({
        name: newIncomeName.trim(),
        amount: parseFloat(newIncomeAmount),
      });
      if (!result.success) {
        toast.error(result.error ?? "Error al agregar ingreso");
        return;
      }
      const created = result.data;
      setIncomeSources((prev) => [...prev, created]);
      // Auto-select the newly added income source
      const current = form.getValues("incomeSourceIds");
      form.setValue("incomeSourceIds", [...current, created.id], {
        shouldValidate: true,
      });
      setNewIncomeName("");
      setNewIncomeAmount("");
      setShowIncomeForm(false);
      toast.success(`"${created.name}" agregado y seleccionado`);
    });
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

        {/* ── 1. Información general ── */}
        <Card>
          <CardHeader>
            <CardTitle>1. Información general</CardTitle>
          </CardHeader>
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

            {/* Range Date Picker */}
            <FormField
              control={form.control}
              name="startDate"
              render={() => (
                <FormItem>
                  <FormLabel>Período del presupuesto</FormLabel>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start px-3 font-normal text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <span>
                              {format(dateRange.from, "dd MMM yyyy", { locale: es })}
                              {" – "}
                              {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                            </span>
                          ) : (
                            format(dateRange.from, "dd MMM yyyy", { locale: es })
                          )
                        ) : (
                          <span className="text-muted-foreground">
                            Selecciona un rango de fechas
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        numberOfMonths={2}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  {/* Show validation errors for both date fields */}
                  <FormMessage />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={() => <FormMessage />}
                  />
                </FormItem>
              )}
            />

            {templates.length > 0 && (
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plantilla (opcional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin plantilla" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
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

        {/* ── 2. Fuentes de ingreso ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>2. Fuentes de ingreso</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowIncomeForm((v) => !v)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Inline add income form */}
            {showIncomeForm && (
              <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
                <p className="text-sm font-medium">Nueva fuente de ingreso</p>
                <div className="grid grid-cols-[1fr_140px] gap-2">
                  <Input
                    placeholder="Nombre (ej: Salario)"
                    value={newIncomeName}
                    onChange={(e) => setNewIncomeName(e.target.value)}
                    disabled={addingIncome}
                  />
                  <Input
                    type="number"
                    placeholder="Monto"
                    min="0"
                    step="0.01"
                    value={newIncomeAmount}
                    onChange={(e) => setNewIncomeAmount(e.target.value)}
                    disabled={addingIncome}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddIncome}
                    disabled={
                      addingIncome ||
                      !newIncomeName.trim() ||
                      !newIncomeAmount
                    }
                  >
                    {addingIncome ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowIncomeForm(false);
                      setNewIncomeName("");
                      setNewIncomeAmount("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {incomeSources.length === 0 && !showIncomeForm && (
              <p className="text-sm text-muted-foreground">
                No tienes fuentes de ingreso.{" "}
                <button
                  type="button"
                  className="underline text-foreground"
                  onClick={() => setShowIncomeForm(true)}
                >
                  Agrega una aquí
                </button>{" "}
                o ve a la sección de Ingresos.
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
                <label
                  htmlFor={source.id}
                  className="flex-1 flex items-center justify-between cursor-pointer"
                >
                  <span
                    className={
                      !source.isActive
                        ? "text-muted-foreground line-through"
                        : ""
                    }
                  >
                    {source.name}
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(Number(source.amount))}
                  </span>
                </label>
                {!source.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactivo
                  </Badge>
                )}
              </div>
            ))}

            <FormField
              control={form.control}
              name="incomeSourceIds"
              render={() => <FormItem><FormMessage /></FormItem>}
            />
          </CardContent>
        </Card>

        {/* ── 3. Deducciones ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>3. Deducciones</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ name: "Diezmo", type: "PERCENTAGE", value: 10 })
                }
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
              <div
                key={field.id}
                className="grid grid-cols-[1fr_120px_100px_auto] gap-2 items-end"
              >
                <FormField
                  control={form.control}
                  name={`deductions.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Nombre</FormLabel>}
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
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
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Resumen ── */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ingreso bruto</span>
              <span>{formatCurrency(grossIncome)}</span>
            </div>
            {totalDeductions > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deducciones</span>
                <span className="text-destructive">
                  - {formatCurrency(totalDeductions)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Ingreso disponible</span>
              <span className="text-primary">
                {formatCurrency(availableIncome)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creando...
            </>
          ) : (
            "Crear presupuesto"
          )}
        </Button>
      </form>
    </Form>
  );
}
