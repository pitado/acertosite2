"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

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
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
        {/* 🐷 Logo (SEM FUNDO, MAIOR) */}
        <div className="flex justify-center mb-6">
          <Image
            src="/pig.svg" // ajuste se o nome do arquivo for outro
            alt="Acertô"
            width={96}
            height={96}
            priority
          />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Bem-vindo ao Acertô
        </h1>

        <p className="mt-2 text-sm text-white/60">
          A dívida vai, a amizade fica.
        </p>

        {/* Botão Google */}
        <button
          onClick={loginWithGoogle}
          className="mt-8 w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 transition px-4 py-3 font-medium"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.6 32.5 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.3 6.1 29.4 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.1 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36 26.7 37 24 37c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.7 39.7 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.2 3.1-3.6 5.6-6.7 7.1l6.2 5.2C37.8 37.5 44 32 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>

          Continuar com Google
        </button>

        <p className="mt-6 text-xs text-white/50">
          Entre com sua conta Google para criar grupos, dividir despesas e
          acompanhar seus acertos.
        </p>
      </div>
    </div>
  );
}
