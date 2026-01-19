"use client";

import { Trash2 } from "lucide-react";
import { formatBRL } from "../constants";
import type { Expense } from "../types";
import { Services } from "../services";

function safeDateLabel(dateIso?: string | null, createdAt?: string | Date | null) {
  const raw = dateIso ?? createdAt ?? null;
  if (!raw) return null;

  const d = new Date(raw as any);
  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleDateString();
}

export function ExpenseRow({
  e,
  refresh,
}: {
  e: Expense;
  refresh: () => Promise<void>;
}) {
  const dateLabel = safeDateLabel(e.date_iso, e.created_at);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{e.title}</div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/60">
            <span>{e.category}</span>
            {e.subcategory ? <span>• {e.subcategory}</span> : null}
            {dateLabel ? (
              <span className="text-emerald-100/70">• {dateLabel}</span>
            ) : null}
          </div>

          <div className="mt-2 text-xs text-white/60">
            <span className="text-white/80">{e.buyer}</span> pagou{" "}
            <span className="text-white/80">{formatBRL(e.amount)}</span>
          </div>
        </div>

        <button
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-xs text-white/70 hover:text-white"
          onClick={async () => {
            await Services.removeExpense(e.id);
            await refresh();
          }}
          title="Remover despesa"
        >
          <Trash2 className="h-4 w-4" />
          Remover
        </button>
      </div>
    </div>
  );
}
