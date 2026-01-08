"use client";

type EmptyStateProps = {
  onCreate: () => void;
  hasSearch?: boolean;
  onClearSearch?: () => void;
};

export function EmptyState({ onCreate, hasSearch = false, onClearSearch }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        {/* Ícone simples */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          className="opacity-80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M19 8v6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M22 11h-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-white">
        {hasSearch ? "Nenhum grupo encontrado" : "Você ainda não tem grupos"}
      </h2>

      <p className="mt-2 max-w-md text-sm text-white/60">
        {hasSearch
          ? "Tente buscar por outro nome ou limpe o filtro para ver todos os grupos."
          : "Crie um grupo e convide amigos para dividir despesas."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {hasSearch && onClearSearch ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            Limpar busca
          </button>
        ) : null}

        <button
          type="button"
          onClick={onCreate}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          + Criar grupo
        </button>
      </div>
    </div>
  );
}
