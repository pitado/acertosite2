"use client";

type Props = {
  onCreate: () => void;
  hasSearch?: boolean;
  onClearSearch?: () => void;
};

export function EmptyState({ onCreate, hasSearch = false, onClearSearch }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
      <div className="mx-auto max-w-md">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <span className="text-xl">👥</span>
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          {hasSearch ? "Nenhum grupo encontrado" : "Você ainda não tem grupos"}
        </h2>

        <p className="mt-2 text-sm text-white/60">
          {hasSearch
            ? "Tente outro termo de busca ou limpe o filtro."
            : "Crie seu primeiro grupo para começar a organizar despesas e membros."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {hasSearch && onClearSearch && (
            <button
              onClick={onClearSearch}
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm transition"
            >
              Limpar busca
            </button>
          )}

          <button
            onClick={onCreate}
            className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition"
          >
            Criar grupo
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ✅ Isso aqui resolve seu erro do Vercel:
 * - Agora o componente funciona com:
 *   import EmptyState from "./components/EmptyState"
 *   e também com:
 *   import { EmptyState } from "./components/EmptyState"
 */
export default EmptyState;
