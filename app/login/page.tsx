"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

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
        color: "#e6fff7",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(480px, 92vw)", // caixa mais compacta
          padding: "42px 36px 40px",
          background: "#143A31",
          borderRadius: 20,
          boxShadow: "0 25px 50px rgba(0,0,0,0.48)",
          textAlign: "center",
        }}
      >
        {/* LOGO (com menor espaçamento abaixo) */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <img
            src="/logo.svg"
            alt="Logo do AcertÔ"
            style={{
              width: 230,
              height: "auto",
              filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.45))",
            }}
          />
        </div>

        {/* TÍTULO */}
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 28,
            fontFamily:
              "'Arial Black', 'Impact', 'Segoe UI Black', system-ui, sans-serif",
            letterSpacing: 0.2,
            color: "#E7FFF3",
            textShadow: "0 2px 0 rgba(0,0,0,0.25)",
          }}
        >
          Bem-vindo ao AcertÔ
        </h1>

        {/* SLOGAN */}
        <p
          style={{
            margin: "0 0 28px",
            fontSize: 17,
            fontFamily:
              "'Arial Black', 'Impact', 'Segoe UI Black', system-ui, sans-serif",
            color: "#A7F3CA",
            letterSpacing: 0.3,
          }}
        >
          A conta vai, mas a amizade fica
        </p>

        {/* BOTÃO GOOGLE */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.15)",
            color: "#e6fff7",
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            transition: "all 0.18s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(29,209,161,0.22)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(0,0,0,0.15)")
          }
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
