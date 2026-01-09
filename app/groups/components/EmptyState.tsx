"use client";

import { UsersRound, SearchX } from "lucide-react";

type Props = {
  hasSearch?: boolean;
  onCreate: () => void;
  onClearSearch?: () => void;
};

export default function EmptyState({ hasSearch, onCreate, onClearSearch }: Props) {
  const Icon = hasSearch ? SearchX : UsersRound;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
        <Icon className="h-6 w-6 text-white/70" />
      </div>

      <h3 className="mt-5 text-xl font-semibold text-white">
        {hasSearch ? "Nenhum grupo encontrado" : "Você ainda não tem grupos"}
      </h3>

      <p className="mt-2 text-sm text-white/60">
        {hasSearch
          ? "Tente outro nome ou limpe a busca."
          : "Crie seu primeiro grupo para começar a organizar despesas e membros."}
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onCreate}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium px-5 py-2.5 transition"
        >
          Criar grupo
        </button>

        {hasSearch && onClearSearch && (
          <button
            onClick={onClearSearch}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium px-5 py-2.5 transition"
          >
            Limpar busca
          </button>
        )}
      </div>
    </div>
  );
}
