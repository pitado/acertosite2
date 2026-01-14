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

type Group = {
  id: string;
  name: string;
  description?: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const groupsRef = useRef<HTMLDivElement | null>(null);

  // 🔹 carrega dados do usuário + grupos (localStorage)
  useEffect(() => {
    setName(localStorage.getItem("acerto_name") || "");
    setAvatar(localStorage.getItem("acerto_avatar") || "");

    const stored = localStorage.getItem("acerto_groups");
    if (stored) setGroups(JSON.parse(stored));
  }, []);

  const hasGroups = groups.length > 0;

  const firstName = useMemo(() => {
    if (!name) return "Bem-vindo ao Acertô";
    return `Bem-vindo ao Acertô, ${name.split(" ")[0]}!`;
  }, [name]);

  function scrollToGroups() {
    groupsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function createId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `g_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  function createGroup() {
    const groupName = prompt("Nome do grupo:");
    if (!groupName) return;

    const newGroup: Group = {
      id: createId(),
      name: groupName.trim(),
    };

    const updated = [...groups, newGroup];
    setGroups(updated);
    localStorage.setItem("acerto_groups", JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      {/* HEADER (✅ AGORA STICKY pra não sumir) */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071611]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-semibold">
                  {(name?.[0] || "A").toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold truncate">Seus grupos</h1>

                {/* ✅ “Aba”/atalho no topo */}
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

              <p className="text-sm text-white/60 truncate">
                Crie, gerencie e organize seus grupos.
              </p>
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

      {/* CONTENT */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* SAUDAÇÃO + CTA */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{firstName}</h2>
            <p className="text-sm text-white/60 mt-1">
              Crie, gerencie e organize suas despesas de forma simples.
            </p>
          </div>

          {hasGroups ? (
            <button
              onClick={scrollToGroups}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 transition"
            >
              Ver meus grupos
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={createGroup}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition"
            >
              <Sparkles className="h-4 w-4" />
              Criar primeiro grupo
            </button>
          )}
        </section>

        {/* SEM GRUPOS */}
        {!hasGroups && (
          <section className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Não há grupos por aqui</h3>
              <p className="text-sm text-white/60 mt-1">
                Que tal criar um agora e deixar as contas em ordem?
              </p>

              <button
                onClick={createGroup}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium w-fit hover:bg-emerald-400 transition"
              >
                <Plus className="h-4 w-4" />
                Criar primeiro grupo
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Como funciona o Acertô?
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <Step icon={<Users />} text="Crie um grupo" />
                <Step icon={<Receipt />} text="Adicione despesas" />
                <Step icon={<AlertCircle />} text="Veja os acertos" />
              </div>
            </div>
          </section>
        )}

        {/* COM GRUPOS */}
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

            {/* DASHBOARD ORGANIZADO */}
            <section className="grid lg:grid-cols-3 gap-6">
              {/* COLUNA ESQUERDA */}
              <div className="lg:col-span-2 space-y-6">
                {/* Atividades recentes */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Atividades recentes</h3>
                    <button className="text-white/60 hover:text-white transition text-sm">
                      ⋯
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-white/70" />
                    </div>
                    <p className="mt-3 text-sm text-white/60">
                      Aqui aparecerão as últimas despesas, acertos e movimentações.
                    </p>
                    <p className="mt-2 text-xs text-white/40">
                      • Nenhuma atividade recente
                    </p>
                  </div>
                </div>

                {/* Como funciona */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                  <h3 className="text-lg font-semibold">Como funciona o Acertô?</h3>

                  <div className="mt-4 grid sm:grid-cols-3 gap-3">
                    <QuickAction
                      icon={<Users className="h-5 w-5" />}
                      title="Crie um grupo"
                      subtitle="Comece definindo os participantes"
                      onClick={createGroup}
                    />
                    <QuickAction
                      icon={<Receipt className="h-5 w-5" />}
                      title="Adicionar despesas"
                      subtitle="Lance gastos e categorize"
                      onClick={() => alert("Em breve: adicionar despesas")}
                    />
                    {/* ✅ Agora vai pra página de relatórios */}
                    <Link
                      href="/reports"
                      className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 block"
                    >
                      <div className="text-emerald-300">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div className="mt-3 font-semibold">Ver relatórios</div>
                      <div className="mt-1 text-xs text-white/60">
                        Acompanhe quem deve e quem recebe
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA: GRUPOS */}
              <div
                ref={groupsRef}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
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

                <p className="mt-1 text-sm text-white/60">
                  Acesse rapidamente seus grupos.
                </p>

                <div className="mt-4 space-y-3 max-h-[520px] overflow-auto pr-1">
                  {groups.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">{g.name}</h4>
                          <p className="text-xs text-white/60 mt-1">
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
                          onClick={() =>
                            alert("Convidar (vamos ligar certinho quando tiver banco)")
                          }
                        >
                          Convidar
                        </button>
                        <button
                          className="flex-1 rounded-xl bg-emerald-500 text-black py-2 text-sm font-medium hover:bg-emerald-400 transition"
                          onClick={() => alert("Atualizar (quando tiver banco/serviço)")}
                        >
                          Atualizar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-xs text-white/40">
                  Dica: quando a gente ligar o banco, dá pra mostrar “pendentes”,
                  “última atividade” e “saldo do grupo” aqui.
                </div>
              </div>
            </section>
          </>
        )}
      </main>
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
