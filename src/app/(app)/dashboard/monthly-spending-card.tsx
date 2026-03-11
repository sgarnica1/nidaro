"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  totalSpent: number;
  totalPlanned: number;
  remaining: number;
  totalIncome: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MonthlySpendingCard({ totalSpent, totalPlanned, remaining, totalIncome }: Props) {
  const [displayedAmount, setDisplayedAmount] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  const percentage = totalPlanned > 0 ? Math.min((totalSpent / totalPlanned) * 100, 100) : 0;
  const calculatedRemaining = totalPlanned - totalSpent;

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = totalSpent / steps;
    const progressIncrement = percentage / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayedAmount(increment * currentStep);
        setProgressValue(progressIncrement * currentStep);
      } else {
        setDisplayedAmount(totalSpent);
        setProgressValue(percentage);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalSpent, percentage]);

  const progressColor = percentage < 70 ? "#22C55E" : percentage < 90 ? "#F59E0B" : "#DC2626";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card className="rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Gasto del mes</h2>
              <div className="space-y-1">
                <motion.p
                  key={totalSpent}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl font-bold tracking-tight text-foreground tabular-nums"
                >
                  {formatCurrency(displayedAmount)}
                </motion.p>
                <p className="text-sm text-muted-foreground">gastado</p>
                <p className="text-sm text-muted-foreground">de {formatCurrency(totalPlanned)} planeados</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: progressColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressValue}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Restante:{" "}
                  <span
                    className={cn(
                      "tabular-nums",
                      calculatedRemaining < 0 ? "text-destructive" : "text-[#22C55E]"
                    )}
                  >
                    {formatCurrency(calculatedRemaining)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Ingreso del mes: <span className="font-medium text-foreground">{formatCurrency(totalIncome)}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
