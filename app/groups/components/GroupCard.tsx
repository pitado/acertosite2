"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Copy, Link as LinkIcon, X, Users } from "lucide-react";

type Group = {
  id: string;
  name: string;
  description?: string | null;
};

export default function GroupCard({
  g,
  ownerEmail,
  onEdit,
  onDelete,
  onRefresh,
}: {
  g: Group;
  ownerEmail: string;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh?: () => void | Promise<void>;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [err, setErr] = useState<string>("");

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function createInvite() {
    setErr("");
    setCreating(true);
    setInviteLink("");
    setExpiresAt("");

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": ownerEmail,
        },
        body: JSON.stringify({
          groupId: g.id,
          role: "MEMBER", // pode trocar pra "ADMIN" se quiser
          // expiresInMinutes: 60, // se seu backend aceitar (opcional)
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Não consegui gerar o convite.");
        setCreating(false);
        return;
      }

      // esperado: { token, expiresAt }
      const token = data?.token;
      const exp = data?.expiresAt;

      if (!token) {
        setErr("Convite gerado, mas não veio o token. Verifique a API.");
        setCreating(false);
        return;
      }

      const link = `${origin}/invite/${token}`;
      setInviteLink(link);
      if (exp) setExpiresAt(exp);

      setCreating(false);
    } catch {
      setErr("Erro ao gerar convite.");
      setCreating(false);
    }
  }

  async function copy() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert("Link copiado!");
    } catch {
      alert("Não consegui copiar automaticamente. Copie manualmente.");
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-semibold truncate">{g.name}</h4>
            <p className="text-xs text-white/60 mt-1 flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              1 membro · R$ 0,00
            </p>
          </div>

          <button
            className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
            onClick={() => alert("Abrir (quando tiver a página do grupo)")}
          >
            Abrir
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-sm transition"
            onClick={() => {
              setInviteOpen(true);
              setInviteLink("");
              setExpiresAt("");
              setErr("");
            }}
          >
            Convidar
          </button>

          <button
            className="flex-1 rounded-xl bg-emerald-500 text-black py-2 text-sm font-medium hover:bg-emerald-400 transition"
            onClick={async () => {
              await onRefresh?.();
            }}
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* MODAL */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setInviteOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#071611]/95 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold truncate">Convidar para: {g.name}</h3>
                <p className="text-sm text-white/60">
                  Gere um link e envie para a pessoa entrar no grupo.
                </p>
              </div>

              <button
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
                onClick={() => setInviteOpen(false)}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <button
                onClick={createInvite}
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-black font-medium px-4 py-2.5 hover:bg-emerald-400 transition disabled:opacity-60"
              >
                <LinkIcon className="h-4 w-4" />
                {creating ? "Gerando..." : "Gerar link de convite"}
              </button>

              {err && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {err}
                </div>
              )}

              {inviteLink && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60">Link do convite</div>
                  <div className="mt-1 break-all text-sm text-white/90">{inviteLink}</div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={copy}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar
                    </button>

                    {expiresAt && (
                      <div className="ml-auto text-xs text-white/50 self-center">
                        Expira em: {new Date(expiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-white/40">
                ⚠️ O convite só funciona para quem estiver logado (porque usamos o email do login).
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
