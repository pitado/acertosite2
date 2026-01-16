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

type Group = {
  id: string;
  name: string;
  description?: string | null;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const [inviteGroupId, setInviteGroupId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const groupsRef = useRef<HTMLDivElement | null>(null);

  // carrega dados do usuário + grupos
  useEffect(() => {
    setName(localStorage.getItem("acerto_name") || "");
    setAvatar(localStorage.getItem("acerto_avatar") || "");
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadGroups() {
    const email = localStorage.getItem("acerto_email") || "";
    if (!email) return;

    const res = await fetch("/api/groups", {
      headers: { "x-user-email": email },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      setGroups(data.groups || []);
    }
  }

  const hasGroups = groups.length > 0;

  const firstName = useMemo(() => {
    if (!name) return "Bem-vindo ao Acertô";
    return `Bem-vindo ao Acertô, ${name.split(" ")[0]}!`;
  }, [name]);

  function scrollToGroups() {
    groupsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
                <span className="font-semibold">
                  {(name?.[0] || "A").toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">Seus grupos</h1>
              <p className="text-sm text-white/60 truncate">
                Crie, gerencie e organize seus grupos.
              </p>
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
              aria-label="Perfil"
              title="Perfil"
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
            <p className="text-sm text-white/60 mt-1">
              Organize despesas sem dor de cabeça.
            </p>
          </div>

          {hasGroups ? (
            <button
              onClick={scrollToGroups}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 transition"
            >
              Ver meus grupos
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
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
            {/* COLUNA ESQUERDA */}
            <div className="lg:col-span-2 space-y-6">
              {/* Atividades */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold">Atividades recentes</h3>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                  <Receipt className="mx-auto h-6 w-6 text-white/60" />
                  <p className="mt-3 text-sm text-white/60">
                    Em breve: despesas, acertos e movimentações.
                  </p>
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

            {/* COLUNA DIREITA: GRUPOS */}
            <div
              ref={groupsRef}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Meus grupos</h3>
                <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
                  {groups.length}
                </span>
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
                        {g.description ? (
                          <p className="text-xs text-white/60 mt-1 line-clamp-2">
                            {g.description}
                          </p>
                        ) : (
                          <p className="text-xs text-white/40 mt-1">
                            Sem descrição
                          </p>
                        )}
                      </div>

                      <button
                        className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
                        onClick={() => alert("Página do grupo (próximo passo)")}
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
                        onClick={() => alert("Em breve: adicionar despesas")}
                      >
                        Despesas
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-white/40">
                Quando ligarmos despesas/membros, aqui dá pra mostrar “pendentes”, “última atividade” e “saldo do grupo”.
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL CRIAR GRUPO */}
      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadGroups}
      />

      {/* MODAL CONVITE */}
      {inviteGroupId && (
        <InviteModal groupId={inviteGroupId} onClose={() => setInviteGroupId(null)} />
      )}
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
