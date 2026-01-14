"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Link as LinkIcon,
  Copy,
  X,
  Check,
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

  // modal criar grupo
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // modal convidar
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteGroup, setInviteGroup] = useState<Group | null>(null);

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
    // client component → no browser crypto normalmente existe
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `g_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  function persist(updated: Group[]) {
    setGroups(updated);
    localStorage.setItem("acerto_groups", JSON.stringify(updated));
  }

  function openCreate() {
    setNewName("");
    setNewDesc("");
    setIsCreateOpen(true);
  }

  function createGroup() {
    const groupName = newName.trim();
    if (!groupName) return;

    const newGroup: Group = {
      id: createId(),
      name: groupName,
      description: newDesc.trim() || undefined,
    };

    const updated = [...groups, newGroup];
    persist(updated);
    setIsCreateOpen(false);

    // opcional: rola até os grupos
    setTimeout(() => scrollToGroups(), 100);
  }

  function openInvite(g: Group) {
    setInviteGroup(g);
    setInviteOpen(true);
  }

  function updateGroup(g: Group) {
    // mock por enquanto
    alert(`Atualizar "${g.name}" (quando tiver banco/serviço)`);
  }

  function openGroup(g: Group) {
    // quando tiver rota do grupo, troca aqui:
    alert(`Abrir "${g.name}" (quando tiver a página do grupo)`);
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      {/* HEADER (sticky) */}
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
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold truncate">Seus grupos</h1>

                {/* abas (ok manter) */}
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
            {/* ✅ mantém só no topo (sem repetir em outras áreas) */}
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
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400
