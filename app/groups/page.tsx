"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Group = {
  id: string;
  name: string;
  owner_email: string;
  created_at: string;
  description?: string | null;
  members?: string[] | null;
  start_at?: string | null;
};

export default function GroupsPage() {
  // sessão/estado base
  const [email, setEmail] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");

  // item selecionado
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => groups.find((g) => g.id === selectedId) || null,
    [groups, selectedId]
  );

  // form: novo/edição (reaproveito para os dois modos)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState(""); // csv
  const [startAt, setStartAt] = useState(""); // datetime-local

  // -------- utilidades --------
  function fillFormWith(g: Group | null) {
    if (!g) {
      setName("");
      setDescription("");
      setMembers("");
      setStartAt("");
      return;
    }
    setName(g.name || "");
    setDescription(g.description || "");
    setMembers((g.members || []).join(", "));
    setStartAt(
      g.start_at
        ? new Date(g.start_at).toISOString().slice(0, 16) // -> yyyy-MM-ddTHH:mm
        : ""
    );
  }

  // carrega e-mail salvo no login
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("acerto_email") : "";
    if (saved) setEmail(saved);
  }, []);

  // GET lista
  async function load() {
    if (!email) return;
    try {
      setErr("");
      setMsg("");
      setLoading(true);
      const res = await fetch(
        `/api/groups?ownerEmail=${encodeURIComponent(email)}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Erro ao listar grupos (${res.status})`);
      }
      const data: Group[] = await res.json();
      setGroups(Array.isArray(data) ? data : []);
      setMsg("Lista atualizada.");
    } catch (e: any) {
      setErr(e.message || "Falha ao carregar grupos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (email) load();
  }, [email]);

  // filtro
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, search]);

  // seleção na lista
  function select(g: Group) {
    setSelectedId(g.id);
    fillFormWith(g);
  }

  // modo "novo"
  function newMode() {
    setSelectedId(null);
    fillFormWith(null);
  }

  // POST criar
  async function createGroup() {
    setErr("");
    setMsg("");
    if (!email) return setErr("Faça login para definir o dono.");
    if (!name.trim()) return setErr("Informe o nome do grupo.");

    const payload = {
      name: name.trim(),
      ownerEmail: email,
      description: description.trim() || undefined,
      members:
        members
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean) || undefined,
      startAt: startAt || undefined,
    };

    const tempId = `temp-${Date.now()}`;
    const optimistic: Group = {
      id: tempId,
      name: payload.name,
      owner_email: email,
      created_at: new Date().toISOString(),
      description: payload.description || null,
      members: payload.members || null,
      start_at: payload.startAt || null,
    };
    setGroups((p) => [optimistic, ...p]);

    try {
      setLoading(true);
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao criar");

      setMsg("Grupo criado!");
      await load();
      newMode();
    } catch (e: any) {
      setErr(e.message || "Falha ao criar grupo.");
      setGroups((p) => p.filter((g) => g.id !== tempId));
    } finally {
      setLoading(false);
    }
  }

  // PUT atualizar
  async function updateGroup() {
    if (!selected) return;
    setErr("");
    setMsg("");

    const payload = {
      id: selected.id,
      name: name.trim(),
      description: description.trim() || null,
      members:
        members
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean) || null,
      startAt: startAt || null,
    };

    // otimista
    const prev = selected;
    setGroups((p) =>
      p.map((g) =>
        g.id === selected.id
          ? {
              ...g,
              name: payload.name || g.name,
              description: payload.description,
              members: payload.members,
              start_at: payload.startAt || undefined,
            }
          : g
      )
    );

    try {
      setLoading(true);
      const res = await fetch("/api/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao salvar");
      setMsg("Alterações salvas.");
      await load();
      setSelectedId(prev.id);
    } catch (e: any) {
      setErr(e.message || "Erro ao salvar");
      // rollback
      setGroups((p) => p.map((g) => (g.id === prev.id ? prev : g)));
    } finally {
      setLoading(false);
    }
  }

  // DELETE remover
  async function removeGroup() {
    if (!selected) return;
    setErr("");
    setMsg("");

    const id = selected.id;
    const backup = groups;
    setGroups((p) => p.filter((g) => g.id !== id));
    setSelectedId(null);
    fillFormWith(null);

    try {
      setLoading(true);
      const res = await fetch(`/api/groups?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao remover");
      setMsg("Grupo removido.");
    } catch (e: any) {
      setErr(e.message || "Erro ao remover");
      setGroups(backup); // rollback
    } finally {
      setLoading(false);
    }
  }

  const emailRight = useMemo(() => (email ? email : "—"), [email]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 20px",
        background: "radial-gradient(circle at 20% 20%, #0f3b31 0%, #071f1a 70%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: 24,
        }}
      >
        {/* ESQUERDA – LISTA */}
        <section
          style={{
            background: "#0f2e28",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,.35)",
            padding: 16,
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/logo.svg?v=2" alt="AcertÔ" style={{ height: 24 }} />
              <h2 style={{ margin: 0, color: "#e7fff3" }}>AcertÔ — Grupos</h2>
            </div>
            <small style={{ color: "#bfe7dc" }}>{emailRight}</small>
          </header>

          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar grupo"
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #295a4f",
                background: "#0a221d",
                color: "#e6fff7",
              }}
            />
            <button
              onClick={load}
              disabled={loading || !email}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background: "#18b08e",
                color: "#052622",
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "..." : "Atualizar"}
            </button>
          </div>

          {err && <p style={{ color: "#ffb3b3", margin: "6px 0 10px" }}>{err}</p>}
          {msg && <p style={{ color: "#a7ffd9", margin: "6px 0 10px" }}>{msg}</p>}

          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <AnimatePresence initial={false}>
              {filtered.map((g) => {
                const active = g.id === selectedId;
                return (
                  <motion.li
                    key={g.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    onClick={() => select(g)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      marginBottom: 8,
                      cursor: "pointer",
                      background: active ? "#153c34" : "#0a221d",
                      border: `1px solid ${active ? "#2aa78a" : "#295a4f"}`,
                      color: "#e9fff9",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{g.name}</div>
                    <small style={{ color: "#86a99f" }}>
                      {new Date(g.created_at).toLocaleString()}
                    </small>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {!filtered.length && !loading && (
            <p style={{ color: "#b8d7cf", marginTop: 10 }}>Nenhum grupo ainda.</p>
          )}

          <div style={{ marginTop: 16 }}>
            <Link href="/login" style={{ color: "#a7d4ff" }}>
              Trocar usuário
            </Link>
          </div>
        </section>

        {/* DIREITA – DETALHES / FORM */}
        <section
          style={{
            background: "#0f2e28",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,.35)",
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <h3 style={{ margin: 0, color: "#e7fff3" }}>
              {selected ? "Detalhe do grupo" : "Novo grupo"}
            </h3>
            {selected && (
              <button
                onClick={newMode}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #2aa78a",
                  background: "transparent",
                  color: "#9de7d4",
                  cursor: "pointer",
                }}
              >
                + Novo
              </button>
            )}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do grupo"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #295a4f",
                background: "#0a221d",
                color: "#e6fff7",
              }}
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={4}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #295a4f",
                background: "#0a221d",
                color: "#e6fff7",
                resize: "vertical",
              }}
            />

            <input
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="E-mails separados por vírgula"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #295a4f",
                background: "#0a221d",
                color: "#e6fff7",
              }}
            />

            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #295a4f",
                background: "#0a221d",
                color: "#e6fff7",
              }}
            />

            {/* ações */}
            {!selected ? (
              <button
                onClick={createGroup}
                disabled={loading}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "#1dd1a1",
                  color: "#062b26",
                  fontWeight: 800,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? "Criando..." : "Criar grupo"}
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={updateGroup}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "#1dd1a1",
                    color: "#062b26",
                    fontWeight: 800,
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  {loading ? "Salvando..." : "Salvar alterações"}
                </button>
                <button
                  onClick={removeGroup}
                  disabled={loading}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "#e25b5b",
                    color: "#280b0b",
                    fontWeight: 800,
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
