"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [hoverSlogan, setHoverSlogan] = useState(false);

  useEffect(() => {
    // Se já estiver autenticado, pula pro /groups
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
        color: "#e6fff7",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(560px, 92vw)",
          padding: "44px 40px 38px",
          background: "#143A31",
          borderRadius: 20,
          boxShadow: "0 28px 60px rgba(0,0,0,0.48)",
          textAlign: "center",
        }}
      >
        {/* LOGO */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <img
            src="/logo.svg" // SVG transparente
            alt="Logo do AcertÔ"
            style={{
              width: 140,             // << maior
              height: "auto",
              filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.45))",
            }}
          />
        </div>

        {/* TÍTULO com “peso” de Arial Black */}
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: 34,
            lineHeight: 1.15,
            // stack com fontes “sólidas”
            fontFamily:
              "'Arial Black', 'Arial Black Regular', 'Impact', 'Segoe UI Black', system-ui, -apple-system, Arial, sans-serif",
            letterSpacing: 0.2,
            color: "#E7FFF3",
            textShadow: "0 2px 0 rgba(0,0,0,0.25)",
          }}
        >
          Bem-vindo ao AcertÔ
        </h1>

        {/* SLOGAN com micro-hover */}
        <p
          onMouseEnter={() => setHoverSlogan(true)}
          onMouseLeave={() => setHoverSlogan(false)}
          style={{
            margin: "0 0 28px",
            fontSize: 16,
            color: hoverSlogan ? "#b7f5da" : "#9de5c5",
            letterSpacing: hoverSlogan ? 0.6 : 0.2,
            transition: "all .25s ease",
            textShadow: hoverSlogan ? "0 0 8px rgba(29,209,161,0.45)" : "none",
            fontStyle: "italic",
          }}
        >
          A conta vai, a amizade fica
        </p>

        {/* BOTÃO GOOGLE */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.15)",
            color: "#e6fff7",
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            transition: "all 0.18s ease",
            boxShadow: "inset 0 0 0 rgba(0,0,0,0)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(29,209,161,0.22)";
            e.currentTarget.style.boxShadow = "inset 0 -2px 0 rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.15)";
            e.currentTarget.style.boxShadow = "inset 0 0 0 rgba(0,0,0,0)";
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              width={18}
              height={18}
              style={{ transform: "translateY(-1px)" }}
            />
            Continuar com Google
          </span>
        </button>
      </div>
    </main>
  );
}
