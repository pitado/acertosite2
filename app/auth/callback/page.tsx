"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finalizando login...");

  useEffect(() => {
    async function run() {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setMsg("Supabase não configurado.");
          return;
        }

        // ✅ Depois do redirect do Google, o Supabase já deve ter a sessão
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setMsg("Erro ao pegar sessão: " + error.message);
          return;
        }

        const user = data.session?.user;
        if (!user) {
          setMsg("Sessão não encontrada. Tente logar novamente.");
          return;
        }

        // ✅ UID do Supabase (igual ao UID do dashboard)
        localStorage.setItem("acerto_uid", user.id);

        // ✅ email
        if (user.email) localStorage.setItem("acerto_email", user.email);

        // ✅ nome e avatar (vem do metadata do Google)
        const name =
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          "";

        const avatar =
          (user.user_metadata?.avatar_url as string | undefined) ||
          (user.user_metadata?.picture as string | undefined) ||
          "";

        if (name) localStorage.setItem("acerto_name", name);
        if (avatar) localStorage.setItem("acerto_avatar", avatar);

        // ✅ manda pra tela principal
        router.replace("/groups");
      } catch (e: any) {
        setMsg("Erro inesperado: " + (e?.message || "desconhecido"));
      }
    }

    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#071611] text-white flex items-center justify-center px-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-lg font-semibold">Login</div>
        <div className="mt-2 text-sm text-white/60">{msg}</div>
      </div>
    </div>
  );
}
