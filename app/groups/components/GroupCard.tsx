"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users, Receipt } from "lucide-react";

type Group = {
  id: string;
  name: string;
  description?: string | null;
  membersCount?: number;
  expensesCount?: number;
  totalAmount?: number;
};

export default function GroupCard({
  group,
  onRefresh,
}: {
  group: Group;
  onRefresh: () => void;
}) {
  const members = group.membersCount ?? 0;
  const expenses = group.expensesCount ?? 0;
  const total = group.totalAmount ?? 0;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] hover:border-white/15 hover:bg-white/[0.07] transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold truncate">{group.name}</h3>
          <p className="mt-1 text-sm text-white/60 line-clamp-2">
            {group.description?.trim()
              ? group.description
              : "Sem descrição. Você pode adicionar depois."}
          </p>
        </div>

        <button
          onClick={() => {
            // 🔧 Troque isso pra navegar pro detalhe do grupo.
            // Ex.: router.push(`/groups/${group.id}`)
            alert(`Abrir grupo ${group.id} (troque aqui pela navegação)`);
          }}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm transition"
        >
          Abrir
          <ArrowRight className="h-4 w-4 text-white/70" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <Users className="h-3.5 w-3.5" />
          {members} {members === 1 ? "membro" : "membros"}
        </span>

        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <Receipt className="h-3.5 w-3.5" />
          {expenses} {expenses === 1 ? "despesa" : "despesas"}
        </span>

        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
          Total:{" "}
          <strong className="font-semibold text-emerald-50">
            R$ {total.toFixed(2)}
          </strong>
        </span>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => alert("Convidar (troque pela sua ação)")}
          className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm transition"
        >
          Convidar
        </button>
        <button
          onClick={() => {
            // exemplo: atualizar a lista depois
            onRefresh();
          }}
          className="w-full rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium px-3 py-2 text-sm transition"
        >
          Atualizar
        </button>
      </div>
    </motion.div>
  );
}
