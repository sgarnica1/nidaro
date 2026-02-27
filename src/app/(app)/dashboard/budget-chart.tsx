"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function BudgetChart({ categories }: Props) {
  const options = useMemo(() => {
    return {
      chart: {
        type: "column" as const,
        backgroundColor: "transparent",
        style: { fontFamily: "inherit" },
      },
      title: { text: undefined },
      xAxis: {
        categories: categories.map((c) => c.name),
        labels: { style: { fontSize: "13px" } },
        gridLineColor: "transparent",
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: "#e2e8f0",
        gridLineWidth: 1,
        labels: {
          formatter() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return formatCurrency((this as any).value as number);
          },
          style: { fontSize: "11px" },
        },
      },
      legend: {
        align: "center" as const,
        verticalAlign: "bottom" as const,
        layout: "horizontal" as const,
      },
      tooltip: {
        shared: true,
        borderRadius: 12,
        shadow: {
          color: "rgba(0, 0, 0, 0.1)",
          offsetX: 0,
          offsetY: 4,
          opacity: 0.1,
          width: 8,
        },
        formatter() {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const points = (this as any).points ?? [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const x = (this as any).x as string;
          const header = `<b>${x}</b><br/>`;
          const rows = points
            .map((p: { color: string; series: { name: string }; y: number | null }) => 
              `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${formatCurrency(p.y ?? 0)}</b>`
            )
            .join("<br/>");
          return header + rows;
        },
      },
      plotOptions: {
        column: { borderRadius: 8, groupPadding: 0.15 },
      },
      series: [
        {
          type: "column" as const,
          name: "Asignado",
          color: "#64748b",
          data: categories.map((c) => c.assigned),
        },
        {
          type: "column" as const,
          name: "Planeado",
          color: "#52796f",
          data: categories.map((c) => c.planned),
        },
        {
          type: "column" as const,
          name: "Real",
          color: "#10b981",
          data: categories.map((c) => c.real),
        },
      ],
      credits: { enabled: false },
    };
  }, [categories]);

  return (
    <div className="min-h-[400px]">
      <HighchartsReact
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        highcharts={typeof window !== "undefined" ? require("highcharts") : undefined}
        options={options}
      />
    </div>
  );
}
