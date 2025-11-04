"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script"; // << ADICIONADO

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  function doLogin() {
    if (!email) {
      setErr("Digite um e-mail");
      return;
    }
    localStorage.setItem("acerto_email", email);
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
      {/* Desativa qualquer window.alert antes de tudo */}
      <Script id="disable-alert" strategy="beforeInteractive">
        {`window.alert = () => {};`}
      </Script>

      <div
        style={{
          width: 320,
          padding: 24,
          background: "#12352d",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <img src="/logo.svg" alt="AcertÔ" style={{ height: 50 }} />
          <h2 style={{ margin: 0, color: "#e6fff7", fontWeight: 700 }}>
            Entrar no AcertÔ
          </h2>
        </div>

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
          onChange={(e) => {
            setEmail(e.target.value);
            setErr("");
          }}
          placeholder="voce@email.com"
          type="email"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #2b5e50",
            background: "#0b221d",
            color: "#e6fff7",
            marginBottom: 8,
          }}
        />
        {err && (
          <p style={{ margin: "6px 0 12px", color: "#ffb3b3", fontSize: 13 }}>
            {err}
          </p>
        )}

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
          }}
        >
          Entrar
        </button>

        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Link href="/" style={{ color: "#a7d4ff", fontSize: 14 }}>
            Voltar para Home
          </Link>
        </div>
      </div>
    </main>
  );
}
