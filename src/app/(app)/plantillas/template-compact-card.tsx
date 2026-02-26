"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TemplateWithItems } from "@/lib/actions/templates";

type Props = {
  template: TemplateWithItems;
  totalIncome: number;
  onClick: () => void;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function TemplateCompactCard({ template, totalIncome, onClick }: Props) {
  const totalPlanned = template.items.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
  const percentOfIncome = totalIncome > 0 ? ((totalPlanned / totalIncome) * 100).toFixed(1) : "—";
  const itemCount = template.items.length;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow gap-1"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-semibold">{formatCurrency(totalPlanned)}</span>
        </div>
        {totalIncome > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">% del ingreso</span>
            <Badge variant="secondary" className="text-xs">
              {percentOfIncome}%
            </Badge>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Gastos</span>
          <span className="text-sm font-medium">{itemCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
