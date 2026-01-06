import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Pencil, Trash2, Wallet } from "lucide-react";

import type { Expense, Group, Invite } from "../types";
import { Services } from "../services";
import { formatBRL, getAppUrl } from "../constants";
import { CountdownBadge } from "./CountdownBadge";
import { ExpenseModal } from "./ExpenseModal";
import { ExpenseRow } from "./ExpenseRow";

export function GroupCard({
  g,
  ownerEmail,
  onEdit,
  onDelete,
}: {
  g: Group;
  ownerEmail: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [exps, setExps] = useState<Expense[]>([]);
  const [expOpen, setExpOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setInvites(await Services.listInvites(g.id));
      setExps(await Services.listExpenses(g.id));
    })();
  }, [g.id]);

  const summary = useMemo(() => {
    const total = exps.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const pending = exps
      .filter((e) => !e.paid)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return { total, pending };
  }, [exps]);

  async function newInvite() {
    const inv = await Services.createInvite(g.id);
    const url = `${getAppUrl()}/invite/${inv.token}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link de convite copiado!\n" + url);
    } catch {
      prompt("Copie o link de convite:", url);
    }
    setInvites((prev) => [{ token: inv.token }, ...prev]);
  }

  async function handleExpenseCreate(data: Omit<Expense, "id" | "group_id" | "created_at">) {
    await Services.createExpense(g.id, data);
    setExps(await Services.listExpenses(g.id));
    setExpOpen(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-800/60 bg-emerald-900/50 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-emerald-100/70 mb-2">
          <span>
            Admin: <span className="font-semibold">{g.owner_email}</span>
          </span>
          {g.role_date && <CountdownBadge dateISO={g.role_date} />}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-emerald-50">{g.name}</h3>
            {g.description && (
              <p className="text-sm text-emerald-100/80 mt-0.5">{g.description}</p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              className="hover:bg-emerald-800/40 rounded-lg px-2 py-1"
              onClick={newInvite}
              title="Gerar link de convite"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              className="hover:bg-emerald-800/40 rounded-lg px-2 py-1"
              onClick={() => setExpOpen(true)}
              title="Adicionar despesa"
            >
              <Wallet className="h-4 w-4" />
            </button>
            <button
              className="hover:bg-emerald-800/40 rounded-lg px-2 py-1"
              onClick={onEdit}
              title="Editar grupo"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="hover:bg-red-900/30 rounded-lg px-2 py-1"
              onClick={onDelete}
              title="Excluir grupo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {exps.length > 0 && (
          <div className="mt-4 border-t border-emerald-800/60 pt-3">
            <div className="grid gap-1 text-xs text-emerald-100/80 mb-2">
              <div>
                Total: <span className="font-semibold text-emerald-50">{formatBRL(summary.total)}</span>
              </div>
              <div>
                Pendente: <span className="font-semibold text-amber-200">{formatBRL(summary.pending)}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-emerald-50 mb-2">Últimas despesas</p>
            <ul className="space-y-2">
              {exps.slice(0, 3).map((e) => (
                <ExpenseRow
                  key={e.id}
                  e={e}
                  refresh={async () => {
                    setExps(await Services.listExpenses(g.id));
                  }}
                />
              ))}
            </ul>
          </div>
        )}

        {invites.length > 0 && (
          <div className="mt-3 text-xs text-emerald-100/70">
            <p className="font-semibold mb-1">Convites</p>
            {invites.slice(0, 2).map((i) => (
              <div key={i.token} className="truncate">
                {location.origin}/invite/{i.token}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {expOpen && (
            <ExpenseModal
              open={true}
              onClose={() => setExpOpen(false)}
              members={[ownerEmail]} // TODO: trocar pela lista real de membros do grupo
              onSave={handleExpenseCreate}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
