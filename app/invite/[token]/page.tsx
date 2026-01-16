"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function accept() {
      const email = localStorage.getItem("acerto_email") || "";

      if (!email) {
        setStatus("error");
        setMessage("Você precisa estar logado para aceitar o convite.");
        return;
      }

      const res = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
        headers: {
          "x-user-email": email,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("ok");
        setMessage(`Você entrou no grupo "${data.groupName}"`);
        setTimeout(() => router.push("/groups"), 1500);
      } else {
        setStatus("error");
        setMessage(data.error || "Erro ao aceitar convite");
      }
    }

    accept();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#071611] text-white flex items-center justify-center px-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 max-w-md w-full text-center">
        {status === "loading" && <p>Aceitando convite...</p>}
        {status === "ok" && <p className="text-emerald-400">{message}</p>}
        {status === "error" && <p className="text-red-400">{message}</p>}
      </div>
    </div>
  );
}
