"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.721 32.657 29.303 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.656 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.35 4.33-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.404-5.197l-6.19-5.238C29.171 35.091 26.715 36 24 36c-5.281 0-9.691-3.321-11.291-7.946l-6.52 5.022C9.49 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.765 2.164-2.222 4.004-4.089 5.565l6.19 5.238C36.97 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("acerto_email") : null;
    if (saved) router.replace("/groups");
  }, [router]);

  async function handleGoogle() {
    setErr(null);
    setLoadingGoogle(true);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setErr(
        "Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoadingGoogle(false);
      return;
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setErr(error.message);
      setLoadingGoogle(false);
      return;
    }

    setLoadingGoogle(false);
  }

  async function submitEmailPassword() {
    setErr(null);
    setLoadingEmail(true);

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";

      const payload: any = {
        email: email.trim(),
        password,
      };
      if (mode === "register") payload.name = name.trim();

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Erro ao autenticar.");
        setLoadingEmail(false);
        return;
      }

      const user = data?.user;
      if (!user?.email) {
        setErr("Resposta inválida do servidor.");
        setLoadingEmail(false);
        return;
      }

      // mantém o padrão do app (igual o callback do Google)
      localStorage.setItem("acerto_email", user.email);
      localStorage.setItem("acerto_uid", user.id || "");
      localStorage.setItem("acerto_name", user.name || user.email.split("@")[0] || "");
      // sem avatar no cadastro normal:
      localStorage.setItem("acerto_avatar", user.avatarUrl || "");

      router.replace("/groups");
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado.");
    } finally {
      setLoadingEmail(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden flex items-center justify-center px-4">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-24 -right-40 h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-200px] left-1/3 h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
          <img src="/logo.svg" alt="Acertô" className="h-44 w-44 mx-auto mb-4" />

          <h1 className="text-center text-2xl font-semibold tracking-tight">
            Bem-vindo ao Acertô
          </h1>

          <p className="mt-1 text-center text-sm text-white/60">
            A dívida vai, a amizade fica.
          </p>

          {/* GOOGLE (mantém igual) */}
          <button
            onClick={handleGoogle}
            disabled={loadingGoogle}
            className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 transition disabled:opacity-60"
          >
            <GoogleIcon className="h-5 w-5" />
            <span className="font-medium">
              {loadingGoogle ? "Conectando..." : "Continuar com Google"}
            </span>
          </button>

          <p className="mt-5 text-center text-xs text-white/50">
            Entre com sua conta Google para criar grupos, dividir despesas e acompanhar seus acertos.
          </p>

          {/* DIVISOR */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] text-white/40">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* TABS */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("login")}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                mode === "login"
                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-white/70"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                mode === "register"
                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-white/70"
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* FORM */}
          <div className="mt-4 space-y-3">
            {mode === "register" && (
              <div>
                <label className="text-xs text-white/60">Nome</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-emerald-400/30"
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-white/60">E-mail</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-emerald-400/30"
                placeholder="voce@exemplo.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Senha</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-emerald-400/30"
                placeholder="••••••••"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
              <p className="mt-1 text-[11px] text-white/40">
                Mínimo 6 caracteres.
              </p>
            </div>

            <button
              onClick={submitEmailPassword}
              disabled={loadingEmail}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-black font-semibold hover:bg-emerald-400 transition disabled:opacity-60"
            >
              {loadingEmail
                ? "Aguarde..."
                : mode === "register"
                ? "Criar conta"
                : "Entrar"}
            </button>
          </div>

          {err && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
