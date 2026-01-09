"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.721 32.657 29.303 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.656 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.35 4.33-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.404-5.197l-6.19-5.238C29.171 35.091 26.715 36 24 36c-5.281 0-9.691-3.321-11.291-7.946l-6.52 5.022C9.49 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.765 2.164-2.222 4.004-4.089 5.565l.003-.002 6.19 5.238C36.97 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Se já tem info de login salva, manda direto pros grupos
  useEffect(() => {
    const email = typeof window !== "undefined" ? localStorage.getItem("acerto_email") : null;
    if (email) router.replace("/groups");
  }, [router]);

  async function handleGoogle() {
    setErr(null);
    setLoading(true);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setErr("Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    // Normalmente ele redireciona sozinho. Se não redirecionar por algum motivo:
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden flex items-center justify-center px-4">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-24 -right-40 h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-200px] left-1/3 h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          {/* Logo maior */}
          <div className="mx-auto mb-5 h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Acertô"
              width={80}
              height={80}
              className="h-16 w-16 object-contain drop-shadow"
              priority
            />
          </div>

          <h1 className="text-center text-2xl font-semibold tracking-tight">
            Bem-vindo ao Acertô
          </h1>
          <p className="mt-1 text-center text-sm text-white/60">
            A dívida vai, a amizade fica.
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon className="h-5 w-5" />
            <span className="font-medium">
              {loading ? "Conectando..." : "Continuar com Google"}
            </span>
          </button>

          <p className="mt-5 text-center text-xs text-white/50 leading-relaxed">
            Entre com sua conta Google para criar grupos, dividir despesas e acompanhar seus acertos.
          </p>

          {err && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
              <div className="mt-2 text-xs text-red-200/80">
                Dica: no Supabase (Auth → URL Configuration), adicione a URL de redirect:
                <br />
                <span className="text-red-100/90">{`https://SEU-DOMINIO/auth/callback`}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
