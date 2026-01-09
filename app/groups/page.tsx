"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, X, UsersRound, Settings } from "lucide-react";

import GroupCard from "./components/GroupCard";
import EmptyState from "./components/EmptyState";
import type { Group } from "./types";
import Services from "./services";

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

  const [ownerEmail, setOwnerEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("acerto_email") ?? "";
    const name = localStorage.getItem("acerto_name") ?? "";
    const avatar = localStorage.getItem("acerto_avatar") ?? "";
    setOwnerEmail(email);
    setUserName(name);
    setUserAvatar(avatar);
  }, []);

  async function loadGroups(email: string) {
    setLoading(true);
    try {
      const list = await Services.listGroups(email);
      setGroups(list);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ownerEmail) return;
    loadGroups(ownerEmail);
  }, [ownerEmail]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => (g.name ?? "").toLowerCase().includes(q));
  }, [groups, search]);

  function handleCreate() {
    alert("Abrir modal de criar grupo (troque aqui pelo seu modal).");
  }

  const headerName = userName || (ownerEmail ? ownerEmail.split("@")[0] : "você");
  const initial = (headerName?.[0] || "A").toUpperCase();

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
            {/* Ícone de grupos (mais “app”, menos “IA”) */}
            <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <UsersRound className="h-5 w-5 text-white/80" />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                  Seus grupos
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-white/60">
                Olá, <span className="text-white/80 font-medium">{headerName}</span> — crie, busque e gerencie seus grupos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Avatar + Perfil */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition"
              title="Perfil"
            >
              <div className="h-8 w-8 rounded-xl overflow-hidden border border-white/10 bg-white/10 flex items-center justify-center">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold">{initial}</span>
                )}
              </div>

              <span className="hidden sm:inline text-sm text-white/80">Perfil</span>
              <Settings className="h-4 w-4 text-white/60 hidden sm:inline" />
            </Link>

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
                <GroupCard
                  key={g.id}
                  group={{
                    id: g.id,
                    name: g.name,
                    description: g.description ?? null,
                    membersCount: (g as any).membersCount ?? (g as any).members_count ?? 0,
                    expensesCount: (g as any).expensesCount ?? (g as any).expenses_count ?? 0,
                    totalAmount: (g as any).totalAmount ?? (g as any).total_amount ?? 0,
                  }}
                  onRefresh={() => loadGroups(ownerEmail)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
