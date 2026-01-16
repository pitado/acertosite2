"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [msg, setMsg] = useState("Aceitando convite...");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const email = localStorage.getItem("acerto_email") || "";
      if (!email) {
        setErr("Você precisa estar logado para aceitar o convite.");
        setMsg("Faça login e depois abra o link novamente.");
        return;
      }

      try {
        const res = await fetch(`/api/invites/${token}/accept`, {
          method: "POST",
          headers: { "x-user-email": email },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setErr(data?.error || "Não consegui aceitar o convite.");
          setMsg("Convite inválido ou expirado.");
          return;
        }

        setMsg("Convite aceito! Indo para seus grupos...");
        setTimeout(() => router.replace("/groups"), 800);
      } catch {
        setErr("Erro de rede.");
        setMsg("Tente novamente.");
      }
    }

    if (token) run();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#071611] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h1 className="text-lg font-semibold">Convite</h1>
        <p className="mt-2 text-sm text-white/60">{msg}</p>

        {err && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}
      </div>
    </div>
  );
}
