"use client";

// evita cache/prerender nesse callback
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Supabase (PKCE) → troca o ?code= pela sessão
      // (se vier como #access_token também funciona, o SDK resolve)
      try {
        await supabaseClient.auth.exchangeCodeForSession(window.location.href);
      } catch {
        // ignore: em alguns casos a sessão já foi criada
      }

      const { data } = await supabaseClient.auth.getSession();
      const email = data.session?.user?.email;
      if (email) {
        localStorage.setItem("acerto_email", email);
      }

      // manda para a tela de grupos
      router.replace("/groups");
    })();
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(circle at 30% 30%, #0f3b31 0%, #071f1a 70%)",
        color: "#e6fff7",
        fontSize: 16,
      }}
    >
      Processando login…
    </main>
  );
}
