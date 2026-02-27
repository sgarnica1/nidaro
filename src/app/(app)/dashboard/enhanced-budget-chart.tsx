"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

const HighchartsReact = dynamic(
  () => import("highcharts-react-official").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">Cargando gráfico...</div> }
);

type CategoryData = {
  name: string;
  assigned: number;
  planned: number;
  real: number;
};

type Props = {
  categories: CategoryData[];
};

function formatCurrencyShort(amount: number) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function EnhancedBudgetChart({ categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const options = useMemo(() => {
    return {
      chart: {
        type: "column" as const,
        backgroundColor: "transparent",
        style: { fontFamily: "inherit" },
        events: {
          click() {
            setSelectedCategory(null);
          },
        },
      },
      title: { text: undefined },
      xAxis: {
        categories: categories.map((c) => c.name),
        labels: { style: { fontSize: "13px", color: "#6B7280" } },
        gridLineColor: "transparent",
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: "#E5E7EB",
        gridLineWidth: 1,
        labels: {
          formatter() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return formatCurrencyShort((this as any).value as number);
          },
          style: { fontSize: "11px", color: "#6B7280" },
        },
      },
      legend: { enabled: false },
      tooltip: {
        enabled: false,
      },
      plotOptions: {
        column: {
          borderRadius: 8,
          groupPadding: 0.15,
          point: {
            events: {
              click() {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const categoryName = (this as any).category as string;
                setSelectedCategory(categoryName);
              },
            },
          },
        },
      },
      series: [
        {
          type: "column" as const,
          name: "Asignado",
          color: "#94A3B8",
          data: categories.map((c) => c.assigned),
        },
        {
          type: "column" as const,
          name: "Planeado",
          color: "#1C3D2E",
          data: categories.map((c) => c.planned),
        },
      ],
      credits: { enabled: false },
    };
  }, [categories]);

  const selectedData = selectedCategory ? categories.find((c) => c.name === selectedCategory) : null;

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-5 overflow-hidden">
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-2">
        <Badge className="bg-[#94A3B8] text-white border-0 px-3 py-1 text-[12px] font-medium">Asignado</Badge>
        <Badge className="bg-[#1C3D2E] text-white border-0 px-3 py-1 text-[12px] font-medium">Planeado</Badge>
      </div>
      <div className="min-h-[400px] relative overflow-hidden">
        <div className="overflow-x-auto">
          <HighchartsReact
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            highcharts={typeof window !== "undefined" ? require("highcharts") : undefined}
            options={options}
          />
        </div>
        {selectedData && (
          <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-4 min-w-[200px] z-10">
            <p className="text-[13px] font-semibold text-[#111111] mb-3">{selectedCategory}</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#6B7280]">Asignado</span>
                <span className="text-[13px] font-semibold text-[#111111]">{formatCurrency(selectedData.assigned)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#6B7280]">Planeado</span>
                <span className="text-[13px] font-semibold text-[#111111]">{formatCurrency(selectedData.planned)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
