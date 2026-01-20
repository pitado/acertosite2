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
import type { LogEntry } from "./types";

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
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [activity, setActivity] = useState<LogEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

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
      setGroups(gs || []);
      await loadRecentActivity(gs || []);
    } catch {
      setGroups([]);
      setActivity([]);
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
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
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
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="text-xl font-semibold">{firstName}</h2>
          <p className="text-sm text-white/60 mt-1">
            Organize despesas sem dor de cabeça.
          </p>
        </section>

        {hasGroups && (
          <section className="grid lg:grid-cols-3 gap-6">
            {/* GRUPOS */}
            <div
              ref={groupsRef}
              className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Meus grupos</h3>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-black text-sm font-medium hover:bg-emerald-400 transition"
                >
                  <Plus className="h-4 w-4" />
                  Novo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-5 hover:bg-white/[0.08] transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-emerald-300" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold truncate">
                          {g.name}
                        </h4>
                        <p className="text-sm text-white/60 mt-1 line-clamp-2">
                          {g.description || "Sem descrição"}
                        </p>
                      </div>

                      <button
                        className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm"
                        onClick={() => setSelectedGroup(g)}
                      >
                        Abrir
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-sm"
                        onClick={() => setInviteGroupId(g.id)}
                      >
                        Convidar
                      </button>
                      <button
                        className="rounded-xl bg-emerald-500 text-black py-2 text-sm font-semibold hover:bg-emerald-400 transition"
                        onClick={() => setSelectedGroup(g)}
                      >
                        Despesas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ATIVIDADES */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Atividades recentes
              </h3>

              {activityLoading ? (
                <div className="text-sm text-white/60">Carregando...</div>
              ) : activity.length ? (
                <div className="space-y-2">
                  {activity.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
                    >
                      <div>{a.message}</div>
                      <div className="mt-1 text-xs text-white/50">
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-white/60">
                  Nenhuma atividade ainda.
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {createOpen && (
        <CreateGroupModal onClose={() => setCreateOpen(false)} onCreated={loadGroups} />
      )}

      {selectedGroup && (
        <GroupModal
          group={selectedGroup}
          onClose={() => {
            setSelectedGroup(null);
            loadGroups();
          }}
          onInvite={(id) => setInviteGroupId(id)}
        />
      )}

      {inviteGroupId && (
        <InviteModal groupId={inviteGroupId} onClose={() => setInviteGroupId(null)} />
      )}
    </div>
  );
}
