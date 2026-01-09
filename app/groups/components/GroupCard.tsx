"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, UserPlus, CheckCircle2, AlertTriangle } from "lucide-react";
import Modal from "./Modal";

type Group = {
  id: string;
  name: string;
  description?: string | null;
  membersCount?: number;
  expensesCount?: number;
  totalAmount?: number;
};

type Props = {
  group: Group;
  onRefresh: () => void;
};

type Invite = {
  email: string;
  invitedAt: string;
  status: "pending" | "accepted";
};

const INVITES_KEY = "acerto_group_invites_v1";

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function isValidEmail(email: string) {
  // simples e eficiente pro seu caso
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function GroupCard({ group, onRefresh }: Props) {
  const members = group.membersCount ?? 1;
  const expenses = group.expensesCount ?? 0;
  const total = group.totalAmount ?? 0;

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const ownerEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("acerto_email") ?? "";
  }, []);

  const [invites, setInvites] = useState<Invite[]>([]);

  function loadInvites() {
    const all = safeJsonParse<Record<string, Invite[]>>(
      typeof window !== "undefined" ? localStorage.getItem(INVITES_KEY) : null,
      {}
    );
    setInvites(Array.isArray(all[group.id]) ? all[group.id] : []);
  }

  function saveInvites(next: Invite[]) {
    const all = safeJsonParse<Record<string, Invite[]>>(
      localStorage.getItem(INVITES_KEY),
      {}
    );
    all[group.id] = next;
    localStorage.setItem(INVITES_KEY, JSON.stringify(all));
    setInvites(next);
  }

  useEffect(() => {
    loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  const pendingCount = invites.filter((i) => i.status === "pending").length;

  function openInvite() {
    setInviteMsg(null);
    setInviteEmail("");
    loadInvites();
    setInviteOpen(true);
  }

  function invite() {
    const email = inviteEmail.trim().toLowerCase();
    setInviteMsg(null);

    if (!email) {
      setInviteMsg({ type: "err", text: "Digite o e-mail da pessoa." });
      return;
    }
    if (!isValidEmail(email)) {
      setInviteMsg({ type: "err", text: "E-mail inválido. Ex.: pessoa@gmail.com" });
      return;
    }
    if (ownerEmail && email === ownerEmail.trim().toLowerCase()) {
      setInviteMsg({ type: "err", text: "Você não pode convidar você mesmo." });
      return;
    }

    const exists = invites.some((i) => i.email.toLowerCase() === email);
    if (exists) {
      setInviteMsg({ type: "err", text: "Esse e-mail já foi convidado." });
      return;
    }

    const next: Invite[] = [
      { email, invitedAt: new Date().toISOString(), status: "pending" },
      ...invites,
    ];
    saveInvites(next);

    setInviteMsg({ type: "ok", text: "Convite registrado! (sem banco por enquanto)" });
    setInviteEmail("");
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold truncate">{group.name}</h3>
          <p className="text-sm text-white/60 line-clamp-2">
            {group.description || "Sem descrição"}
          </p>
        </div>

        <button
          onClick={() => alert("Abrir grupo (troque aqui pela rota do grupo).")}
          className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition inline-flex items-center gap-2"
        >
          Abrir <span className="opacity-70">→</span>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
          👥 {members} membro{members === 1 ? "" : "s"}
        </span>
        <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
          💸 {expenses} despesa{expenses === 1 ? "" : "s"}
        </span>
        <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
          Total: R$ {total.toFixed(2)}
        </span>

        {pendingCount > 0 ? (
          <span className="text-xs px-3 py-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
            {pendingCount} convite{pendingCount === 1 ? "" : "s"} pendente{pendingCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={openInvite}
          className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 transition inline-flex items-center justify-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Convidar
        </button>

        <button
          onClick={() => onRefresh()}
          className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium px-4 py-2 transition"
        >
          Atualizar
        </button>
      </div>

      {/* Modal Convidar */}
      <Modal
        open={inviteOpen}
        title={`Convidar para "${group.name}"`}
        description="Sem banco por enquanto: o convite fica salvo no seu navegador (localStorage)."
        onClose={() => setInviteOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setInviteOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm transition"
            >
              Fechar
            </button>
            <button
              onClick={invite}
              className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium px-4 py-2 text-sm transition inline-flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Enviar convite
            </button>
          </div>
        }
      >
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-white/70">E-mail do convidado</span>
            <input
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteMsg(null);
              }}
              placeholder="pessoa@gmail.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
            />
          </label>

          {inviteMsg ? (
            <div
              className={[
                "text-sm rounded-xl px-3 py-2 border flex items-start gap-2",
                inviteMsg.type === "ok"
                  ? "text-emerald-200 bg-emerald-500/10 border-emerald-500/20"
                  : "text-red-200 bg-red-500/10 border-red-500/20",
              ].join(" ")}
            >
              {inviteMsg.type === "ok" ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 mt-0.5" />
              )}
              <span>{inviteMsg.text}</span>
            </div>
          ) : null}

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium">Convites pendentes</div>

            {pendingCount === 0 ? (
              <div className="text-sm text-white/60 mt-2">Nenhum convite pendente.</div>
            ) : (
              <div className="mt-3 grid gap-2">
                {invites
                  .filter((i) => i.status === "pending")
                  .map((i) => (
                    <div
                      key={i.email}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/10 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-white/85 truncate">{i.email}</div>
                        <div className="text-xs text-white/50">
                          Pendente
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const next = invites.filter((x) => x.email !== i.email);
                          saveInvites(next);
                        }}
                        className="text-xs rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-1 transition"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="text-xs text-white/50">
            Depois que você ligar um banco, a gente transforma isso em convite real (link/token ou e-mail).
          </div>
        </div>
      </Modal>
    </div>
  );
}
