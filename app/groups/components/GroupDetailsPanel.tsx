import { Expense, Group, Invite, LogEntry, Member } from "../types";
import { GroupSummary } from "./GroupSummary";
import { MemberList } from "./MemberList";
import { ActivityLog } from "./ActivityLog";
import { getAppUrl } from "../constants";

export function GroupDetailsPanel({
  group,
  expenses,
  invites,
  members,
  logs,
  onRefreshMembers,
  onCreateInvite,
}: {
  group: Group | null;
  expenses: Expense[] | null;
  invites: Invite[] | null;
  members: Member[] | null;
  logs: LogEntry[] | null;
  onRefreshMembers: () => Promise<void>;
  onCreateInvite: () => Promise<string | null>;
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

  const latestInvite = invites?.[0]?.token
    ? `${getAppUrl()}/invite/${invites[0].token}`
    : null;

  return (
    <div className="grid gap-4">
      <GroupSummary group={group} expenses={expenses} />
      <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/40 p-4 text-sm text-emerald-100/80">
        <div className="font-semibold text-emerald-50 mb-2">Convites</div>
        {latestInvite ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs break-all">{latestInvite}</span>
            <button
              className="self-start px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-semibold"
              onClick={async () => {
                await navigator.clipboard.writeText(latestInvite);
              }}
            >
              Copiar link
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-xs">Nenhum convite ativo.</span>
            <button
              className="self-start px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-semibold"
              onClick={async () => {
                await onCreateInvite();
              }}
            >
              Criar convite
            </button>
          </div>
        )}
      </div>
      {members && (
        <MemberList groupId={group.id} members={members} onRefresh={onRefreshMembers} />
      )}
      {logs && <ActivityLog logs={logs} />}
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
