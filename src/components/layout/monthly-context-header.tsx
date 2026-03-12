"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  totalSpent: number;
  totalPlanned: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MonthlyContextHeader({ totalSpent, totalPlanned }: Props) {
  const percentage = totalPlanned > 0 ? Math.min((totalSpent / totalPlanned) * 100, 100) : 0;
  const progressColor = percentage < 70 ? "#22C55E" : percentage < 90 ? "#F59E0B" : "#DC2626";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <Card className="rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] bg-muted/30">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Mes actual</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground tabular-nums">{formatCurrency(totalSpent)}</p>
                <p className="text-sm text-muted-foreground">gastado</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">de {formatCurrency(totalPlanned)} planeados</p>
            </div>

            <div className="relative">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: progressColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
