import { Plus, Users } from "lucide-react";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20 text-emerald-100/80">
      <Users className="h-12 w-12 mx-auto mb-3 opacity-80" />
      <p className="text-lg">Você ainda não tem grupos.</p>
      <p className="text-sm mt-1">Crie um grupo e convide amigos para dividir despesas.</p>
      <button
        onClick={onCreate}
        className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl px-4 py-2 inline-flex items-center gap-2"
      >
        <Plus className="h-4 w-4" /> Criar grupo
      </button>
    </div>
  );
}
