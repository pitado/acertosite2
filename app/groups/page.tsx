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

import GroupModal from "./components/GroupModal";
import InviteModal from "./components/InviteModal";
import { Services, Group as ApiGroup, ActivityItem } from "./services";

type Group = ApiGroup;

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [inviteGroupId, setInviteGroupId] = useState<string | null>(null);

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityError, setActivityError] = useState<string>("");

  const groupsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setName(localStorage.getItem("acerto_name") || "");
    setAvatar(localStorage.getItem("acerto_avatar") || "");
  }, []);

  async function refresh() {
    const gs = await Services.listGroups();
    setGroups(gs);

    try {
      setActivityError("");
      const a = await Services.getDashboardActivity();
      setActivity(a);
    } catch (e: any) {
      setActivityError(e?.message || "Falha ao carregar atividades");
      setActivity([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const hasGroups = groups.length > 0;

  const firstName = useMemo(() => {
    if (!name) return "Bem-vindo ao Acertô";
    return `Bem-vindo ao Acertô, ${name.split(" ")[0]}!`;
  }, [name]);

  async function createGroup() {
    const groupName = prompt("Nome do grupo:");
    if (!groupName) return;

    await Services.createGroup(groupName.trim());
    await refresh();
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
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
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold truncate">Seus grupos</h1>

                <nav className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-white/30">|</span>
                  <Link
                    href="/groups"
                    className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white"
                  >
                    Grupos
                  </Link>
                  <Link
                    href="/reports"
                    className="px-2 py-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 text-white/70 hover:text-white transition"
                  >
                    Relatórios
                  </Link>
                </nav>
              </div>

              <p className="text-sm text-white/60 truncate">Crie, gerencie e organize seus grupos.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/reports"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
              title="Relatórios"
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </Link>

            <Link
              href="/profile"
              className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
              aria-label="Configurações do perfil"
              title="Perfil"
            >
              <Settings className="h-4 w-4" />
            </Link>

            <button
              onClick={createGroup}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition"
            >
              <Plus className="h-4 w-4" />
              Novo grupo
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* SAUDAÇÃO (SEM botão "Ver meus grupos") */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="text-xl font-semibold">{firstName}</h2>
          <p className="text-sm text-white/60 mt-1">Organize despesas sem dor de cabeça.</p>
        </section>

        {!hasGroups && (
          <section className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Não há grupos por aqui</h3>
              <p className="text-sm text-white/60 mt-1">Que tal criar um agora?</p>

              <button
                onClick={createGroup}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium w-fit hover:bg-emerald-400 transition"
              >
                <Plus className="h-4 w-4" />
                Criar primeiro grupo
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Como funciona o Acertô?</h3>
              <div className="grid grid-cols-3 gap-3">
                <Step icon={<Users />} text="Crie um grupo" />
                <Step icon={<Receipt />} text="Adicione despesas" />
                <Step icon={<AlertCircle />} text="Veja os acertos" />
              </div>
            </div>
          </section>
        )}

        {hasGroups && (
          <>
            {/* RESUMOS */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-white/70">Resumo do mês</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <Summary title="Total este mês" value="R$ 0,00" />
                <Summary title="Seus grupos" value={groups.length.toString()} />
                <Summary title="Pendentes" value="0" />
                <Summary title="Não acertados" value="0" />
              </div>
            </section>

            {/* ✅ AGORA INVERTIDO: ESQUERDA = GRUPOS / DIREITA = ATIVIDADES */}
            <section className="grid lg:grid-cols-3 gap-6">
              {/* MEUS GRUPOS (AGORA EM DESTAQUE) */}
              <div
                ref={groupsRef}
                className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Meus grupos</h3>
                  <button
                    onClick={createGroup}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-black font-medium hover:bg-emerald-400 transition text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Novo
                  </button>
                </div>

                <p className="mt-1 text-sm text-white/60">Acesse rapidamente seus grupos.</p>

                <div className="mt-4 grid md:grid-cols-2 gap-3">
                  {groups.map((g) => (
                    <div key={g.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">{g.name}</h4>
                          <p className="text-xs text-white/60 mt-1">
                            {g.description ? g.description : "Sem descrição"}
                          </p>
                        </div>

                        <button
                          className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
                          onClick={() => setSelectedGroup(g)}
                        >
                          Abrir
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-sm transition"
                          onClick={() => setInviteGroupId(g.id)}
                        >
                          Convidar
                        </button>
                        <button
                          className="flex-1 rounded-xl bg-emerald-500 text-black py-2 text-sm font-medium hover:bg-emerald-400 transition"
                          onClick={() => setSelectedGroup(g)}
                        >
                          Despesas
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-xs text-white/40">
                  Dica: quando a gente ligar saldo/pendências, dá pra mostrar aqui.
                </div>
              </div>

              {/* ATIVIDADES RECENTES (AGORA NA DIREITA) */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Atividades recentes</h3>
                  <button
                    onClick={refresh}
                    className="text-white/60 hover:text-white transition text-sm"
                    title="Atualizar"
                  >
                    ↻
                  </button>
                </div>

                <div className="mt-4 space-y-2 max-h-[420px] overflow-auto pr-1">
                  {activityError ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                      {activityError}
                    </div>
                  ) : activity.length ? (
                    activity.map((a) => (
                      <div key={a.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-sm">{a.message}</div>
                        <div className="mt-1 text-xs text-white/50">
                          {new Date(a.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                      <div className="mx-auto h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-white/70" />
                      </div>
                      <p className="mt-3 text-sm text-white/60">
                        Ainda não tem atividades. Quando criar grupo, convite ou despesa, aparece aqui.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* COMO FUNCIONA (mantém, sem repetir botões no topo) */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold">Como funciona o Acertô?</h3>

              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <QuickAction
                  icon={<Users className="h-5 w-5" />}
                  title="Crie um grupo"
                  subtitle="Comece definindo participantes"
                  onClick={createGroup}
                />
                <QuickAction
                  icon={<Receipt className="h-5 w-5" />}
                  title="Adicione despesas"
                  subtitle="Lance gastos e categorize"
                  onClick={() => alert("Abra um grupo e clique em Despesas")}
                />
                <Link
                  href="/reports"
                  className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 block"
                >
                  <div className="text-emerald-300">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-semibold">Ver relatórios</div>
                  <div className="mt-1 text-xs text-white/60">Acompanhe quem deve e quem recebe</div>
                </Link>
              </div>
            </section>
          </>
        )}
      </main>

      {selectedGroup && (
        <GroupModal group={selectedGroup} onClose={() => setSelectedGroup(null)} />
      )}

      {inviteGroupId && (
        <InviteModal groupId={inviteGroupId} onClose={() => setInviteGroupId(null)} />
      )}
    </div>
  );
}

function Summary({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <p className="text-sm text-white/60">{title}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
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

function QuickAction({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
    >
      <div className="text-emerald-300">{icon}</div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="mt-1 text-xs text-white/60">{subtitle}</div>
    </button>
  );
}
