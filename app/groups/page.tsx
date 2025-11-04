"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Group = { id: string; name: string; owner_email: string; created_at: string };

export default function GroupsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("Meu grupo");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // carrega e-mail salvo no login
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("acerto_email") : "";
    if (saved) setEmail(saved);
  }, []);

  async function load() {
    if (!email) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/groups?ownerEmail=${encodeURIComponent(email)}`);
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setMsg("Erro ao carregar grupos");
    } finally {
      setLoading(false);
    }
  }

  async function createGroup() {
    if (!email || !name) {
      setMsg("Preencha e-mail e nome do grupo");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ownerEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`Erro: ${data?.error || "desconhecido"}`);
      } else {
        await load();
        setName("");
      }
    } catch (e: any) {
      setMsg("Erro ao criar grupo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (email) load(); }, [email]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 25% 25%, #0f3b31 0%, #071f1a 70%)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(960px, 100%)",
          padding: 24,
          background: "#12352d",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
          color: "#e8fff7",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <img src="/logo.svg" alt="AcertÔ" style={{ height: 28 }} />
          <h1 style={{ margin: 0 }}>AcertÔ — Grupos</h1>
          <div style={{ marginLeft: "auto", color: "#a7d4ff", fontSize: 14 }}>{email}</div>
        </div>

        {/* form */}
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1.2fr 1fr auto auto" }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail (owner)"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #2b5e50", background: "#0b221d", color: "#e6fff7" }}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do grupo"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #2b5e50", background: "#0b221d", color: "#e6fff7" }}
          />
          <button
            onClick={createGroup}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(90deg,#1dd1a1,#17b58b)",
              color: "#062b26",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Criar grupo
          </button>
          <button
            onClick={load}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #2b5e50",
              background: "transparent",
              color: "#e6fff7",
              cursor: "pointer",
            }}
          >
            Atualizar
          </button>
        </div>

        {/* status */}
        {msg && <p style={{ marginTop: 12, color: "#ffb3b3" }}>{msg}</p>}
        {loading && <p style={{ marginTop: 12 }}>Carregando…</p>}

        {/* lista */}
        <ul style={{ marginTop: 16, paddingLeft: 18 }}>
          {groups.map((g) => (
            <li key={g.id} style={{ marginBottom: 6 }}>
              <b>{g.name}</b> — {g.owner_email}{" "}
              <small>({new Date(g.created_at).toLocaleString()})</small>
            </li>
          ))}
          {!groups.length && !loading && <li>Nenhum grupo ainda.</li>}
        </ul>

        {/* rodapé */}
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Link href="/login" style={{ color: "#a7d4ff" }}>
            Trocar usuário
          </Link>
        </div>
      </div>
    </main>
  );
}
