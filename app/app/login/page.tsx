"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 320, padding: 24, background: "#12352d", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Login</h2>

        <label style={{ display: "block", marginBottom: 8 }}>E-mail</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #2b5e50",
            marginBottom: 16,
          }}
        />

        <button
          onClick={() => alert(`Login de teste para: ${email}`)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "none",
            background: "#1dd1a1",
            color: "#07251f",
            fontWeight: 600,
          }}
        >
          Entrar
        </button>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Link href="/" style={{ color: "#a7d4ff" }}>
            Voltar para Home
          </Link>
        </div>
      </div>
    </main>
  );
}
