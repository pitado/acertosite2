"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
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

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        router.replace("/login");
        return;
      }

      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch {
        // se já tiver sessão, segue
      }

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      const email = user?.email ?? null;
      if (email) {
        localStorage.setItem("acerto_email", email);

        const meta = user?.user_metadata ?? {};
        const name = pickName(meta, email);
        const avatar = pickAvatar(meta);

        if (name) localStorage.setItem("acerto_name", name);
        if (avatar) localStorage.setItem("acerto_avatar", avatar);
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
        background: "radial-gradient(circle at 30% 30%, #0f3b31 0%, #071f1a 70%)",
        color: "#e6fff7",
        fontSize: 16,
      }}
    >
      Processando login…
    </main>
  );
}
