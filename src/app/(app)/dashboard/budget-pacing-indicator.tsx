"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  totalSpent: number;
  totalPlanned: number;
  startDate: Date;
  endDate: Date;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetPacingIndicator({ totalSpent, totalPlanned, startDate, endDate }: Props) {
  const pacingData = useMemo(() => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const expectedSpent = totalPlanned * (daysElapsed / totalDays);
    const difference = totalSpent - expectedSpent;
    const isAhead = difference > 0;

    return {
      expectedSpent,
      difference: Math.abs(difference),
      isAhead,
      daysElapsed,
      totalDays,
    };
  }, [totalSpent, totalPlanned, startDate, endDate]);

  if (pacingData.daysElapsed <= 0 || pacingData.daysElapsed >= pacingData.totalDays) {
    return null;
  }

  return (
    <Card className="rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]">
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Budget Pacing</p>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5",
                pacingData.isAhead ? "border-destructive/20 text-destructive" : "border-[#22C55E]/20 text-[#22C55E]"
              )}
            >
              {pacingData.isAhead ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  Ahead
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  Behind
                </>
              )}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">You should have spent</p>
              <p className="font-semibold text-foreground tabular-nums">{formatCurrency(pacingData.expectedSpent)}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">You spent</p>
              <p className="font-semibold text-foreground tabular-nums">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="h-px bg-border mt-2" />
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Difference</p>
              <p
                className={cn(
                  "font-semibold tabular-nums",
                  pacingData.isAhead ? "text-destructive" : "text-[#22C55E]"
                )}
              >
                {pacingData.isAhead ? "+" : "-"}
                {formatCurrency(pacingData.difference)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
