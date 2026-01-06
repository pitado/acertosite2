import type { Group, Expense } from "../types";
import { formatBRL } from "../constants";

export function GroupSummary({ group, expenses }: { group: Group; expenses: Expense[] }) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const pending = expenses
    .filter((e) => !e.paid)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/50 p-4">
      <div className="text-emerald-100/80 text-xs uppercase tracking-wide">Resumo do grupo</div>
      <div className="mt-2 text-lg font-semibold text-emerald-50">{group.name}</div>
      {group.description && <div className="text-sm text-emerald-100/80 mt-1">{group.description}</div>}
      <div className="mt-3 grid gap-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-emerald-100/70">Total</span>
          <span className="font-semibold text-emerald-50">{formatBRL(total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-emerald-100/70">Pendente</span>
          <span className="font-semibold text-amber-200">{formatBRL(pending)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-emerald-100/70">Despesas</span>
          <span className="font-semibold text-emerald-50">{expenses.length}</span>
        </div>
      </div>
    </div>
  );
}
