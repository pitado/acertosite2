"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

type Props = {
  groupId: string;
  onClose: () => void;
};

export default function InviteModal({ groupId, onClose }: Props) {
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setCopied(false);

    const email = localStorage.getItem("acerto_email") || "";

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email,
      },
      body: JSON.stringify({
        groupId,
        role,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setLink(`${window.location.origin}/invite/${data.token}`);
    } else {
      alert(data.error || "Erro ao gerar convite");
    }

    setLoading(false);
  }

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#071611] p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-semibold">Convidar pessoa</h2>
        <p className="text-sm text-white/60 mt-1">
          Gere um link para convidar alguém ao grupo.
        </p>

        {/* ROLE */}
        <div className="mt-4">
          <label className="text-sm text-white/70">Permissão</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <option value="MEMBER">Membro</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        {!link ? (
          <button
            onClick={generate}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-emerald-500 py-2 font-medium text-black hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Gerando..." : "Gerar convite"}
          </button>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm break-all">
              {link}
            </div>

            <button
              onClick={copy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar link
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
