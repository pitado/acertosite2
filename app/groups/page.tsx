"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Info, Loader2, Plus, Search } from "lucide-react";

import { GroupCard } from "./components/GroupCard";
import { GroupModal } from "./components/GroupModal";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { EmptyState } from "./components/EmptyState";
import { GroupDetailsPanel } from "./components/GroupDetailsPanel";
import type { Expense, Group, Invite, LogEntry, Member } from "./types";
import { Services } from "./services";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function GroupsPage() {
  const ownerEmail =
    typeof window !== "undefined" ? (localStorage.getItem("acerto_email") || "").toLowerCase() : "";
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[] | null>(null);
  const [selectedInvites, setSelectedInvites] = useState<Invite[] | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Member[] | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<LogEntry[] | null>(null);

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
        if (data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(data[0].id);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerEmail, selectedGroupId]);

  useEffect(() => {
    (async () => {
      if (!selectedGroupId) {
        setSelectedExpenses(null);
        setSelectedInvites(null);
        setSelectedMembers(null);
        setSelectedLogs(null);
        return;
      }
      const data = await Services.listExpenses(selectedGroupId);
      setSelectedExpenses(data);
      const [invites, members, logs] = await Promise.all([
        Services.listInvites(selectedGroupId),
        Services.listMembers(selectedGroupId),
        Services.listLogs(selectedGroupId),
      ]);
      setSelectedInvites(invites);
      setSelectedMembers(members);
      setSelectedLogs(logs);
    })();
  }, [selectedGroupId]);

  const selectedGroup = useMemo(
    () => items.find((g) => g.id === selectedGroupId) || null,
    [items, selectedGroupId]
  );

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
      if (selectedGroupId === id) {
        setSelectedGroupId(null);
        setSelectedExpenses(null);
      }
    } catch (e: any) {
      setError(e.message || "Erro ao excluir");
    }
  }

  async function refreshMembers() {
    if (!selectedGroupId) return;
    const members = await Services.listMembers(selectedGroupId);
    setSelectedMembers(members);
  }

  async function handleCreateInvite() {
    if (!selectedGroupId) return null;
    const invite = await Services.createInvite(selectedGroupId);
    const invites = await Services.listInvites(selectedGroupId);
    setSelectedInvites(invites);
    return invite.token;
  }

  return (
    <div className="min-h-screen bg-[#0f2a24] text-white p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="AcertÔ"
            className="h-10 w-10 md:h-12 md:w-12 drop-shadow-[0_2px_6px_rgba(0,0,0,.35)]"
          />
          <span className="sr-only">AcertÔ</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {ownerEmail && (
            <span className="px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-800/60 text-xs text-emerald-100/80">
              {ownerEmail}
            </span>
          )}
          <button
            onClick={async () => {
              const supabase = getSupabaseClient();
              if (supabase) {
                await supabase.auth.signOut();
              }
              localStorage.removeItem("acerto_email");
              window.location.href = "/login";
            }}
            className="px-3 py-2 rounded-xl border border-emerald-800/60 text-emerald-100/90 hover:bg-emerald-800/40 text-sm"
          >
            Sair
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Criar grupo
          </button>
        </div>
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
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {filtered.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`text-left ${
                    selectedGroupId === g.id
                      ? "ring-2 ring-emerald-400/70 rounded-2xl"
                      : ""
                  }`}
                >
                  <GroupCard
                    g={g}
                    ownerEmail={ownerEmail}
                    onEdit={() => {
                      setEditing(g);
                      setOpen(true);
                    }}
                    onDelete={() => setConfirm({ id: g.id, name: g.name })}
                  />
                </button>
              ))}
            </div>
            <GroupDetailsPanel
              group={selectedGroup}
              expenses={selectedExpenses}
              invites={selectedInvites}
              members={selectedMembers}
              logs={selectedLogs}
              onRefreshMembers={refreshMembers}
              onCreateInvite={handleCreateInvite}
            />
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
