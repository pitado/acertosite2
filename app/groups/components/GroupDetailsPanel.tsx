import { Expense, Group } from "../types";
import { GroupSummary } from "./GroupSummary";

export function GroupDetailsPanel({
  group,
  expenses,
}: {
  group: Group | null;
  expenses: Expense[] | null;
}) {
  if (!group || !expenses) {
    return (
      <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/40 p-6 text-emerald-100/80">
        Selecione um grupo para ver o resumo.
      </div>
    );
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const pending = expenses
    .filter((e) => !e.paid)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="grid gap-4">
      <GroupSummary group={group} expenses={expenses} />
      <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/40 p-4 text-sm text-emerald-100/80">
        <div className="font-semibold text-emerald-50 mb-1">Dica rápida</div>
        <p>
          Compartilhe o link de convite com seus amigos e registre as despesas conforme elas
          acontecem. O painel mostra quanto falta acertar.
        </p>
      </div>
      <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/40 p-4 text-sm text-emerald-100/80">
        <div className="font-semibold text-emerald-50 mb-1">Resumo geral</div>
        <ul className="space-y-1">
          <li>
            Total do grupo: <span className="text-emerald-50 font-semibold">R$ {total.toFixed(2)}</span>
          </li>
          <li>
            Pendente: <span className="text-amber-200 font-semibold">R$ {pending.toFixed(2)}</span>
          </li>
          <li>
            Despesas registradas: <span className="text-emerald-50 font-semibold">{expenses.length}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
