"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function CreateGroupModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => name.trim().length > 0 && !loading, [name, loading]);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setName("");
    setDescription("");
    setLoading(false);
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function create() {
    setErr(null);

    const email = localStorage.getItem("acerto_email") || "";
    if (!email) {
      setErr("Você precisa estar logado para criar um grupo.");
      return;
    }

    const n = name.trim();
    const d = description.trim();

    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email,
        },
        body: JSON.stringify({
          name: n,
          description: d.length ? d : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Erro ao criar grupo.");
        setLoading(false);
        return;
      }

      onClose();
      onCreated?.();
    } catch {
      setErr("Erro de rede ao criar grupo.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#071611] shadow-xl relative overflow-hidden">
        {/* glow interno */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        </div>

        <div className="relative p-6 sm:p-7">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/60 hover:text-white transition"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-xl font-semibold">Criar novo grupo</h2>
          <p className="text-sm text-white/60 mt-1">
            Dê um nome e (se quiser) uma descrição. Depois a gente liga despesas, membros e relatórios.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm text-white/70">Nome do grupo</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Viagem da turma"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-white/70">Descrição (opcional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: gastos do Airbnb, mercado, rolês…"
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
              />
            </label>

            {err && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
              </div>
            )}

            <div className="mt-1 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 transition disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                onClick={create}
                disabled={!canSubmit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-black font-medium hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar grupo"
                )}
              </button>
            </div>

            <p className="text-xs text-white/40">
              Dica: depois dá pra colocar “foto do grupo”, “membros” e “regras de divisão”.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
