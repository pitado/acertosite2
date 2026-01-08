import { Plus, Users } from "lucide-react";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-24 text-emerald-100/80">
      <Users className="h-24 w-24 mx-auto mb-6 opacity-80" />

      <p className="text-xl font-semibold">Você ainda não tem grupos.</p>
      <p className="text-sm mt-2">
        Crie um grupo e convide amigos para dividir despesas.
      </p>

      <button
        onClick={onCreate}
        className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl px-6 py-3 inline-flex items-center gap-2 font-medium"
      >
        <Plus className="h-5 w-5" /> Criar grupo
      </button>
    </div>
  );
}
