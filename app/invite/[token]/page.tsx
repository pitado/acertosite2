"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Services } from "@/app/groups/services";

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("acerto_email");
    if (stored) setEmail(stored);
  }, []);

  async function handleAccept() {
    if (!email.trim()) return;
    setStatus("loading");
    setError(null);
    try {
      await Services.acceptInvite(params.token, email.trim().toLowerCase());
      setStatus("done");
      setTimeout(() => router.push("/groups"), 1000);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Falha ao aceitar convite");
    }
  }

  return (
    <main className="min-h-screen bg-[#0f2a24] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-800/60 bg-emerald-900/60 p-6 text-center">
        <h1 className="text-2xl font-bold text-emerald-50">Aceitar convite</h1>
        <p className="text-emerald-100/80 mt-2">
          Informe seu e-mail para entrar no grupo.
        </p>
        <input
          className="mt-4 w-full rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
          placeholder="email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <div className="mt-3 text-sm text-red-200">{error}</div>}
        <button
          onClick={handleAccept}
          disabled={status === "loading"}
          className="mt-4 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold py-2"
        >
          {status === "loading" ? "Processando..." : "Entrar no grupo"}
        </button>
        {status === "done" && (
          <div className="mt-3 text-sm text-emerald-100/80">
            Convite aceito! Redirecionando...
          </div>
        )}
        <button
          onClick={() => router.push("/login")}
          className="mt-3 text-xs text-emerald-100/70 underline"
        >
          Fazer login com Google
        </button>
      </div>
    </main>
  );
}
