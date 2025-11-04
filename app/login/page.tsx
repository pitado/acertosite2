"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
          padding: 36,
          background: "#143A31",
          borderRadius: 20,
          boxShadow: "0 25px 55px rgba(0,0,0,0.45)",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              backgroundColor: "#1dd1a1",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 25px rgba(29, 209, 161, 0.35)",
            }}
          >
            <img
              src="/logo.svg"
              alt="AcertÔ"
              style={{
                width: 46,
                height: 46,
                filter: "drop-shadow(0 2px 3px rgba(0,0,0,.25))",
              }}
            />
          </div>
        </div>

        {/* Título */}
        <h1
          style={{
            fontSize: 24,
            color: "#e6fff7",
            marginBottom: 8,
            fontWeight: 800,
            letterSpacing: 0.6,
          }}
        >
          Bem-vindo ao AcertÔ
        </h1>

        {/* Slogan */}
        <p
          style={{
            fontSize: 14,
            color: "#9de5c5",
            marginBottom: 28,
            letterSpacing: 0.3,
          }}
        >
          “A dívida vai, a amizade fica 💚”
        </p>

        {/* Botão Google */}
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
            (e.currentTarget.style.background = "rgba(29,209,161,0.2)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(0,0,0,0.15)")
          }
        >
          <span
            style={{
              display: "inline-flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "center",
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
