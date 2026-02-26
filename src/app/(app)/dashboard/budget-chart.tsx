"use client";

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { useRef } from "react";

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
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const options: Highcharts.Options = {
    chart: {
      type: "bar",
      backgroundColor: "transparent",
      style: { fontFamily: "inherit" },
    },
    title: { text: undefined },
    xAxis: {
      categories: categories.map((c) => c.name),
      labels: { style: { fontSize: "13px" } },
    },
    yAxis: {
      title: { text: undefined },
      labels: {
        formatter() {
          return formatCurrency(this.value as number);
        },
        style: { fontSize: "11px" },
      },
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
    },
    tooltip: {
      shared: true,
      formatter() {
        const points = this.points ?? [];
        const header = `<b>${this.x}</b><br/>`;
        const rows = points
          .map((p) => `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${formatCurrency(p.y ?? 0)}</b>`)
          .join("<br/>");
        return header + rows;
      },
    },
    plotOptions: {
      bar: { borderRadius: 4, groupPadding: 0.1 },
    },
    series: [
      {
        type: "bar",
        name: "Asignado",
        color: "#94a3b8",
        data: categories.map((c) => c.assigned),
      },
      {
        type: "bar",
        name: "Planeado",
        color: "#818cf8",
        data: categories.map((c) => c.planned),
      },
      {
        type: "bar",
        name: "Real",
        color: "#22c55e",
        data: categories.map((c) => c.real),
      },
    ],
    credits: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />;
}
