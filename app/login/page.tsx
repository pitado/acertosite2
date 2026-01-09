"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

function pickName(meta: any, email?: string | null) {
  return (
    meta?.full_name ||
    meta?.name ||
    meta?.preferred_username ||
    meta?.user_name ||
    (email ? email.split("@")[0] : "") ||
    ""
  );
}

function pickAvatar(meta: any) {
  return meta?.avatar_url || meta?.picture || meta?.avatar || "";
}

export default function LoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setAuthError("Configuração do Supabase não encontrada.");
        return;
      }

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      const email = user?.email ?? null;
      if (email) {
        localStorage.setItem("acerto_email", email);

        const meta = user?.user_metadata ?? {};
        const name = pickName(meta, email);
        const avatar = pickAvatar(meta);

        // ✅ valores originais do Google (base)
        if (name) localStorage.setItem("acerto_google_name", name);
        if (avatar) localStorage.setItem("acerto_google_avatar", avatar);

        // (compatibilidade com o que você já tinha antes)
        if (name && !localStorage.getItem("acerto_name")) {
          localStorage.setItem("acerto_name", name);
        }
        if (avatar && !localStorage.getItem("acerto_avatar")) {
          localStorage.setItem("acerto_avatar", avatar);
        }

        router.replace("/groups");
      }
    })();
  }, [router]);

  async function signInWithGoogle() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthError("Configuração do Supabase não encontrada.");
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#0f3b31_0%,#071f1a_70%)] text-emerald-50 relative overflow-hidden px-4">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-emerald-800/60 bg-emerald-900/80 p-8 shadow-[0_25px_50px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col items-center gap-3 text-center mb-6">
          <img
            src="/logo.svg"
            alt="Logo do AcertÔ"
            className="w-48 drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
          />
          <h1 className="text-2xl font-extrabold tracking-wide text-white">
            Bem-vindo ao AcertÔ
          </h1>
          <p className="text-sm text-emerald-100/80">
            A dívida vai, a amizade fica.
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full py-3 rounded-xl border border-white/10 bg-black/20 hover:bg-emerald-500/20 transition text-emerald-50 font-semibold"
        >
          <span className="inline-flex items-center justify-center gap-3">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              width={18}
              height={18}
            />
            Continuar com Google
          </span>
        </button>

        {authError && (
          <div className="mt-4 text-xs text-red-200 text-center">
            {authError}
          </div>
        )}

        <div className="mt-6 text-xs text-emerald-100/60 text-center">
          Entre com sua conta Google para criar grupos, dividir despesas e acompanhar
          os acertos.
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-60 hover:opacity-90 transition">
        <img src="/feitoporpita.png" alt="Feito por Pita" className="w-20 h-auto" />
      </div>
    </main>
  );
}
