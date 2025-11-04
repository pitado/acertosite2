"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function doLogin() {
    if (!email) {
      alert("Digite um e-mail");
      return;
    }

    // Guarda o e-mail localmente para o sistema identificar o usuário
    localStorage.setItem("acerto_email", email);

    // Redireciona para /groups depois do login
    router.push("/groups");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        backgroundColor: "#0b1f1b",
      }}
    >
      <div
        style={{
          width: 320,
          padding: 24,
          background: "#12352d",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        {/* Logo + título */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <img src="/logo.svg" alt="AcertÔ" style={{ height: 50 }} />
          <h2 style={{ margin: 0, color: "#e6fff7", fontWeight: 700 }}>Entrar no AcertÔ</h2>
        </div>

        {/* Campo de email */}
        <label
          style={{
            display: "block",
            marginBottom: 8,
            color: "#a7d4ff",
            fontSize: 14,
          }}
        >
          E-mail
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          type="email"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #2b5e50",
            background: "#0b221d",
            color: "#e6fff7",
            marginBottom: 16,
          }}
        />

        {/* Botão */}
        <button
          onClick={doLogin}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(90deg,#1dd1a1,#17b58b)",
            color: "#062b26",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            transition: "all .2s",
          }}
        >
          Entrar
        </button>

        {/* Link inferior */}
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Link href="/" style={{ color: "#a7d4ff", fontSize: 14 }}>
            Voltar para Home
          </Link>
        </div>
      </div>
    </main>
  );
}
