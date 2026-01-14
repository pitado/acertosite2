"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Receipt,
  AlertCircle,
  Settings,
  ArrowUpRight,
  BookOpen,
  BarChart3,
} from "lucide-react";

type Group = {
  id: string;
  name: string;
  description?: string;
  membersCount?: number;
  expensesCount?: number;
  totalAmount?: number;
};

type LogEntry = {
  id: string;
  message: string;
  created_at: string; // ISO
};

const LS_GROUPS = "acerto_groups";
const LS_NAME = "acerto_name";
const LS_AVATAR = "acerto_avatar";
const LS_ACTIVITY = "acerto_activity";

function createId(prefix = "id") {
  const uuid =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    // @ts-ignore
    globalThis.crypto?.randomUUID?.()
      ? // @ts-ignore
        globalThis.crypto.randomUUID()
      : "";
  return uuid || `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function addActivity(message: string) {
  const now = new Date().toISOString();
  const entry: LogEntry = { id: createId("log"), message, created_at: now };
  const list = readJSON<LogEntry[]>(LS_ACTIVITY, []);
  const updated = [entry, ...list].slice(0, 30);
  writeJSON(LS_ACTIVITY, updated);
  return updated;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [activity, setActivity] = useState<LogEntry[]>([]);

  // load localStorage
  useEffect(() => {
    setName(localStorage.getItem(LS_NAME) || "");
    setAvatar(localStorage.getItem(LS_AVATAR) || "");

    const storedGroups = readJSON<Group[]>(LS_GROUPS, []);
    setGroups(storedGroups);

    const storedLog = readJSON<LogEntry[]>(LS_ACTIVITY, []);
    setActivity(storedLog);
  }, []);

  const firstName = useMemo(() => {
    if (!name) return "Bem-vindo ao Acertô!";
    return `Bem-vindo ao Acertô, ${name.split(" ")[0]}!`;
  }, [name]);

  const initials = useMemo(() => {
    const base = name?.trim() || "A";
    return (base[0] || "A").toUpperCase();
  }, [name]);

  const hasGroups = groups.length > 0;

  // “métricas” fake por enquanto (sem banco)
  const monthTotal = useMemo(() => {
    // quando tiver banco, soma despesas do mês aqui.
    return "R$ 0,00";
  }, []);

  const pending = "0";
  const notSettled = "0";

  function persistGroups(next: Group[]) {
    setGroups(next);
    writeJSON(LS_GROUPS, next);
  }

  function handleCreateGroup() {
    const groupName = window.prompt("Nome do grupo:");
    if (!groupName || !groupName.trim()) return;

    const desc = window.prompt("Descrição (opcional):") || "";

    const newGroup: Group = {
      id: createId("g"),
      name: groupName.trim(),
      description: desc.trim() || undefined,
      membersCount: 1,
      expensesCount: 0,
      totalAmount: 0,
    };

    const updated = [newGroup, ...groups];
    persistGroups(updated);

    const log = addActivity(`Criou o grupo “${newGroup.name}”.`);
    setActivity(log);
  }

  function handleOpenGroup(g: Group) {
    const log = addActivity(`Abriu o grupo “${g.name}”.`);
    setActivity(log);

    // Quando você tiver a rota do grupo, troca por:
    // router.push(`/groups/${g.id}`)
    alert(`Abrir grupo: ${g.name} (troque pela rota /groups/${g.id})`);
  }

  function handleInvite(g: Group) {
    // Sem banco, a gente só “simula” a regra:
    // - Gerar um token local e copiar um link
    const token = createId("invite");
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://acerto.site";
    const link = `${origin}/invite?groupId=${encodeURIComponent(g.id)}&token=${encodeURIComponent(
      token
    )}`;

    navigator.clipboard?.writeText(link);
    const log = addActivity(`Gerou um convite para “${g.name}”.`);
    setActivity(log);

    alert(`Link de convite copiado!\n\n${link}`);
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-200px] left-1/3 h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 border-b border-white/10 bg-[#071611]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="font-semibold">{initials}</span>
              )}
            </div>

            <div className="leading-tight">
              <h1 className="text-lg font-semibold">Seus grupos</h1>
              <p className="text-sm text-white/60">
                Crie, gerencie e organize suas despesas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
              aria-label="Configurações do perfil"
              title="Perfil"
            >
              <Settings className="h-4 w-4" />
            </Link>

            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition"
            >
              <Plus className="h-4 w-4" />
              Novo grupo
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* BOAS-VINDAS */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="text-xl font-semibold">{firstName}</h2>
          <p className="text-sm text-white/60 mt-1">
            Crie, gerencie e organize suas despesas de forma simples e sem confusão.
          </p>
        </section>

        {/* RESUMOS */}
        <section className="grid md:grid-cols-4 gap-4">
          <Summary title="Total gasto este mês" value={monthTotal} icon={<Receipt className="h-5 w-5" />} />
          <Summary title="Seus grupos" value={groups.length.toString()} icon={<Users className="h-5 w-5" />} />
          <Summary title="Despesas pendentes" value={pending} icon={<AlertCircle className="h-5 w-5" />} />
          <Summary title="Ajustes não acertados" value={notSettled} icon={<BarChart3 className="h-5 w-5" />} />
        </section>

        {/* GRID: atividades + como funciona */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* ATIVIDADES */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Atividades recentes</h3>
              <button
                onClick={() => {
                  writeJSON(LS_ACTIVITY, []);
                  setActivity([]);
                }}
                className="text-xs text-white/60 hover:text-white transition"
              >
                limpar
              </button>
            </div>

            <div className="mt-4">
              {activity.length === 0 ? (
                <div className="text-sm text-white/60">
                  Aqui aparecerão suas últimas ações (criar grupo, convidar, abrir…).
                  <div className="mt-2 text-xs text-white/40">Nenhuma atividade recente.</div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {activity.slice(0, 6).map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3">
                      <div className="text-sm text-white/80">{a.message}</div>
                      <div className="text-xs text-white/40 whitespace-nowrap">
                        {formatWhen(a.created_at)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <button
                onClick={handleCreateGroup}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 text-left transition"
              >
                <div className="flex items-center gap-2 text-emerald-300">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium text-white">Crie um grupo</span>
                </div>
                <p className="mt-1 text-xs text-white/60">
                  Comece organizando por amigos, viagens ou casa.
                </p>
              </button>

              <button
                onClick={() => alert("Relatórios: quando tiver banco a gente liga :)")}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 text-left transition"
              >
                <div className="flex items-center gap-2 text-emerald-300">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm font-medium text-white">Ver relatórios</span>
                </div>
                <p className="mt-1 text-xs text-white/60">
                  Resumos do mês, por pessoa e por grupo.
                </p>
              </button>

              <Link
                href="/profile"
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 text-left transition block"
              >
                <div className="flex items-center gap-2 text-emerald-300">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium text-white">Seu perfil</span>
                </div>
                <p className="mt-1 text-xs text-white/60">
                  Mude nome, avatar e preferências.
                </p>
              </Link>
            </div>
          </div>

          {/* COMO FUNCIONA */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold">Como funciona o Acertô?</h3>

            <div className="mt-4 grid gap-3">
              <Step icon={<Users className="h-5 w-5" />} title="1) Crie um grupo" text="Ex.: viagem, república, amigos." />
              <Step icon={<Receipt className="h-5 w-5" />} title="2) Adicione despesas" text="Quem pagou, quanto e por quê." />
              <Step icon={<AlertCircle className="h-5 w-5" />} title="3) Veja os acertos" text="Quem deve quanto para quem." />
            </div>

            <button
              onClick={handleCreateGroup}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition"
            >
              Criar primeiro grupo
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => alert("Tutorial: depois a gente cria uma página /help bonitinha :)")}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 transition"
            >
              <BookOpen className="h-4 w-4" />
              Ver como funciona
            </button>
          </div>
        </section>

        {/* LISTA DE GRUPOS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Seus grupos</h3>
            <span className="text-sm text-white/60">
              {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
            </span>
          </div>

          {!hasGroups ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h4 className="font-semibold">Não há grupos por aqui</h4>
              <p className="text-sm text-white/60 mt-1">
                Que tal criar um agora e deixar as contas em ordem?
              </p>
              <button
                onClick={handleCreateGroup}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium w-fit"
              >
                <Plus className="h-4 w-4" />
                Criar grupo
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
                >
                  <h4 className="font-semibold">{g.name}</h4>
                  {g.description ? (
                    <p className="text-sm text-white/60 mt-1 line-clamp-2">{g.description}</p>
                  ) : (
                    <p className="text-sm text-white/40 mt-1">Sem descrição</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {g.membersCount ?? 1} membro(s)
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {g.expensesCount ?? 0} despesas
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Total: R$ {(g.totalAmount ?? 0).toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleInvite(g)}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-sm transition"
                    >
                      Convidar
                    </button>
                    <button
                      onClick={() => handleOpenGroup(g)}
                      className="flex-1 rounded-xl bg-emerald-500 text-black py-2 text-sm font-medium hover:bg-emerald-400 transition"
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="pt-6 pb-10 text-center text-xs text-white/40">
          <span className="hover:text-white/60 cursor-pointer">Ajuda</span>
          <span className="mx-2">·</span>
          <span className="hover:text-white/60 cursor-pointer">Privacidade</span>
          <span className="mx-2">·</span>
          <span className="hover:text-white/60 cursor-pointer">Sobre o Acertô</span>
        </footer>
      </main>
    </div>
  );
}

function Summary({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">{title}</p>
        <div className="text-emerald-300">{icon}</div>
      </div>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function Step({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className="text-emerald-300 mt-0.5">{icon}</div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-white/60 mt-1">{text}</div>
        </div>
      </div>
    </div>
  );
}
