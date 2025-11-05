"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function InviteAcceptPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [msg, setMsg] = useState("Validando convite...");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  useEffect(() => {
    (async () => {
      // tenta pegar e-mail do Supabase Auth; se não, cai no localStorage como fallback
      const { data: auth } = await supabase.auth.getUser();
      const email =
        auth?.user?.email ||
        (typeof window !== "undefined" ? localStorage.getItem("acerto_email") : "");

      if (!email) {
        setMsg("Faça login para aceitar o convite...");
        // guarda o retorno pós login
        if (typeof window !== "undefined") {
          sessionStorage.setItem("invite_back_to", `/invite/${params.token}`);
        }
        router.replace("/login");
        return;
      }

      const res = await fetch(`/api/invites/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setMsg(j?.error || "Convite inválido.");
        return;
      }

      setMsg("Convite aceito! Redirecionando...");
      router.replace("/groups");
    })();
  }, [params.token, router, supabase]);

  return (
    <main style={{
      minHeight: "100vh", display: "grid", placeItems: "center",
      background: "radial-gradient(circle at 30% 30%, #0f3b31 0%, #071f1a 70%)",
      color: "#e6fff7"
    }}>
      <div style={{ padding: 24, background: "#12352d", borderRadius: 16 }}>
        {msg}
      </div>
    </main>
  );
}
