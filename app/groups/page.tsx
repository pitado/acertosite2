"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, X, Settings } from "lucide-react";

import GroupCard from "./components/GroupCard";
import EmptyState from "./components/EmptyState";
import Modal from "./components/Modal";

type Group = {
  id: string;
  name: string;
  description?: string | null;
  membersCount?: number;
  expensesCount?: number;
  totalAmount?: number;
};

const LS_GROUPS_KEY = "acerto_groups_v1";

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function createId() {
  const uuid =
    typeof window !== "undefined" &&
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : "";
  return uuid || `g_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

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

  // Perfil (pra mostrar “Olá, Nome”)
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");

  // Modal criar grupo
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [createError, setCreateError] = useState<string>("");

  const initial = useMemo(() => {
    const base = name || (email ? email.split("@")[0] : "A");
    return (base?.[0] || "A").toUpperCase();
  }, [name, email]);

  function loadGroups() {
    setLoading(true);
    const list = safeJsonParse<Group[]>(
      typeof window !== "undefined" ? localStorage.getItem(LS_GROUPS_KEY) : null,
      []
    );
    setGroups(Array.isArray(list) ? list : []);
    setLoading(false);
  }

  function saveGroups(next: Group[]) {
    setGroups(next);
    localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(next));
  }

  useEffect(() => {
    // perfil
    setEmail(localStorage.getItem("acerto_email") ?? "");
    setName(localStorage.getItem("acerto_name") ?? "");
    setAvatar(localStorage.getItem("acerto_avatar") ?? "");

    // grupos
    loadGroups();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => (g.name ?? "").toLowerCase().includes(q));
  }, [groups, search]);

  function openCreate() {
    setCreateError("");
    setNewName("");
    setNewDesc("");
    setCreateOpen(true);
  }

  function createGroup() {
    const n = newName.trim();
    const d = newDesc.trim();

    if (!n) {
      setCreateError("Digite um nome para o grupo.");
      return;
    }
    if (n.length < 2) {
      setCreateError("O nome do grupo precisa ter pelo menos 2 caracteres.");
      return;
    }

    const group: Group = {
      id: createId(),
      name: n,
      description: d || null,
      membersCount: 1,
      expensesCount: 0,
      totalAmount: 0,
    };

    const next = [group, ...groups];
    saveGroups(next);
    setCreateOpen(false);
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
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-white/10 bg-white/10 flex items-center justify-center">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold">{initial}</span>
              )}
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                  Seus grupos
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-white/60">
                Olá, <span className="text-white/80 font-medium">{name || "Miguel"}</span>. Crie,
                busque e gerencie seus grupos.
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
              <Settings className="h-5 w-5 text-white/80" />
            </Link>

            <button
              onClick={openCreate}
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
            <EmptyState onCreate={openCreate} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((g) => (
                <GroupCard
                  key={g.id}
                  group={g}
                  onRefresh={loadGroups}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Criar grupo */}
      <Modal
        open={createOpen}
        title="Criar novo grupo"
        description="Dê um nome e (se quiser) uma descrição. Depois você convida as pessoas."
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={createGroup}
              className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium px-4 py-2 text-sm transition"
            >
              Criar
            </button>
          </div>
        }
      >
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-white/70">Nome do grupo</span>
            <input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setCreateError("");
              }}
              placeholder="Ex.: República do AP 12"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-white/70">Descrição (opcional)</span>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Ex.: Grupo para dividir aluguel, luz e mercado."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 resize-none"
            />
          </label>

          {createError ? (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {createError}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
