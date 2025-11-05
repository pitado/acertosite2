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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 30% 30%, #0f3b31 0%, #071f1a 70%)",
        color: "#e6fff7",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* BLOCO CENTRAL */}
      <div
        style={{
          width: "min(460px, 90vw)",
          padding: "38px 34px 36px",
          background: "#143A31",
          borderRadius: 20,
          boxShadow: "0 25px 50px rgba(0,0,0,0.48)",
          textAlign: "center",
        }}
      >
        {/* LOGO + TÍTULOS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <img
            src="/logo.svg"
            alt="Logo do AcertÔ"
            style={{
              width: 220,
              height: "auto",
              filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.45))",
            }}
          />

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontFamily:
                "'Arial Black', 'Impact', 'Segoe UI Black', system-ui, sans-serif",
              letterSpacing: 0.3,
              color: "#ffffff",
              textShadow: "0 2px 0 rgba(0,0,0,0.25)",
              transition: "color 0.3s ease, transform 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#1dd1a1";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Bem-vindo ao AcertÔ
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 17,
              fontFamily:
                "'Arial Black', 'Impact', 'Segoe UI Black', system-ui, sans-serif",
              color: "#ffffff",
              letterSpacing: 0.3,
              transition: "color 0.3s ease, transform 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#1dd1a1";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            A dívida vai, a amizade fica
          </p>
        </div>

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

      {/* ASSINATURA “Feito por Pita” */}
      <div
        style={{
          position: "absolute",
          bottom: 6, // mais embaixo
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.5,
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "translateX(-50%) scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.5";
          e.currentTarget.style.transform = "translateX(-50%) scale(1)";
        }}
      >
        <img
          src="/feitoporpita.png"
          alt="Feito por Pita"
          style={{ width: 100, height: "auto" }} // menor
        />
      </div>
    </main>
  );
}
