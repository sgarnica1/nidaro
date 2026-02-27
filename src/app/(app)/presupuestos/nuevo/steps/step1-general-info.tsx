"use client";

import { useRef, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { BudgetTemplate } from "@/generated/prisma/client";
import type { DateRange } from "react-day-picker";

type Props = {
  form: UseFormReturn<{
    name?: string;
    startDate: string;
    endDate: string;
    templateId?: string;
    incomeSourceIds: string[];
    deductions: Array<{
      name: string;
      type: "PERCENTAGE" | "FIXED";
      value: number;
    }>;
  }>;
  templates: BudgetTemplate[];
  dateRange: DateRange | undefined;
  onDateRangeClick: () => void;
};

export function Step1GeneralInfo({ form, templates, dateRange, onDateRangeClick }: Props) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const useTemplate = !!form.watch("templateId");

  useEffect(() => {
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  }, []);

  const formattedDateRange = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "d MMM", { locale: es })} – ${format(dateRange.to, "d MMM yyyy", { locale: es })}`
    : "Selecciona fechas";

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-[26px] font-bold text-[#111111] mb-2">¿Cómo se llama?</h1>
      <p className="text-[15px] text-[#6B7280] mb-8">Ponle un nombre a tu presupuesto</p>

      <div className="mb-6">
        <input
          ref={nameInputRef}
          type="text"
          placeholder="Ej: Febrero 2026"
          value={form.watch("name") || ""}
          onChange={(e) => form.setValue("name", e.target.value)}
          className="w-full text-[20px] bg-transparent border-none border-b-[1.5px] border-[#E5E7EB] pb-2 outline-none focus:border-[#1C3D2E] transition-colors placeholder:text-[#9CA3AF]"
        />
      </div>

      <button
        type="button"
        onClick={onDateRangeClick}
        className="w-full bg-white rounded-[14px] shadow-sm border border-[#E5E7EB] h-[56px] flex items-center px-4 mb-6"
      >
        <CalendarIcon className="h-5 w-5 text-[#1C3D2E] mr-3" />
        <span className="flex-1 text-left text-[15px] font-medium text-[#111111]">
          {formattedDateRange}
        </span>
        <ChevronRight className="h-5 w-5 text-[#6B7280]" />
      </button>

      {templates.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[15px] font-medium text-[#111111]">¿Usar una plantilla?</span>
            <Switch
              checked={useTemplate}
              onCheckedChange={(checked) => {
                if (!checked) {
                  form.setValue("templateId", undefined);
                } else if (templates.length > 0) {
                  form.setValue("templateId", templates[0].id);
                }
              }}
            />
          </div>

          {useTemplate && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {templates.map((template) => {
                const isSelected = form.watch("templateId") === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => form.setValue("templateId", template.id)}
                    className={cn(
                      "h-9 px-3 rounded-full flex items-center shrink-0 transition-all",
                      isSelected
                        ? "border border-[#1C3D2E] bg-[#1C3D2E]/12 text-[#1C3D2E]"
                        : "bg-[#F3F4F6] text-[#6B7280] border border-transparent"
                    )}
                  >
                    <span className="text-sm font-medium">{template.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
