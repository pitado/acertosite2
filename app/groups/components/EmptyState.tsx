"use client";

import { Plus, Search, X } from "lucide-react";

export default function EmptyState({
  hasSearch,
  onCreate,
  onClearSearch,
}: {
  hasSearch: boolean;
  onCreate: () => void;
  onClearSearch: () => void;
}) {
  return (
    <div className="mt-10 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
          {hasSearch ? (
            <Search className="h-5 w-5 text-white/70" />
          ) : (
            <Plus className="h-5 w-5 text-white/70" />
          )}
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          {hasSearch ? "Nenhum grupo encontrado" : "Você ainda não tem grupos"}
        </h2>

        <p className="mt-1 text-sm text-white/60">
          {hasSearch
            ? "Tenta buscar com outro nome ou limpe o filtro."
            : "Crie seu primeiro grupo e comece a organizar as despesas."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {hasSearch ? (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm transition"
            >
              <X className="h-4 w-4" />
              Limpar busca
            </button>
          ) : (
            <button
              onClick={onCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium px-4 py-2.5 text-sm transition"
            >
              <Plus className="h-4 w-4" />
              Criar grupo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
