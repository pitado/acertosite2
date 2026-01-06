import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";

import type { Member } from "../types";
import { Services } from "../services";

export function MemberList({
  groupId,
  members,
  onRefresh,
}: {
  groupId: string;
  members: Member[];
  onRefresh: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    if (!email.trim()) return;
    setBusy(true);
    try {
      await Services.addMember(groupId, email.trim().toLowerCase());
      setEmail("");
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-emerald-50">Membros</div>
        <div className="text-xs text-emerald-100/70">{members.length} pessoas</div>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2 text-sm"
          placeholder="email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleAdd}
          disabled={busy}
          className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-sm inline-flex items-center gap-1"
        >
          <UserPlus className="h-4 w-4" /> Adicionar
        </button>
      </div>
      <ul className="space-y-2 text-sm text-emerald-100/80">
        {members.map((m) => (
          <li key={m.email} className="flex items-center justify-between gap-2">
            <span>{m.email}</span>
            <button
              className="text-emerald-200/70 hover:text-red-300"
              onClick={async () => {
                await Services.removeMember(groupId, m.email);
                await onRefresh();
              }}
              title="Remover membro"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
