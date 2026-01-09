"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

export default function LoginPage() {
  const supabase = createClientComponentClient();

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/groups`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071611] relative overflow-hidden text-white">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[520px] w-[520px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[520px] w-[520px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-8 py-10 text-center">
        {/* Logo maior */}
        <div className="mx-auto mb-6 h-20 w-20 flex items-center justify-center rounded-2xl bg-emerald-500/10">
          <Image
            src="/logo.svg"
            alt="Acertô"
            width={56}
            height={56}
            priority
          />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Bem-vindo ao Acertô
        </h1>
        <p className="mt-1 text-sm text-white/60">
          A dívida vai, a amizade fica.
        </p>

        {/* Botão Google REAL */}
        <button
          onClick={handleGoogleLogin}
          className="mt-8 w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 transition px-4 py-3 font-medium"
        >
          <Image
            src="/google.svg"
            alt="Google"
            width={18}
            height={18}
          />
          Continuar com Google
        </button>

        <p className="mt-4 text-xs text-white/40">
          Entre com sua conta Google para criar grupos, dividir despesas e
          acompanhar seus acertos.
        </p>
      </div>
    </div>
  );
}
