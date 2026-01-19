"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type InviteInfo = {
  token: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  expiresAt: string | null;
  createdAt: string;
  createdBy: string | null;
  group: {
    id: string;
    name: string;
    description: string | null;
  };
};

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<"accept" | "reject" | null>(null);
  const email = useMemo(() => localStorage.getItem("acerto_email") || "", []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/invites/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setInvite(null);
          setError(data?.error || "Convite inválido");
          return;
        }

        setInvite(data.invite as InviteInfo);
      } catch {
        setError("Falha ao carregar convite.");
      } finally {
        setLoading(false);
      }
    }

    if (!token || token === "undefined") {
      setLoading(false);
      setError("Token inválido.");
      return;
    }

    load();
  }, [token]);

  async function accept() {
    if (!email) {
      setError("Você precisa estar logado para aceitar o convite.");
      return;
    }
    setActionLoading("accept");
    setError("");

    const res = await fetch(`/api/invites/${token}/accept`, {
      method: "POST",
      headers: { "x-user-email": email },
    });

    const data = await res.json().catch(() => ({}));

    setActionLoading(null);

    if (res.ok) {
      router.push("/groups");
      return;
    }

    setError(data?.error || "Erro ao aceitar convite");
  }

  async function reject() {
    if (!email) {
      setError("Você precisa estar logado para recusar o convite.");
      return;
    }
    setActionLoading("reject");
    setError("");

    const res = await fetch(`/api/invites/${token}/reject`, {
      method: "POST",
      headers: { "x-user-email": email },
    });

    const data = await res.json().catch(() => ({}));

    setActionLoading(null);

    if (res.ok) {
      router.push("/groups");
      return;
    }

    setError(data?.error || "Erro ao recusar convite");
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h1 className="text-xl font-semibold">Convite para grupo</h1>
        <p className="text-sm text-white/60 mt-1">
          Confirme abaixo se você quer entrar no grupo.
        </p>

        <div className="mt-5">
          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Carregando convite...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && invite && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white/60">Grupo</div>
                  <div className="text-lg font-semibold truncate">{invite.group.name}</div>
                  <div className="text-sm text-white/60 mt-1">
                    {invite.group.description || "Sem descrição por enquanto."}
                  </div>
                </div>

                <div className="text-right text-xs text-white/50">
                  <div>Permissão: {invite.role}</div>
                  {invite.createdBy && <div>Convidou: {invite.createdBy}</div>}
                  {invite.expiresAt && <div>Expira: {new Date(invite.expiresAt).toLocaleString()}</div>}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={reject}
                  disabled={actionLoading !== null}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition py-3"
                >
                  {actionLoading === "reject" ? "Recusando..." : "Recusar"}
                </button>

                <button
                  onClick={accept}
                  disabled={actionLoading !== null}
                  className="rounded-xl bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition py-3"
                >
                  {actionLoading === "accept" ? "Aceitando..." : "Aceitar convite"}
                </button>
              </div>

              {!email && (
                <div className="mt-4 text-xs text-amber-200/80">
                  Você não está logado (faltou <code>acerto_email</code> no localStorage).
                  Faça login e abra o link novamente.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
