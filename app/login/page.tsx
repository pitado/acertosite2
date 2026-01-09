"use client";

import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const supabase = createClientComponentClient();

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/groups`,
      },
    });
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
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-8 py-10 text-center">
        {/* 🐷 LOGO – maior e sem fundo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.svg"
            alt="Acertô"
            width={110}
            height={110}
            priority
          />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Bem-vindo ao Acertô
        </h1>

        <p className="mt-1 text-sm text-white/60">
          A dívida vai, a amizade fica.
        </p>

        <button
          onClick={loginWithGoogle}
          className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 px-4 py-3 text-sm font-medium transition"
        >
          <Image
            src="/google.svg"
            alt="Google"
            width={18}
            height={18}
          />
          Continuar com Google
        </button>

        <p className="mt-4 text-xs text-white/40 leading-relaxed">
          Entre com sua conta Google para criar grupos, dividir despesas
          e acompanhar seus acertos.
        </p>
      </div>
    </div>
  );
}
