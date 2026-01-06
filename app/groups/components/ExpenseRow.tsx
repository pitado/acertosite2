import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Paperclip } from "lucide-react";

import { formatBRL } from "../constants";
import type { Expense } from "../types";
import { Services } from "../services";

export function ExpenseRow({ e, refresh }: { e: Expense; refresh: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="text-sm">
      <div className="flex items-center gap-2">
        <div className="font-medium text-emerald-50">
          {e.title} • {formatBRL(Number(e.amount))}
          {e.paid ? (
            <span className="ml-2 text-xs bg-emerald-700/60 px-2 py-0.5 rounded">Pago</span>
          ) : (
            <span className="ml-2 text-xs text-amber-300">Pendente</span>
          )}
        </div>
        <span className="text-emerald-100/70 text-xs">
          • {new Date(e.date_iso).toLocaleDateString()}
        </span>
        <button
          className="ml-auto inline-flex items-center gap-1 text-emerald-200/80 hover:text-emerald-100 text-[11px]"
          onClick={() => setOpen((v) => !v)}
        >
          Ver detalhes{" "}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="text-emerald-100/75 mt-2">
              {e.location && <div className="mt-1">Local: {e.location}</div>}
              {e.proof_url && (
                <div className="mt-2">
                  <a
                    href={e.proof_url}
                    target="_blank"
                    className="text-xs underline inline-flex items-center gap-1"
                  >
                    <Paperclip className="h-3 w-3" />
                    Ver comprovante
                  </a>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                className="text-emerald-200/70 hover:text-red-300 text-xs"
                onClick={async () => {
                  await Services.removeExpense(e.id);
                  await refresh();
                }}
              >
                Excluir
              </button>
              {!e.paid && (
                <>
                  <button
                    className="text-emerald-200/70 hover:text-emerald-100 text-xs"
                    onClick={async () => {
                      await Services.markPaid(e.id, "owner");
                      await refresh();
                    }}
                  >
                    Marcar como pago
                  </button>
                  <label
                    htmlFor={`proof-${e.id}`}
                    className="text-emerald-200/70 hover:text-emerald-100 text-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    <Paperclip className="h-3 w-3" />
                    Adicionar comprovante
                  </label>
                  <input
                    id={`proof-${e.id}`}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={async (ev) => {
                      const f = ev.target.files?.[0];
                      if (!f) return;
                      const fr = new FileReader();
                      fr.onload = async () => {
                        await Services.attachProof(e.id, String(fr.result), "owner");
                        await refresh();
                      };
                      fr.readAsDataURL(f);
                    }}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
