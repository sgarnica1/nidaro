"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createIncomeSource, updateIncomeSource, type SerializedIncomeSource } from "@/lib/actions/income";

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  source?: SerializedIncomeSource;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function IncomeForm({ source, children, open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };
  const [amountError, setAmountError] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { name: source?.name ?? "", amount: source?.amount ?? 0 },
  });

  const amount = form.watch("amount");

  useEffect(() => {
    if (open && !source) {
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [open, source]);

  async function onSubmit(values: FormValues) {
    if (values.amount === 0 || values.amount <= 0) {
      setAmountError(true);
      amountInputRef.current?.focus();
      setTimeout(() => setAmountError(false), 2000);
      return;
    }

    const result = source
      ? await updateIncomeSource(source.id, values)
      : await createIncomeSource(values);

    if (result.success) {
      setOpen(false);
      form.reset();
      toast.success("Ingreso guardado", {
        duration: 2500,
        style: {
          backgroundColor: "#10B981",
          color: "white",
        },
      });
    }
  }

  const displayAmount = amount > 0 ? amount.toFixed(2) : "";

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={setOpen}
      title={source ? "Editar ingreso" : "Nuevo ingreso"}
      trigger={children}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <div className="pt-5 pb-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <div className="flex items-center justify-center">
                          <span className="text-[24px] text-[#6B7280] mr-2">$</span>
                          <input
                            ref={amountInputRef}
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            placeholder="$0"
                            value={displayAmount}
                            onFocus={() => setAmountFocused(true)}
                            onBlur={() => setAmountFocused(false)}
                            onChange={(e) => {
                              const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                              field.onChange(val);
                              setAmountError(false);
                            }}
                            className={cn(
                              "w-full text-center text-[42px] font-bold bg-transparent border-none outline-none focus:outline-none",
                              "placeholder:text-[#D1D5DB] placeholder:text-[42px]",
                              amountError ? "text-[#DC2626] animate-[shake_0.5s]" : amountFocused ? "text-[#1C3D2E]" : "text-[#111111]",
                              "transition-colors"
                            )}
                          />
                          <span className="text-[12px] text-[#6B7280] ml-2 mt-2">MXN</span>
                        </div>
                        <div
                          className={cn(
                            "absolute bottom-0 left-0 right-0 h-[2px] transition-transform duration-300 origin-center",
                            amountError
                              ? "bg-[#DC2626] scale-x-100"
                              : amount > 0 || amountFocused
                              ? "bg-[#1C3D2E] scale-x-100"
                              : "bg-[#1C3D2E] scale-x-0"
                          )}
                        />
                      </div>
                    </FormControl>
                    {amountError && (
                      <p className="text-[12px] text-[#DC2626] text-center mt-2">Ingresa un monto</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="h-[1px] bg-[#F3F4F6]" />

            <div className="px-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Nombre (ej: Salario, Freelance...)"
                        className="h-[52px] bg-[#F8F8F6] border-none rounded-xl px-[14px] text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-[#F3F4F6] px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-[#6B7280] mb-3 block w-full text-center"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || amount === 0 || !form.watch("name")}
              className="w-full h-[52px] text-base font-bold rounded-[14px] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white disabled:bg-[#9CA3AF] disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {form.formState.isSubmitting ? "Guardando..." : "Guardar ingreso"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveSheet>
  );
}
