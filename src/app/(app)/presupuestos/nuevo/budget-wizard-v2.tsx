"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { createBudget } from "@/lib/actions/budgets";
import { updateCategoryPercentages } from "@/lib/actions/budget-structure";
import type { SerializedIncomeSource } from "@/lib/actions/income";
import type { BudgetTemplate } from "@/generated/prisma/client";
import type { CategoryWithPercentage } from "@/lib/actions/budget-structure";
import { Step1GeneralInfo } from "./steps/step1-general-info";
import { Step2IncomeSources } from "./steps/step2-income-sources";
import { Step3Deductions } from "./steps/step3-deductions";
import { Step4Distribution } from "./steps/step4-distribution";
import { DateRangePickerSheet } from "./date-range-picker-sheet";

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
  incomeSources: SerializedIncomeSource[];
  templates: BudgetTemplate[];
  categories: CategoryWithPercentage[];
};

export function BudgetWizardV2({ incomeSources: initialSources, templates, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdBudgetName, setCreatedBudgetName] = useState("");
  const [createdBudgetAmount, setCreatedBudgetAmount] = useState(0);

  useEffect(() => {
    if (pathname !== "/presupuestos/nuevo") {
      return;
    }
    
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [pathname]);

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      templateId: undefined,
      incomeSourceIds: initialSources.filter((s) => s.isActive).map((s) => s.id),
      deductions: [],
    },
  });

  const selectedIncomeIds = form.watch("incomeSourceIds");
  const deductions = form.watch("deductions");
  const selectedIncome = initialSources.filter((s) => selectedIncomeIds.includes(s.id) && s.isActive);
  const grossIncome = selectedIncome.reduce((sum, s) => sum + s.amount, 0);
  
  const totalDeductions = deductions.reduce((sum, d) => {
    const v = Number(d.value) || 0;
    return d.type === "PERCENTAGE" ? sum + (grossIncome * v) / 100 : sum + v;
  }, 0);
  
  const availableIncome = grossIncome - totalDeductions;

  const canProceedStep1 = form.watch("startDate") && form.watch("endDate");
  const canProceedStep2 = selectedIncomeIds.length > 0;
  const canProceedStep3 = true;

  function handleDateRangeSelect(range: DateRange | undefined) {
    setDateRange(range);
    if (range?.from && range?.to) {
      form.setValue("startDate", range.from.toISOString().split("T")[0], { shouldValidate: true });
      form.setValue("endDate", range.to.toISOString().split("T")[0], { shouldValidate: true });
      setDateRangePickerOpen(false);
    }
  }

  function handleNext() {
    if (currentStep === 1 && canProceedStep1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedStep2) {
      setCurrentStep(3);
    } else if (currentStep === 3 && canProceedStep3) {
      setCurrentStep(4);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleCancel() {
    if (currentStep === 1) {
      setShowExitConfirm(true);
    } else {
      handleBack();
    }
  }

  async function handleFinish(percentages: { categoryId: string; percentage: number }[]) {
    startTransition(async () => {
      const values = form.getValues();
      
      const budgetResult = await createBudget(values);
      if (!budgetResult.success) {
        return;
      }

      const percentageResult = await updateCategoryPercentages(percentages);
      if (!percentageResult.success) {
        return;
      }

      const budgetName = values.name || format(new Date(values.startDate), "MMMM yyyy", { locale: es });
      setCreatedBudgetName(budgetName);
      setCreatedBudgetAmount(availableIncome);
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    });
  }

  const dateValue = form.watch("startDate") && form.watch("endDate")
    ? {
        from: new Date(form.watch("startDate")),
        to: new Date(form.watch("endDate")),
      }
    : undefined;

  if (pathname !== "/presupuestos/nuevo") {
    return null;
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8F8F6] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-6 animate-[scale-in_0.3s_ease-out]">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-[24px] font-bold text-[#111111] mb-2">¡Presupuesto creado!</h2>
          <p className="text-[15px] text-[#6B7280]">
            {createdBudgetName} · {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(createdBudgetAmount)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#F8F8F6] flex flex-col">
        <div className="bg-white border-b border-[#F3F4F6] pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 px-4">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={handleCancel}
              className="text-[15px] text-[#6B7280]"
            >
              {currentStep === 1 ? "Cancelar" : <ArrowLeft className="h-5 w-5" />}
            </button>
            <span className="text-[13px] text-[#6B7280]">
              {currentStep} de 4
            </span>
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !canProceedStep2) ||
                (currentStep === 3 && !canProceedStep3) ||
                currentStep === 4
              }
              className={cn(
                "text-[15px] font-bold",
                (currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2) || (currentStep === 3 && !canProceedStep3) || currentStep === 4
                  ? "text-[#9CA3AF]"
                  : "text-[#1C3D2E]"
              )}
            >
              {currentStep === 4 ? "" : "Siguiente →"}
            </button>
          </div>
          <div className="mt-3 h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1C3D2E] transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          {currentStep === 1 && (
            <Step1GeneralInfo
              form={form}
              templates={templates}
              dateRange={dateValue}
              onDateRangeClick={() => setDateRangePickerOpen(true)}
            />
          )}
          {currentStep === 2 && (
            <Step2IncomeSources
              incomeSources={initialSources}
              selectedIds={selectedIncomeIds}
              onToggle={(id, checked) => {
                const current = form.getValues("incomeSourceIds");
                form.setValue(
                  "incomeSourceIds",
                  checked ? [...current, id] : current.filter((x) => x !== id),
                  { shouldValidate: true }
                );
              }}
              total={grossIncome}
            />
          )}
          {currentStep === 3 && (
            <Step3Deductions
              deductions={deductions.map((d, i) => ({ id: i.toString(), ...d }))}
              onDeductionsChange={(newDeductions) => {
                form.setValue(
                  "deductions",
                  newDeductions.map(({ id, ...d }) => d),
                  { shouldValidate: true }
                );
              }}
              grossIncome={grossIncome}
            />
          )}
          {currentStep === 4 && (
            <Step4Distribution
              categories={categories}
              availableIncome={availableIncome}
              onFinish={handleFinish}
              pending={pending}
            />
          )}
        </div>
      </div>

      <DateRangePickerSheet
        open={dateRangePickerOpen}
        onOpenChange={setDateRangePickerOpen}
        dateRange={dateValue}
        onSelect={handleDateRangeSelect}
      />

      {showExitConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-[18px] font-bold text-[#111111]">¿Salir?</h3>
            <p className="text-[15px] text-[#6B7280]">Perderás los cambios</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  router.back();
                }}
                className="flex-1 h-12 rounded-xl border border-[#E5E7EB] text-[#DC2626] font-medium"
              >
                Salir
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 h-12 rounded-xl bg-[#1C3D2E] text-white font-medium"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
