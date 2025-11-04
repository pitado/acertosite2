"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion } from "framer-motion";
import { supabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ① Se já estiver logado no Supabase (via Google), manda pra /groups
  useEffect(() => {
    let unsub = supabaseClient.auth.onAuthStateChange(async (ev, session) => {
      if (ev === "SIGNED_IN" && session?.user?.email) {
        localStorage.setItem("acerto_email", session.user.email);
        router.replace("/groups");
      }
    }).data.subscription;

    // também checa sessão atual (ex.: quando volta do redirect com ?code=...)
    supabaseClient.auth.getSession().then(({ data }) => {
      const mail = data.session?.user?.email;
      if (mail) {
        localStorage.setItem("acerto_email", mail);
        router.replace("/groups");
      }
    });

    return () => unsub?.unsubscribe();
  }, [router]);

  // ② Login “simples” (continua existindo)
  function doLogin() {
    if (!email) {
      setErr("Digite um e-mail");
      return;
    }
    localStorage.setItem("acerto_email", email);
    router.push("/groups");
  }

  // ③ Login com Google (OAuth)
  async function loginWithGoogle() {
    try {
      setLoading(true);
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/login` // pode voltar para /login ou /groups
          : undefined;

      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo, // importante para funcionar em produção e preview
          queryParams: {
            access_type: "offline", // opcional
            prompt: "consent",      // opcional
          },
        },
      });

      if (error) {
        console.error(error);
        setErr("Falha ao iniciar login com Google.");
      }
      // A página será redirecionada pelo Supabase. O onAuthStateChange acima resolve o pós-login.
    } catch (e) {
      console.error(e);
      setErr("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 30% 30%, #0f3b31 0%, #071f1a 70%)",
      }}
    >
      {/* desliga qualquer alert legado */}
      <Script id="disable-alert" strategy="beforeInteractive">
        {`window.alert = () => {};`}
      </Script>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          width: 360,
          padding: 32,
          background: "#12352d",
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              backgroundColor: "#1dd1a1",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(29, 209, 161, 0.4)",
            }}
          >
            <img
              src="/logo.svg?v=2"
              alt="AcertÔ logo"
              style={{
                width: 42,
                height: 42,
                filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))",
              }}
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 22,
            color: "#e6fff7",
            marginBottom: 20,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          Bem-vindo ao AcertÔ
        </motion.h1>

        {/* Botão Google */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={loginWithGoogle}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #2b5e50",
            background: "#0b221d",
            color: "#e6fff7",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            marginBottom: 12,
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            style={{ width: 18, height: 18 }}
          />
          {loading ? "Conectando…" : "Continuar com Google"}
        </motion.button>

        {/* Separador visual */}
        <div style={{ color: "#89a", fontSize: 12, margin: "8px 0 12px" }}>
          — ou use seu e-mail —
        </div>

        {/* Login simples (o seu) */}
        <label
          style={{
            display: "block",
            textAlign: "left",
            marginBottom: 8,
            color: "#a7d4ff",
            fontSize: 14,
          }}
        >
          E-mail
        </label>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErr("");
          }}
          placeholder="voce@email.com"
          type="email"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #2b5e50",
            background: "#0b221d",
            color: "#e6fff7",
            marginBottom: 10,
            outline: "none",
            fontSize: 14,
          }}
        />
        {err && (
          <p style={{ margin: "6px 0 12px", color: "#ffb3b3", fontSize: 13 }}>
            {err}
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={doLogin}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(90deg,#1dd1a1,#17b58b)",
            color: "#062b26",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(29,209,161,0.25)",
          }}
        >
          Entrar
        </motion.button>

        <div style={{ marginTop: 20 }}>
          <Link href="/" style={{ color: "#a7d4ff", fontSize: 14 }}>
            Voltar para Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
