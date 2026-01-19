"use client";

import { useState } from "react";
import { X, Copy, Link as LinkIcon, Shield, User } from "lucide-react";
import { Services } from "../services";

export default function InviteModal({
  groupId,
  onClose,
}: {
  groupId: string;
  onClose: () => void;
}) {
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function generate() {
    try {
      setError("");
      setLoading(true);
      const data = await Services.createInvite(groupId, role);
      setLink(data.link);
    } catch (e: any) {
      setError(e?.message || "Erro ao gerar convite");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#071611]/95 backdrop-blur-xl p-6 text-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-lg font-semibold">Convidar pessoa</h3>
        <p className="text-sm text-white/60 mt-1">
          Gere um link para convidar alguém ao grupo.
        </p>

        <div className="mt-4 space-y-2">
          <div className="text-sm text-white/70">Permissão</div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
          >
            <option value="MEMBER">Membro</option>
            <option value="ADMIN">Admin</option>
            {/* Observador: por enquanto vira MEMBER (só label). Se quiser role real, eu ajusto o schema. */}
          </select>

          <div className="text-xs text-white/40">
            • Admin: pode gerenciar membros e despesas. <br />
            • Membro: adiciona despesas e participa da divisão.
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition disabled:opacity-60"
          >
            <LinkIcon className="h-4 w-4" />
            {loading ? "Gerando..." : "Gerar link"}
          </button>

          {link ? (
            <button
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 transition"
            >
              <Copy className="h-4 w-4" />
              Copiar
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {link && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Link do convite</div>
            <div className="mt-1 break-all text-sm">{link}</div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-white/60" /> Recomendado: expira em 24h
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-white/60" /> Entra via link
          </div>
        </div>
      </div>
    </div>
  );
}
