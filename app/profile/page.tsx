"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Save, ArrowLeft, UserRound } from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");

  const [googleName, setGoogleName] = useState("");
  const [googleAvatar, setGoogleAvatar] = useState("");

  useEffect(() => {
    setEmail(localStorage.getItem("acerto_email") ?? "");

    // ✅ base do google
    setGoogleName(
      localStorage.getItem("acerto_google_name") ??
        localStorage.getItem("acerto_name") ??
        ""
    );
    setGoogleAvatar(
      localStorage.getItem("acerto_google_avatar") ??
        localStorage.getItem("acerto_avatar") ??
        ""
    );

    // ✅ custom do usuário
    setName(localStorage.getItem("acerto_name_custom") ?? "");
    setAvatar(localStorage.getItem("acerto_avatar_custom") ?? "");
  }, []);

  const effectiveName =
    name.trim() ||
    googleName.trim() ||
    (email ? email.split("@")[0] : "A");

  const effectiveAvatar = avatar.trim() || googleAvatar.trim();

  const initial = useMemo(() => {
    const base = effectiveName || (email ? email.split("@")[0] : "A");
    return (base?.[0] || "A").toUpperCase();
  }, [effectiveName, email]);

  function save() {
    const n = name.trim();
    const a = avatar.trim();

    if (n) localStorage.setItem("acerto_name_custom", n);
    else localStorage.removeItem("acerto_name_custom");

    if (a) localStorage.setItem("acerto_avatar_custom", a);
    else localStorage.removeItem("acerto_avatar_custom");

    alert("Perfil salvo!");
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[520px] w-[520px] rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 relative">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium px-4 py-2 transition"
          >
            <Save className="h-4 w-4" />
            Salvar
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden border border-white/10 bg-white/10 flex items-center justify-center">
              {effectiveAvatar ? (
                <img
                  src={effectiveAvatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold">{initial}</span>
              )}
            </div>

            <div className="leading-tight">
              <h1 className="text-xl font-semibold">Perfil</h1>
              <p className="text-sm text-white/60">
                Personalize seu nome e avatar.
              </p>
              {email && <p className="text-xs text-white/40 mt-1">{email}</p>}
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm text-white/70">Nome (apelido)</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={googleName ? `Ex.: ${googleName}` : "Ex.: Pita"}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
              />
              <div className="text-xs text-white/50">
                Se deixar vazio, usa seu nome do Google.
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-white/70">Avatar (URL da imagem)</span>
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder={googleAvatar ? "Vazio = usar foto do Google" : "https://..."}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
              />
              <div className="text-xs text-white/50 flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                Se deixar vazio, usa a foto do Google (se tiver) ou sua inicial.
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
