"use client";

import { useEffect, useMemo, useState } from "react";
import type { Expense, LogEntry } from "../types";
import { Services } from "../services";
import ExpenseModal from "./ExpenseModal";
import ExpenseRow from "./ExpenseRow";

type View = "home" | "expenses" | "members" | "reports" | "activity";

export default function GroupModal({
  group,
  onClose,
}: {
  group: { id: string; name: string };
  onClose: () => void;
}) {
  const [view, setView] = useState<View>("home");

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<{ email: string; role: string }[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activity, setActivity] = useState<LogEntry[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shortcut = `/groups/${group.id}`;

  async function reloadAll() {
    setError(null);
    setLoading(true);
    try {
      const [m, e, a] = await Promise.all([
        Services.listMembers(group.id),
        Services.listExpenses(group.id),
        Services.listActivity(group.id),
      ]);
      setMembers(m);
      setExpenses(e);
      setActivity(a);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar grupo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  const memberEmails = useMemo(() => members.map((m) => m.email), [members]);

  // ===== Relatórios (saldo e sugestão de transferências) =====
  const report = useMemo(() => {
    // net[member] > 0: tem a receber; <0: deve
    const net: Record<string, number> = {};
    for (const m of memberEmails) net[m] = 0;

    for (const ex of expenses) {
      const participants = Array.isArray(ex.participants) ? ex.participants : [];
      if (!participants.length) continue;

      // garante conhecidos
      for (const p of participants) if (net[p] === undefined) net[p] = 0;
      if (net[ex.payer] === undefined) net[ex.payer] = 0;

      net[ex.payer] += ex.amount;

      if (ex.split === "custom") {
        // se você quiser suportar custom de verdade depois:
        // hoje seu front não envia shares -> cai no equal
        const each = ex.amount / participants.length;
        for (const p of participants) net[p] -= each;
      } else {
        const each = ex.amount / participants.length;
        for (const p of participants) net[p] -= each;
      }
    }

    // arredondar para 2 casas
    for (const k of Object.keys(net)) net[k] = Math.round(net[k] * 100) / 100;

    // sugere pagamentos (greedy)
    const creditors = Object.entries(net)
      .filter(([, v]) => v > 0.009)
      .map(([who, v]) => ({ who, v }))
      .sort((a, b) => b.v - a.v);

    const debtors = Object.entries(net)
      .filter(([, v]) => v < -0.009)
      .map(([who, v]) => ({ who, v: -v }))
      .sort((a, b) => b.v - a.v);

    const transfers: { from: string; to: string; amount: number }[] = [];

    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i];
      const c = creditors[j];
      const pay = Math.min(d.v, c.v);
      transfers.push({
        from: d.who,
        to: c.who,
        amount: Math.round(pay * 100) / 100,
      });
      d.v -= pay;
      c.v -= pay;
      if (d.v <= 0.009) i++;
      if (c.v <= 0.009) j++;
    }

    return { net, transfers };
  }, [expenses, memberEmails]);

  async function onSaveExpense(expense: any) {
    await Services.createExpense(group.id, expense);
    setShowExpenseModal(false);
    await reloadAll();
    setView("expenses");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b141a] text-white shadow-xl">
        <div className="flex items-start justify-between p-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-white/80">
              Seu grupo
            </div>
            <h2 className="mt-3 text-2xl font-semibold">{group.name}</h2>
            <p className="mt-1 text-sm text-white/60">
              {loading ? "Carregando..." : `${members.length} membros • ${expenses.length} despesas`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            Fechar ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {[
            ["home", "Início"],
            ["expenses", "Despesas"],
            ["members", "Membros"],
            ["reports", "Relatórios"],
            ["activity", "Atividades"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setView(k as View)}
              className={
                "rounded-full px-3 py-1 text-sm border " +
                (view === k
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                  : "border-white/10 text-white/70 hover:bg-white/5")
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="px-5 pb-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {view === "home" && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={() => setView("expenses")}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
                >
                  <div className="text-sm font-semibold">Despesas</div>
                  <div className="mt-1 text-xs text-white/60">Adicionar e ver gastos do grupo</div>
                </button>

                <button
                  onClick={() => setView("members")}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
                >
                  <div className="text-sm font-semibold">Membros</div>
                  <div className="mt-1 text-xs text-white/60">Ver participantes e permissões</div>
                </button>

                <button
                  onClick={() => setView("reports")}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
                >
                  <div className="text-sm font-semibold">Relatórios</div>
                  <div className="mt-1 text-xs text-white/60">Quem deve / quem recebe</div>
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Atalho</div>
                <div className="mt-1 text-xs text-white/60">
                  Quando você ligar a página do grupo, o botão <b>Abrir</b> vai levar direto pra:
                </div>
                <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs text-white/80">
                  {shortcut}
                </div>
              </div>
            </>
          )}

          {view === "expenses" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">Despesas</div>
                  <div className="text-xs text-white/60">Cadastre gastos por categoria e divida com o grupo.</div>
                </div>

                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
                >
                  + Adicionar despesa
                </button>
              </div>

              {loading ? (
                <div className="text-sm text-white/60">Carregando despesas...</div>
              ) : expenses.length ? (
                <div className="space-y-2">
                  {expenses.map((e) => (
                    <ExpenseRow
                      key={e.id}
                      expense={e}
                      onChange={async () => {
                        await reloadAll();
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                  Nenhuma despesa ainda.
                </div>
              )}

              {showExpenseModal && (
                <ExpenseModal
                  members={memberEmails.length ? memberEmails : ["você"]}
                  onClose={() => setShowExpenseModal(false)}
                  onSave={onSaveExpense}
                />
              )}
            </>
          )}

          {view === "members" && (
            <>
              <div className="mb-3 text-base font-semibold">Membros</div>
              {loading ? (
                <div className="text-sm text-white/60">Carregando membros...</div>
              ) : (
                <div className="space-y-2">
                  {members.map((m) => (
                    <div
                      key={m.email}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="text-sm">{m.email}</div>
                      <div className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/70">
                        {m.role}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {view === "reports" && (
            <>
              <div className="mb-3 text-base font-semibold">Relatórios</div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Saldo por pessoa</div>
                <div className="mt-2 space-y-2">
                  {Object.entries(report.net).map(([who, val]) => (
                    <div key={who} className="flex items-center justify-between text-sm">
                      <div className="text-white/80">{who}</div>
                      <div className={val >= 0 ? "text-emerald-300" : "text-red-300"}>
                        {val >= 0 ? "+" : "-"} R$ {Math.abs(val).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Sugestão de pagamentos</div>
                <div className="mt-2 space-y-2">
                  {report.transfers.length ? (
                    report.transfers.map((t, idx) => (
                      <div key={idx} className="text-sm text-white/80">
                        <b>{t.from}</b> paga <b>{t.to}</b>: R$ {t.amount.toFixed(2)}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-white/60">Tudo certo — ninguém deve nada 🙂</div>
                  )}
                </div>
              </div>
            </>
          )}

          {view === "activity" && (
            <>
              <div className="mb-3 text-base font-semibold">Atividades recentes</div>
              {loading ? (
                <div className="text-sm text-white/60">Carregando atividades...</div>
              ) : activity.length ? (
                <div className="space-y-2">
                  {activity.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80"
                    >
                      <div>{a.message}</div>
                      <div className="mt-1 text-xs text-white/50">
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                  Nenhuma atividade ainda.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
