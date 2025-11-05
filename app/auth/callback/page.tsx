"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Troca o ?code= pela sessão (PKCE)
        await supabaseClient.auth.exchangeCodeForSession(window.location.href);
      } catch {
        // Se já tiver sessão, segue o fluxo
      }

      const { data } = await supabaseClient.auth.getSession();
      const email = data.session?.user?.email;
      if (email) {
        localStorage.setItem("acerto_email", email);
      }

      router.replace("/groups");
    })();
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 30% 30%, #0f3b31 0%, #071f1a 70%)",
        color: "#e6fff7",
        fontSize: 16,
      }}
    >
      Processando login…
    </main>
  );
}
