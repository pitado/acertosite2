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
      }}
    >
      <div
        style={{
          width: 440,
          padding: 40,
          background: "#143A31",
          borderRadius: 20,
          boxShadow: "0 25px 55px rgba(0,0,0,0.45)",
          textAlign: "center",
        }}
      >
        {/* LOGO CENTRALIZADA */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <img
            src="/logo.svg" // sua nova logo transparente
            alt="Logo AcertÔ"
            style={{
              width: 120, // aumenta o tamanho
              height: "auto",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))", // brilho suave
            }}
          />
        </div>

        {/* TÍTULO */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#e6fff7",
            marginBottom: 8,
          }}
        >
          Bem-vindo ao AcertÔ
        </h1>

        {/* SLOGAN */}
        <p
          style={{
            fontSize: 15,
            color: "#9de5c5",
            marginBottom: 28,
            fontStyle: "italic",
            letterSpacing: 0.3,
          }}
        >
          “A conta vai, a amizade fica”
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
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(29,209,161,0.25)")
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
              alt="Google"
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
