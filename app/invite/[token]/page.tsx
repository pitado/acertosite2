"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, X, Users } from "lucide-react";

type InviteDTO = {
  token: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  email: string | null;
  expiresAt: string | null;
  usedAt: string | null;
  expired: boolean;
  used: boolean;
  group: { id: string; name: string; description: string | null };
  createdBy: { email: string; name: string | null } | null;
};

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteDTO | null>(null);
  const [error, setError] = useState<string>("");
  const [accepting, setAccepting] = useState(false);
  const [acceptedMsg, setAcceptedMsg] = useState("");

  const myEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("acerto_email") || "";
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/invites/${token}`, { method: "GET" });
        const data = await res.json();

        if (!res.ok) {
          setInvite(null);
          setError(data?.error || "Falha ao carregar convite.");
          return;
        }

        setInvite(data.invite as InviteDTO);
      } catch (_e) {
        setError("Falha ao carregar convite.");
      } finally {
        setLoading(false);
      }
    }

    if (token) load();
  }, [token]);

  async function acceptInvite() {
    if (!myEmail) {
      setError("Você precisa estar logado para aceitar o convite.");
      return;
    }
    if (!invite) return;

    setAccepting(true);
    setError("");

    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
        headers: {
          "x-user-email": myEmail,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao aceitar convite.");
        return;
      }

      setAcceptedMsg(`Você entrou no grupo "${data.groupName}"`);
      setTimeout(() => router.push("/groups"), 1200);
    } catch (_e) {
      setError("Erro ao aceitar convite.");
    } finally {
      setAccepting(false);
    }
  }

  const disabled =
    loading ||
    accepting ||
    !invite ||
    invite.used ||
    invite.expired;

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold">Convite para grupo</h1>
              <p className="text-sm text-white/60">
                Confirme abaixo se você quer entrar no grupo.
              </p>
            </div>
          </div>

          <div className="mt-5">
            {loading && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Carregando convite…
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {!loading && acceptedMsg && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {acceptedMsg}
              </div>
            )}

            {!loading && invite && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-white/50">Grupo</div>
                    <div className="text-lg font-semibold truncate">
                      {invite.group.name}
                    </div>
                    <div className="text-sm text-white/60 mt-1">
                      {invite.group.description || "Sem descrição por enquanto."}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-white/50">Permissão</div>
                    <div className="text-sm font-semibold text-emerald-200">
                      {invite.role === "OWNER"
                        ? "Dono"
                        : invite.role === "ADMIN"
                        ? "Admin"
                        : "Membro"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/50">Convidado por</div>
                    <div className="mt-1 text-white/80 truncate">
                      {invite.createdBy?.name || invite.createdBy?.email || "—"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/50">Validade</div>
                    <div className="mt-1 text-white/80">
                      {invite.expired
                        ? "Expirado"
                        : invite.expiresAt
                        ? new Date(invite.expiresAt).toLocaleString("pt-BR")
                        : "Sem expiração"}
                    </div>
                  </div>
                </div>

                {(invite.used || invite.expired) && (
                  <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-100">
                    {invite.used
                      ? "Este convite já foi usado."
                      : "Este convite expirou."}
                  </div>
                )}
              </div>
            )}

            {/* ações */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptInvite}
                disabled={disabled}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition disabled:opacity-60 disabled:hover:bg-emerald-500"
              >
                <Check className="h-4 w-4" />
                {accepting ? "Aceitando…" : "Aceitar convite"}
              </button>

              <Link
                href="/groups"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 transition"
              >
                <X className="h-4 w-4" />
                Recusar
              </Link>
            </div>

            {!myEmail && (
              <div className="mt-4 text-xs text-white/50">
                Você não está logado. Faça login primeiro, depois volte neste link
                para aceitar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
