"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
};

export function DateRangePickerSheet({ open, onOpenChange, dateRange, onSelect }: Props) {
  const handleSelect = (range: DateRange | undefined) => {
    onSelect(range);
  };

  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title="Seleccionar período" showDragHandle={true}>
      <div className="px-4 pb-4">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={1}
          locale={es}
          className="rounded-lg"
        />
        {dateRange?.from && dateRange?.to && (
          <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] text-[#6B7280] mb-1">Desde</p>
                <p className="text-[15px] font-medium text-[#111111]">
                  {format(dateRange.from, "d MMMM yyyy", { locale: es })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-[#6B7280] mb-1">Hasta</p>
                <p className="text-[15px] font-medium text-[#111111]">
                  {format(dateRange.to, "d MMMM yyyy", { locale: es })}
                </p>
              </div>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full h-[52px] rounded-[14px] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white font-bold"
            >
              Confirmar
            </Button>
          </div>
        )}
      </div>
    </ResponsiveSheet>
  );
}
