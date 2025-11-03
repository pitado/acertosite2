"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Group = { id: string; name: string; owner_email: string; created_at: string };

export default function Home() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("Grupo Teste");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // carrega e-mail do "login"
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("acerto_email") : "";
    if (saved) setEmail(saved);
  }, []);

  async function load() {
    if (!email) return;
    setLoading(true);
    setMsg("");
    const res = await fetch(`/api/groups?ownerEmail=${encodeURIComponent(email)}`);
    const data = await res.json();
    setGroups(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function createGroup() {
    if (!email || !name) {
      setMsg("Preencha e-mail e nome do grupo");
      return;
    }
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ownerEmail: email }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(`Erro: ${data?.error || "desconhecido"}`);
    await load();
  }

  useEffect(() => { if (email) load(); }, [email]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 560, padding: 24, background: "#12352d", borderRadius: 12 }}>
        <h1 style={{ marginTop: 0 }}>AcertÔ — Grupos</h1>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail (owner)"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #2b5e50" }}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do grupo"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #2b5e50" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button
            onClick={createGroup}
            style={{ padding: 10, borderRadius: 8, border: "none", background: "#1dd1a1", color: "#07251f", fontWeight: 600 }}
          >
            Criar grupo
          </button>
          <button
            onClick={load}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #2b5e50", background: "transparent", color: "#fff" }}
          >
            Atualizar lista
          </button>
          <Link href="/login" style={{ alignSelf: "center", marginLeft: "auto", color: "#a7d4ff" }}>
            Trocar usuário
          </Link>
        </div>

        {msg && <p style={{ marginTop: 12, color: "#ffb3b3" }}>{msg}</p>}
        {loading && <p style={{ marginTop: 12 }}>Carregando…</p>}

        <ul style={{ marginTop: 16, paddingLeft: 18 }}>
          {groups.map((g) => (
            <li key={g.id}>
              <b>{g.name}</b> — {g.owner_email}{" "}
              <small>({new Date(g.created_at).toLocaleString()})</small>
            </li>
          ))}
          {!groups.length && !loading && <li>Nenhum grupo ainda.</li>}
        </ul>
      </div>
    </main>
  );
}
