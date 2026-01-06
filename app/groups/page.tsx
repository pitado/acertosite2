"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Info, Loader2, Plus, Search } from "lucide-react";

import { GroupCard } from "./components/GroupCard";
import { GroupModal } from "./components/GroupModal";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { EmptyState } from "./components/EmptyState";
import type { Group } from "./types";
import { Services } from "./services";

export default function GroupsPage() {
  const ownerEmail =
    typeof window !== "undefined" ? (localStorage.getItem("acerto_email") || "").toLowerCase() : "";
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal grupo
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await Services.listGroups(ownerEmail, "");
        setItems(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerEmail]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return s ? items.filter((g) => g.name.toLowerCase().includes(s)) : items;
  }, [items, search]);

  async function handleSave(p: {
    name: string;
    description?: string;
    emails: string[];
    roleDateISO?: string;
  }) {
    setError(null);
    try {
      if (editing) {
        await Services.updateGroup(editing.id, { ...p });
      } else {
        await Services.createGroup(ownerEmail, p);
      }
      const re = await Services.listGroups(ownerEmail);
      setItems(re);
      setOpen(false);
      setEditing(null);
    } catch (e: any) {
      setError(e.message || "Erro ao salvar");
    }
  }

  async function handleDelete(id: string) {
    try {
      await Services.deleteGroup(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      setConfirm(null);
    } catch (e: any) {
      setError(e.message || "Erro ao excluir");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f2a24] text-white p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="text-emerald-300">AcertÔ</span>
            {/* porquinho no lugar do “— Grupos” */}
            <img
              src="/pig.svg" /* altere para /logo.svg se for o nome do seu arquivo */
              alt="AcertÔ"
              className="h-8 w-8 md:h-10 md:w-10 drop-shadow-[0_2px_6px_rgba(0,0,0,.35)]"
            />
          </h1>
          <span className="sr-only">Grupos</span>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Criar grupo
        </button>
      </header>

      <section className="max-w-6xl mx-auto mt-6">
        <div className="flex items-center gap-2 bg-emerald-900/50 border border-emerald-800/60 rounded-xl p-2">
          <Search className="h-5 w-5 text-emerald-200/80 ml-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar grupos…"
            className="bg-transparent outline-none w-full text-emerald-50 placeholder:text-emerald-200/60"
          />
        </div>
      </section>

      <main className="max-w-6xl mx-auto mt-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-800/60 bg-red-900/40 p-3 text-sm text-red-100 flex items-center gap-2">
            <Info className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-emerald-100/80">
            <Loader2 className="h-6 w-6 mr-2 animate-spin" /> Carregando…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            onCreate={() => {
              setEditing(null);
              setOpen(true);
            }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => (
              <GroupCard
                key={g.id}
                g={g}
                ownerEmail={ownerEmail}
                onEdit={() => {
                  setEditing(g);
                  setOpen(true);
                }}
                onDelete={() => setConfirm({ id: g.id, name: g.name })}
              />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {open && (
          <GroupModal
            key={editing?.id || "create"}
            open={open}
            onClose={() => {
              setOpen(false);
              setEditing(null);
            }}
            initial={editing}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm && (
          <ConfirmDeleteModal
            name={confirm.name}
            onCancel={() => setConfirm(null)}
            onConfirm={() => handleDelete(confirm.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
