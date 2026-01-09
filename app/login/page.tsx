"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (loading) return;
    setLoading(true);

    // 🔧 aqui você mantém sua lógica real de login com Google
    // isso é só um delay visual pra UX ficar bonita
    setTimeout(() => {
      // exemplo:
      // window.location.href = "/groups";
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[520px] w-[520px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[520px] w-[520px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 animate-in fade-in zoom-in duration-500">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.svg"
            alt="Acertô"
            className="h-20 w-20"
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Bem-vindo ao Acertô
        </h1>

        <p className="mt-2 text-center text-sm text-white/60">
          A dívida vai, a amizade fica.
        </p>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 transition px-4 py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Conectando…
            </>
          ) : (
            <>
              <img
                src="/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Continuar com Google
            </>
          )}
        </button>

       

        {/* Helper */}
        <p className="mt-6 text-center text-xs text-white/40 leading-relaxed">
          Entre com sua conta Google para criar grupos, dividir despesas
          e acompanhar seus acertos.
        </p>
      </div>
    </div>
  );
}
