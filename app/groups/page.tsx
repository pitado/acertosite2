"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Settings, X } from "lucide-react";

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

const LS_GROUPS_KEY = "acerto_groups";

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

function initialsFromName(name?: string) {
  const n = (name || "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function safeParseGroups(raw: string | null): Group[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    // defesa: garante shape mínimo
    return data
      .filter((g) => g && typeof g === "object")
      .map((g: any) => ({
        id: String(g.id ?? ""),
        name: String(g.name ?? ""),
        description: g.description ?? null,
        membersCount: typeof g.membersCount === "number" ? g.membersCount : 0,
        expensesCount: typeof g.expensesCount === "number" ? g.expensesCount : 0,
        totalAmount: typeof g.totalAmount === "number" ? g.totalAmount : 0,
      }))
      .filter((g) => g.id && g.name);
  } catch {
    return [];
  }
}

function getLocalGroups(): Group[] {
  if (typeof window === "undefined") return [];
  return safeParseGroups(localStorage.getItem(LS_GROUPS_KEY));
}

function setLocalGroups(list: Group[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(list));
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerAvatar, setOwnerAvatar] = useState("");

  // pega dados do "login com Google" que você salva no localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    setOwnerEmail(localStorage.getItem("acerto_email") ?? "");
    setOwnerName(localStorage.getItem("acerto_name") ?? "");
    setOwnerAvatar(localStorage.getItem("acerto_avatar") ?? "");
  }, []);

  async function loadGroups() {
    setLoading(true);
    try {
      const list = getLocalGroups();
      setGroups(list);
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

  function createId() {
    // @ts-expect-error - crypto pode não existir em alguns ambientes
    const uuid = typeof crypto !== "undefined" && crypto?.randomUUID ? crypto.randomUUID() : "";
    return uuid || `g_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  function handleCreate() {
    if (typeof window === "undefined") return;

    const name = prompt("Nome do grupo:");
    if (!name || !name.trim()) return;

    const description = prompt("Descrição (opcional):") ?? "";

    const newGroup: Group = {
      id: createId(),
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      membersCount: 1,
      expensesCount: 0,
      totalAmount: 0,
    };

    const next = [newGroup, ...getLocalGroups()];
    setLocalGroups(next);
    setGroups(next);
  }

  const displayName = ownerName || (ownerEmail ? ownerEmail.split("@")[0] : "Você");

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
            {/* Avatar do Google / fallback iniciais */}
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
              {ownerAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ownerAvatar}
                  alt="Foto do perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {initialsFromName(ownerName || ownerEmail)}
                </span>
              )}
            </div>

            <div className="leading-tight">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Seus grupos
              </h1>
              <p className="text-xs sm:text-sm text-white/60">
                Olá,{" "}
                <span className="text-white/80 font-medium">{displayName}</span>
                . Crie, busque e gerencie seus grupos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão de configurações do perfil */}
            <Link
              href="/profile"
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              aria-label="Configurar perfil"
              title="Configurar perfil"
            >
              <Settings className="h-5 w-5 text-white/80" />
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
                <GroupCard key={g.id} group={g} onRefresh={loadGroups} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
