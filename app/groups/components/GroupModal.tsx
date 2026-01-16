"use client";

import { X, Users, Receipt, BarChart3, ChevronRight, Sparkles } from "lucide-react";

type Group = {
  id: string;
  name: string;
  description?: string | null;
};

type Props = {
  group: Group;
  onClose: () => void;
  onInvite: (groupId: string) => void;
};

export default function GroupModal({ group, onClose, onInvite }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#071611] p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span className="text-sm text-white/80">Seu grupo</span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold truncate">{group.name}</h2>

            <p className="mt-1 text-sm text-white/60">
              {group.description?.trim()
                ? group.description
                : "Sem descrição por enquanto. Você pode adicionar depois."}
            </p>
          </div>

          <button
            onClick={() => onInvite(group.id)}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 transition"
          >
            <Users className="h-4 w-4" />
            Convidar
          </button>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <ActionCard
            icon={<Receipt className="h-5 w-5" />}
            title="Despesas"
            subtitle="Adicionar e ver gastos do grupo"
            onClick={() => alert("Em breve: página de despesas do grupo")}
          />
          <ActionCard
            icon={<Users className="h-5 w-5" />}
            title="Membros"
            subtitle="Ver participantes e permissões"
            onClick={() => alert("Em breve: página de membros")}
          />
          <ActionCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Relatórios"
            subtitle="Quem deve / quem recebe"
            onClick={() => alert("Em breve: relatórios do grupo")}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Atalho</div>
          <div className="mt-1 text-sm text-white/60">
            Quando você ligar a página do grupo, o botão <b>Abrir</b> vai levar direto pra:
            <span className="text-white/80"> /groups/{group.id}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition"
          >
            Fechar
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
    >
      <div className="text-emerald-300">{icon}</div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="mt-1 text-xs text-white/60">{subtitle}</div>
    </button>
  );
}
