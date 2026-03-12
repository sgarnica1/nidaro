"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
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

export function IncomeCard({ totalIncome }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card className="rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] bg-muted/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Income</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
