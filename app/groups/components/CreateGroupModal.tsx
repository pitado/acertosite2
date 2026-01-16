"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateGroupModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    setErr(null);

    const groupName = name.trim();
    if (!groupName) {
      setErr("Digite o nome do grupo.");
      return;
    }

    setLoading(true);

    const email = localStorage.getItem("acerto_email") || "";

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email,
      },
      body: JSON.stringify({
        name: groupName,
        description: description.trim() ? description.trim() : null,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(data?.error || "Erro ao criar grupo.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#071611] p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-semibold">Novo grupo</h2>
        <p className="text-sm text-white/60 mt-1">
          Crie um grupo para organizar despesas e acertos.
        </p>

        <div className="mt-5 space-y-4">
          <label className="grid gap-2">
            <span className="text-sm text-white/70">Nome do grupo</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Viagem, República, Churrasco..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-white/70">Descrição (opcional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Gastos da viagem de janeiro..."
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
            />
          </label>

          {err && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          )}

          <button
            onClick={create}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 font-medium text-black hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Criando..." : "Criar grupo"}
          </button>
        </div>
      </div>
    </div>
  );
}
