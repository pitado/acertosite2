"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, Users, AlertCircle, Wallet } from "lucide-react";

export default function ReportsPage() {
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

          <h1 className="text-2xl font-semibold tracking-tight">
            Relatórios
          </h1>
        </div>

        <p className="text-white/60 max-w-2xl mb-8">
          Aqui você poderá acompanhar gastos, acertos e quem deve ou recebe em
          cada grupo. Esses dados aparecerão automaticamente quando o banco de
          dados estiver conectado.
        </p>

        {/* Cards resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Wallet className="h-5 w-5 text-emerald-400" />}
            title="Total gasto no mês"
            value="R$ 0,00"
          />
          <SummaryCard
            icon={<Users className="h-5 w-5 text-emerald-400" />}
            title="Grupos ativos"
            value="0"
          />
          <SummaryCard
            icon={<AlertCircle className="h-5 w-5 text-emerald-400" />}
            title="Pendências"
            value="0"
          />
          <SummaryCard
            icon={<BarChart3 className="h-5 w-5 text-emerald-400" />}
            title="Ajustes não acertados"
            value="0"
          />
        </div>

        {/* Gráfico fake */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="font-semibold mb-2">Evolução de gastos</h2>
          <p className="text-sm text-white/60 mb-4">
            Em breve você verá gráficos com os gastos ao longo do tempo.
          </p>

          <div className="h-40 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/40 text-sm">
            Gráfico aparecerá aqui
          </div>
        </div>

        {/* Aviso */}
        <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          💡 Dica: quando o banco estiver conectado, esses relatórios serão
          atualizados automaticamente com base nos grupos e despesas.
        </div>
      </div>
    </div>
  );
}

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
