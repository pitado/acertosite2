"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Receipt,
  AlertCircle,
  Settings,
  ChevronRight,
  Sparkles,
  BarChart3,
} from "lucide-react";

import InviteModal from "./components/InviteModal";
import CreateGroupModal from "./components/CreateGroupModal";
import GroupModal from "./components/GroupModal";
import { Services } from "./services";
import type { LogEntry, Expense } from "./types";

type Group = {
  id: string;
  name: string;
  description?: string | null;
};

type GroupPreview = {
  monthTotal: number;
  expenseCount: number;
  lastAt: Date | null;
  lastExpenses: Expense[];
};

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function parseExpenseDate(e: Expense): Date | null {
  const raw: any = (e as any).date_iso || (e as any).created_at || (e as any).createdAt;
  if (!raw) return null;
  const dt = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const [inviteGroupId, setInviteGroupId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [activity, setActivity] = useState<LogEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [previews, setPreviews] = useState<Record<string, GroupPreview>>({});
  const [previewsLoading, setPreviewsLoading] = useState(false);

  const groupsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setName(localStorage.getItem("acerto_name") || "");
    setAvatar(localStorage.getItem("acerto_avatar") || "");
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadGroups() {
    try {
      const gs = await Services.listGroups();
      const list = gs || [];
      setGroups(list);

      // carrega previews (despesas) e atividades em paralelo
      await Promise.all([loadGroupPreviews(list), loadRecentActivity(list)]);
    } catch {
      setGroups([]);
      setActivity([]);
      setPreviews({});
    }
  }

  async function loadGroupPreviews(gs: Group[]) {
    if (!gs.length) {
      setPreviews({});
      return;
    }

    setPreviewsLoading(true);
    try {
      const monthStart = startOfMonth(new Date());

      const entries = await Promise.all(
        gs.map(async (g) => {
          try {
            const ex = (await Services.listExpenses(g.id)) || [];

            // ordena por data desc
            const sorted = [...ex].sort((a, b) => {
              const da = parseExpenseDate(a)?.getTime() ?? 0;
              const db = parseExpenseDate(b)?.getTime() ?? 0;
              return db - da;
            });

            const lastAt = sorted.length ? parseExpenseDate(sorted[0]) : null;

            let monthTotal = 0;
            for (const e of ex) {
              const dt = parseExpenseDate(e);
              if (!dt || dt < monthStart) continue;
              monthTotal += Number((e as any).amount || 0);
            }

            const preview: GroupPreview = {
              monthTotal: Math.round(monthTotal * 100) / 100,
              expenseCount: ex.length,
              lastAt,
              lastExpenses: sorted.slice(0, 3),
            };

            return [g.id, preview] as const;
          } catch {
            const preview: GroupPreview = {
              monthTotal: 0,
              expenseCount: 0,
              lastAt: null,
              lastExpenses: [],
            };
            return [g.id, preview] as const;
          }
        })
      );

      const map: Record<string, GroupPreview> = {};
      for (const [gid, pv] of entries) map[gid] = pv;
      setPreviews(map);
    } finally {
      setPreviewsLoading(false);
    }
  }

  async function loadRecentActivity(gs: Group[]) {
    if (!gs.length) {
      setActivity([]);
      return;
    }

    setActivityLoading(true);
    try {
      const lists = await Promise.all(
        gs.map(async (g) => {
          try {
            return await Services.listActivity(g.id);
          } catch {
            return [];
          }
        })
      );

      const merged = lists
        .flat()
        .filter(Boolean)
        .sort((a, b) => {
          const da = new Date(a.created_at as any).getTime();
          const db = new Date(b.created_at as any).getTime();
          return db - da;
        })
        .slice(0, 15);

      setActivity(merged);
    } finally {
      setActivityLoading(false);
    }
  }

  const hasGroups = groups.length > 0;

  const firstName = useMemo(() => {
    if (!name) return "Bem-vindo ao Acertô";
    return `Bem-vindo ao Acertô, ${name.split(" ")[0]}!`;
  }, [name]);

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="-top-40 -left-40 absolute h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="top-32 -right-40 absolute h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="bottom-[-220px] left-1/3 absolute h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071611]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
              {avatar ? (
                <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="font-semibold">{(name?.[0] || "A").toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">Seus grupos</h1>
              <p className="text-sm text-white/60 truncate">Crie, gerencie e organize seus grupos.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/reports"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </Link>

            <Link
              href="/profile"
              className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
            >
              <Settings className="h-4 w-4" />
            </Link>

            <button
              onClick={() => setCreateOpen(true)}
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
        {/* SAUDAÇÃO */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{firstName}</h2>
            <p className="text-sm text-white/60 mt-1">Organize despesas sem dor de cabeça.</p>
          </div>

          {!hasGroups && (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition"
            >
              <Sparkles className="h-4 w-4" />
              Criar primeiro grupo
            </button>
          )}
        </section>

        {/* DASHBOARD */}
        {hasGroups && (
          <section className="grid lg:grid-cols-3 gap-6">
            {/* COLUNA ESQUERDA (GRUPOS) */}
            <div
              ref={groupsRef}
              className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Meus grupos</h3>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-black font-medium hover:bg-emerald-400 transition text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Novo
                </button>
              </div>

              <div className="mt-5 max-h-[520px] overflow-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groups.map((g) => {
                    const pv = previews[g.id];

                    return (
                      <div
                        key={g.id}
                        className="group relative rounded-3xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.08] transition overflow-hidden"
                      >
                        {/* overlay clicável */}
                        <button
                          onClick={() => setSelectedGroup(g)}
                          className="absolute inset-0 z-[1] cursor-pointer"
                          aria-label={`Abrir grupo ${g.name}`}
                        />

                        {/* brilho sutil */}
                        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition">
                          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
                          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
                        </div>

                        <div className="relative z-[2] p-5">
                          {/* topo */}
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center shrink-0">
                              <Users className="h-5 w-5 text-emerald-300" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-lg font-semibold truncate">{g.name}</h4>
                              <p className="text-sm text-white/60 mt-1 line-clamp-2">
                                {g.description?.trim() ? g.description : "Sem descrição"}
                              </p>

                              {/* chips */}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">
                                  Total mês:{" "}
                                  <b className="ml-1 text-emerald-200">
                                    {pv ? formatBRL(pv.monthTotal) : "—"}
                                  </b>
                                </span>

                                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">
                                  Despesas:{" "}
                                  <b className="ml-1 text-white/90">{pv ? pv.expenseCount : "—"}</b>
                                </span>

                                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">
                                  Atualizado:{" "}
                                  <b className="ml-1 text-white/90">
                                    {pv?.lastAt ? pv.lastAt.toLocaleDateString() : "—"}
                                  </b>
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              <button
                                className="relative z-[3] inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGroup(g);
                                }}
                              >
                                Abrir
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* preview despesas */}
                          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-white/80">Últimas despesas</span>
                              <span className="text-xs text-white/50">
                                {previewsLoading ? "carregando..." : ""}
                              </span>
                            </div>

                            {!pv?.lastExpenses?.length ? (
                              <div className="mt-3 text-sm text-white/50">
                                Nenhuma despesa ainda.
                              </div>
                            ) : (
                              <div className="mt-3 space-y-2">
                                {pv.lastExpenses.map((e: any) => (
                                  <div
                                    key={e.id}
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                                  >
                                    <div className="min-w-0">
                                      <div className="truncate text-white/85">
                                        {String(e.title || "Despesa")}
                                      </div>
                                      <div className="text-xs text-white/50">
                                        {parseExpenseDate(e)?.toLocaleDateString() || ""}
                                        {e.payer ? ` • ${String(e.payer)}` : ""}
                                      </div>
                                    </div>
                                    <div className="shrink-0 font-semibold text-emerald-200">
                                      {formatBRL(Number(e.amount || 0))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* ações */}
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              className="relative z-[3] rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-sm transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInviteGroupId(g.id);
                              }}
                            >
                              Convidar
                            </button>

                            <button
                              className="relative z-[3] rounded-xl bg-emerald-500 text-black py-2.5 text-sm font-semibold hover:bg-emerald-400 transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGroup(g);
                              }}
                            >
                              Abrir despesas
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA (ATIVIDADES) */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold">Atividades recentes</h3>

                <div className="mt-4">
                  {activityLoading ? (
                    <div className="text-sm text-white/60">Carregando...</div>
                  ) : activity.length ? (
                    <div className="space-y-2">
                      {activity.map((a) => (
                        <div
                          key={a.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80"
                        >
                          <div>{a.message}</div>
                          <div className="mt-1 text-xs text-white/50">
                            {new Date(a.created_at as any).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                      <Receipt className="mx-auto h-6 w-6 text-white/60" />
                      <p className="mt-3 text-sm text-white/60">Nenhuma atividade ainda.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Como funciona */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold">Como funciona o Acertô?</h3>

                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <Step icon={<Users />} text="Crie um grupo" />
                  <Step icon={<Receipt />} text="Adicione despesas" />
                  <Step icon={<AlertCircle />} text="Veja os acertos" />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL: CRIAR GRUPO */}
      {createOpen && <CreateGroupModal onClose={() => setCreateOpen(false)} onCreated={loadGroups} />}

      {/* MODAL: GRUPO */}
      {selectedGroup && (
        <GroupModal
          group={selectedGroup}
          onClose={() => {
            setSelectedGroup(null);
            loadGroups();
          }}
          onInvite={(groupId) => setInviteGroupId(groupId)}
        />
      )}

      {/* MODAL: CONVITE */}
      {inviteGroupId && <InviteModal groupId={inviteGroupId} onClose={() => setInviteGroupId(null)} />}
    </div>
  );
}

function Step({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center gap-2 text-center">
      <div className="text-emerald-400">{icon}</div>
      <span className="text-sm">{text}</span>
    </div>
  );
}
