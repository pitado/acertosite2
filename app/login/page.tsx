"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  // Se já existir sessão, manda direto pra /groups
  useEffect(() => {
    (async () => {
      const { data } = await supabaseClient.auth.getSession();
      const email = data.session?.user?.email;
      if (email) {
        localStorage.setItem("acerto_email", email);
        router.replace("/groups");
      }
    })();
  }, [router]);

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 30% 30%, #0f3b31 0%, #071f1a 70%)",
      }}
    >
      <div
        style={{
          width: 440,
          padding: 32,
          background: "#143A31",
          borderRadius: 18,
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
          textAlign: "center",
        }}
      >
        {/* logo */}
        <div style={{ marginBottom: 18, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 74,
              height: 74,
              backgroundColor: "#1dd1a1",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 24px rgba(29, 209, 161, 0.35)",
            }}
          >
            <img src="/logo.svg" alt="AcertÔ" style={{ width: 44, height: 44 }} />
          </div>
        </div>

        <h1
          style={{
            fontSize: 24,
            color: "#e6fff7",
            marginBottom: 22,
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
        >
          Bem-vindo ao AcertÔ
        </h1>

        {/* único botão de login */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.15)",
            color: "#e6fff7",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          <span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              width={18}
              height={18}
            />
            Continuar com Google
          </span>
        </button>
      </div>
    </main>
  );
}
