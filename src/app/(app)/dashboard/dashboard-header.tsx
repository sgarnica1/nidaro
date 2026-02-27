"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  monthLabel: string;
  dateRange: string;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
};

export function DashboardHeader({ monthLabel, dateRange, onPrevious, onNext, canGoPrevious, canGoNext }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">{monthLabel}</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6]"
            onClick={onPrevious}
            disabled={!canGoPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6]"
            onClick={onNext}
            disabled={!canGoNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <p className="text-[12px] text-[#6B7280]">{dateRange}</p>
    </div>
  );
}
