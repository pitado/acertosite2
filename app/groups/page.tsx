"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import GroupCard from "./components/GroupCard";
import EmptyState from "./components/EmptyState";

type Group = {
  id: string;
  name: string;
  description?: string | null;
  membersCount?: number;
  expensesCount?: number;
  totalAmount?: number;
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 w-full">
          <div className="h-4 w-2/3 bg-white/10 rounded" />
          <div className="h-3 w-1/2 bg-white/10 rounded" />
        </div>
        <div className="h-9 w-24 bg-white/10 rounded-xl" />
      </div>

      <div className="mt-4 flex gap-2">
        <div className="h-7 w-20 bg-white/10 rounded-full" />
        <div className="h-7 w-24 bg-white/10 rounded-full" />
        <div className="h-7 w-28 bg-white/10 rounded-full" />
      </div>

      <div className="mt-5 h-10 w-full bg-white/10 rounded-xl" />
    </div>
  );
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ dados do usuário (vindos do login Google)
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    setUserName(localStorage.getItem("acerto_name") ?? "");
    setUserAvatar(localStorage.getItem("acerto_avatar") ?? "");
    setUserEmail(localStorage.getItem("acerto_email") ?? "");
  }, []);

  async function loadGroups() {
    setLoading(true);
    try {
      const res = await fetch("/api/groups", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : data.groups ?? []);
      } else {
        setGroups([]);
      }
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => (g.name ?? "").toLowerCase().includes(q));
  }, [groups, search]);

  function handleCreate() {
    alert("Abrir modal de criar grupo (troque aqui pelo seu modal).");
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#071611] text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[520px] w-[520px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[520px] w-[520px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#071611]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* ✅ Avatar / fallback */}
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName ? `Avatar de ${userName}` : "Avatar"}
                className="h-10 w-10 rounded-xl border border-white/10 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {(userName?.trim()?.[0] ?? "A").toUpperCase()}
                </span>
              </div>
            )}

            <div className="leading-tight">
              {/* ✅ Saudação com nome */}
              <p className="text-xs sm:text-sm text-white/60">
                {userName ? `Olá, ${userName}` : userEmail ? userEmail : "Olá!"}
              </p>

              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Seus grupos
              </h1>

              {/* ✅ tirei o “0 total” (pra ficar mais clean) */}
              <p className="text-xs sm:text-sm text-white/60">
                Crie, busque e gerencie seus grupos de forma rápida.
              </p>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium px-4 py-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo grupo</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar grupos..."
              className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl pl-10 pr-10 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
            />
            {search.trim().length > 0 && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4 text-white/70" />
              </button>
            )}
          </div>

          <div className="text-sm text-white/60 sm:whitespace-nowrap">
            Mostrando{" "}
            <span className="text-white/80 font-medium">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "grupo" : "grupos"}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              hasSearch={search.trim().length > 0}
              onCreate={handleCreate}
              onClearSearch={() => setSearch("")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((g) => (
                <GroupCard key={g.id} group={g} onRefresh={loadGroups} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
