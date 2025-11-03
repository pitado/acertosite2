"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Group = { id: string; name: string; owner_email: string; created_at: string };

export default function GroupsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // pega o "usuário" salvo no login
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

  async function createGroup(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email || !name.trim()) {
      setMsg("Preencha o nome do grupo.");
      return;
    }
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), ownerEmail: email }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(`Erro: ${data?.error || "desconhecido"}`);
    setName("");
    await load();
  }

  useEffect(() => { if (email) load(); }, [email]);

  return (
    <main className="login-wrap" style={{ paddingTop: 40 }}>
      <div className="card" style={{ maxWidth: 760 }}>
        <div className="logo" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.svg" alt="AcertÔ" style={{ height: 36 }} />
            <h1 style={{ margin: 0 }}>Seus Grupos</h1>
          </div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>
            {email ? `Logado como: ${email}` : <Link href="/login" className="link">Fazer login</Link>}
          </div>
        </div>

        <form onSubmit={createGroup} style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr auto" }}>
          <input
            className="input"
            placeholder="Nome do novo grupo (ex.: Viagem Floripa)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn" type="submit">Criar</button>
        </form>

        {msg && <p style={{ marginTop: 12, color: "#ffb3b3" }}>{msg}</p>}
        {loading && <p style={{ marginTop: 12 }}>Carregando…</p>}

        <div className="hr" />

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {groups.map((g) => (
            <li key={g.id} style={{
              background: "#0b221d",
              border: "1px solid #1b3e35",
              borderRadius: 12,
              padding: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {new Date(g.created_at).toLocaleString()}
                </div>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{g.owner_email}</span>
            </li>
          ))}
          {!groups.length && !loading && <li style={{ color: "var(--muted)" }}>Nenhum grupo ainda.</li>}
        </ul>

        <div className="footer" style={{ marginTop: 18 }}>
          <Link href="/login" className="link">Trocar usuário</Link>
          <Link href="/" className="link">Home</Link>
        </div>
      </div>
    </main>
  );
}
