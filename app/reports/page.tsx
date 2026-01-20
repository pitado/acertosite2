"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Users, AlertCircle, Wallet } from "lucide-react";

// ✅ Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

// reaproveita o mesmo Services do /groups
import { Services } from "../groups/services";
import type { Expense } from "../groups/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

type Group = {
  id: string;
  name: string;
  description?: string | null;
};

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function sameDayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseExpenseDate(e: Expense): Date | null {
  // no seu schema existe created_at e date_iso (string?)
  // vamos preferir date_iso se existir
  const raw: any = (e as any).date_iso || (e as any).created_at || (e as any).createdAt;
  if (!raw) return null;

  const dt = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function parseParticipants(e: Expense): string[] {
  const p: any = (e as any).participants;

  if (Array.isArray(p)) {
    return p.filter(Boolean).map((x) => String(x));
  }

  if (typeof p === "string") {
    try {
      const arr = JSON.parse(p);
      if (Array.isArray(arr)) return arr.filter(Boolean).map((x) => String(x));
    } catch {}
  }

  return [];
}

function computeTransfersForGroup(expenses: Expense[], memberEmails: string[]) {
  const net: Record<string, number> = {};
  for (const m of memberEmails) net[m] = 0;

  for (const ex of expenses) {
    const participants = parseParticipants(ex);
    if (!participants.length) continue;

    for (const p of participants) if (net[p] === undefined) net[p] = 0;

    const payer = String((ex as any).payer || "");
    if (payer && net[payer] === undefined) net[payer] = 0;

    const amount = Number((ex as any).amount || 0);
    if (!amount) continue;

    if (payer) net[payer] += amount;

    const each = amount / participants.length;
    for (const p of participants) net[p] -= each;
  }

  for (const k of Object.keys(net)) net[k] = Math.round(net[k] * 100) / 100;

  const creditors = Object.entries(net)
    .filter(([, v]) => v > 0.009)
    .map(([who, v]) => ({ who, v }))
    .sort((a, b) => b.v - a.v);

  const debtors = Object.entries(net)
    .filter(([, v]) => v < -0.009)
    .map(([who, v]) => ({ who, v: -v }))
    .sort((a, b) => b.v - a.v);

  const transfers: { from: string; to: string; amount: number }[] = [];
  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const pay = Math.min(d.v, c.v);

    transfers.push({
      from: d.who,
      to: c.who,
      amount: Math.round(pay * 100) / 100,
    });

    d.v -= pay;
    c.v -= pay;

    if (d.v <= 0.009) i++;
    if (c.v <= 0.009) j++;
  }

  return { net, transfers };
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDayLabel(yyyyMmDd: string) {
  // "2026-01-20" -> "20/01"
  const [y, m, d] = yyyyMmDd.split("-");
  if (!y || !m || !d) return yyyyMmDd;
  return `${d}/${m}`;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expensesByGroup, setExpensesByGroup] = useState<Record<string, Expense[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const gs = await Services.listGroups();
        setGroups(gs || []);

        const entries = await Promise.all(
          (gs || []).map(async (g) => {
            try {
              const ex = await Services.listExpenses(g.id);
              return [g.id, (ex || []) as Expense[]] as const;
            } catch {
              return [g.id, [] as Expense[]] as const;
            }
          })
        );

        const map: Record<string, Expense[]> = {};
        for (const [gid, ex] of entries) map[gid] = ex;
        setExpensesByGroup(map);
      } catch (e: any) {
        setError(e?.message || "Falha ao carregar relatórios");
        setGroups([]);
        setExpensesByGroup({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monthStart = useMemo(() => startOfMonth(new Date()), []);

  const allExpenses = useMemo(() => Object.values(expensesByGroup).flat(), [expensesByGroup]);

  const totalSpentMonth = useMemo(() => {
    let sum = 0;
    for (const e of allExpenses) {
      const dt = parseExpenseDate(e);
      if (!dt) continue;
      if (dt >= monthStart) sum += Number((e as any).amount || 0);
    }
    return Math.round(sum * 100) / 100;
  }, [allExpenses, monthStart]);

  const activeGroups = groups.length;

  const pendingCount = useMemo(() => {
    const me = (typeof window !== "undefined" ? localStorage.getItem("acerto_email") : "") || "";
    if (!me) return 0;

    let c = 0;
    for (const e of allExpenses) {
      const dt = parseExpenseDate(e);
      if (!dt || dt < monthStart) continue;

      const payer = String((e as any).payer || "");
      const participants = parseParticipants(e);
      if (payer === me || participants.includes(me)) c++;
    }
    return c;
  }, [allExpenses, monthStart]);

  const unsettledTransfers = useMemo(() => {
    let total = 0;

    for (const g of groups) {
      const ex = expensesByGroup[g.id] || [];

      const memberSet = new Set<string>();
      for (const e of ex) {
        const payer = String((e as any).payer || "");
        if (payer) memberSet.add(payer);
        for (const p of parseParticipants(e)) memberSet.add(p);
      }

      const members = Array.from(memberSet);
      const rep = computeTransfersForGroup(ex, members);
      total += rep.transfers.length;
    }

    return total;
  }, [groups, expensesByGroup]);

  const dailySpentThisMonth = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of allExpenses) {
      const dt = parseExpenseDate(e);
      if (!dt || dt < monthStart) continue;

      const k = sameDayKey(dt);
      map[k] = (map[k] || 0) + Number((e as any).amount || 0);
    }

    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, value]) => ({ day, value: Math.round(value * 100) / 100 }));
  }, [allExpenses, monthStart]);

  const perGroupTotalMonth = useMemo(() => {
    return groups.map((g) => {
      const ex = expensesByGroup[g.id] || [];
      let sum = 0;
      for (const e of ex) {
        const dt = parseExpenseDate(e);
        if (!dt || dt < monthStart) continue;
        sum += Number((e as any).amount || 0);
      }
      sum = Math.round(sum * 100) / 100;
      return { groupId: g.id, name: g.name, total: sum };
    });
  }, [groups, expensesByGroup, monthStart]);

  // ✅ Dados do gráfico
  const chartLabels = useMemo(
    () => dailySpentThisMonth.map((d) => formatDayLabel(d.day)),
    [dailySpentThisMonth]
  );
  const chartValues = useMemo(() => dailySpentThisMonth.map((d) => d.value), [dailySpentThisMonth]);

  const chartData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: [
        {
          label: "Gastos por dia (mês atual)",
          data: chartValues,
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    }),
    [chartLabels, chartValues]
  );

  const chartOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${formatBRL(Number(ctx.raw || 0))}`,
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => formatBRL(Number(value)),
          },
          grid: { display: true },
        },
        x: {
          grid: { display: false },
        },
      },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-[-200px] right-1/3 h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        </div>

        <p className="text-white/60 max-w-2xl mb-8">
          Resumo automático com base nos seus grupos e despesas (mês atual).
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Cards resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Wallet className="h-5 w-5 text-emerald-400" />}
            title="Total gasto no mês"
            value={loading ? "..." : formatBRL(totalSpentMonth)}
          />
          <SummaryCard
            icon={<Users className="h-5 w-5 text-emerald-400" />}
            title="Grupos ativos"
            value={loading ? "..." : String(activeGroups)}
          />
          <SummaryCard
            icon={<AlertCircle className="h-5 w-5 text-emerald-400" />}
            title="Pendências"
            value={loading ? "..." : String(pendingCount)}
          />
          <SummaryCard
            icon={<BarChart3 className="h-5 w-5 text-emerald-400" />}
            title="Ajustes não acertados"
            value={loading ? "..." : String(unsettledTransfers)}
          />
        </div>

        {/* Evolução */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="font-semibold mb-2">Evolução de gastos (mês atual)</h2>
          <p className="text-sm text-white/60 mb-4">Agora em gráfico (linha).</p>

          {loading ? (
            <div className="text-sm text-white/60">Carregando...</div>
          ) : dailySpentThisMonth.length ? (
            <div className="h-[280px] rounded-xl border border-white/10 bg-black/20 p-3">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/40 text-sm">
              Sem despesas neste mês ainda.
            </div>
          )}

          {!loading && dailySpentThisMonth.length ? (
            <div className="mt-4 space-y-2">
              {dailySpentThisMonth.map((d) => (
                <div
                  key={d.day}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="text-white/70">{d.day}</span>
                  <span className="text-emerald-200">{formatBRL(d.value)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Por grupo */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="font-semibold mb-4">Totais por grupo (mês atual)</h2>

          {loading ? (
            <div className="text-sm text-white/60">Carregando...</div>
          ) : perGroupTotalMonth.length ? (
            <div className="space-y-2">
              {perGroupTotalMonth.map((g) => (
                <div
                  key={g.groupId}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="text-white/80">{g.name}</span>
                  <span className="text-emerald-200">{formatBRL(g.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-white/60">Você ainda não tem grupos.</div>
          )}
        </div>

       

function SummaryCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm text-white/70">{title}</span>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
