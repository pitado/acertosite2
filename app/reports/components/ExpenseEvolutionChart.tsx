"use client";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

type EvolutionItem = {
  date: string;
  total: number;
};

export function ExpenseEvolutionChart({
  data,
}: {
  data: EvolutionItem[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-emerald-100/60 text-sm">
        Nenhum dado para exibir.
      </div>
    );
  }

  return (
    <Line
      data={{
        labels: data.map(d => d.date),
        datasets: [
          {
            label: "Gastos (R$)",
            data: data.map(d => d.total),
            borderColor: "#10b981",
            backgroundColor: "rgba(16,185,129,0.2)",
            tension: 0.3,
            fill: true,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: { color: "#a7f3d0" },
            grid: { color: "rgba(16,185,129,0.1)" },
          },
          y: {
            ticks: { color: "#a7f3d0" },
            grid: { color: "rgba(16,185,129,0.1)" },
          },
        },
      }}
    />
  );
}
