"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Save, ArrowLeft, UserRound, Upload, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // ✅ vamos guardar como base64 (dataURL) no localStorage
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");

  // ✅ opcional: foto do Google salva no login, se você já tiver
  const [googleAvatar, setGoogleAvatar] = useState<string>("");

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const e = localStorage.getItem("acerto_email") ?? "";
    const n = localStorage.getItem("acerto_name") ?? "";

    // avatar custom do usuário (upload)
    const a = localStorage.getItem("acerto_avatar") ?? "";

    // foto do Google (se você tiver salvo no login)
    const g = localStorage.getItem("acerto_google_avatar") ?? "";

    setEmail(e);
    setName(n);
    setAvatarDataUrl(a);
    setGoogleAvatar(g);
  }, []);

  const initial = useMemo(() => {
    const base = name || (email ? email.split("@")[0] : "A");
    return (base?.[0] || "A").toUpperCase();
  }, [name, email]);

  // ✅ decide qual avatar mostrar:
  // 1) upload custom (acerto_avatar)
  // 2) google avatar (acerto_google_avatar)
  // 3) inicial
  const avatarToShow = avatarDataUrl || googleAvatar;

  function save() {
    if (name.trim()) localStorage.setItem("acerto_name", name.trim());
    else localStorage.removeItem("acerto_name");

    if (avatarDataUrl) localStorage.setItem("acerto_avatar", avatarDataUrl);
    else localStorage.removeItem("acerto_avatar");

    alert("Perfil salvo!");
  }

  function removeAvatar() {
    setAvatarDataUrl("");
    localStorage.removeItem("acerto_avatar");
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Envie um arquivo de imagem (PNG, JPG, etc).");
      return;
    }

    // ✅ limite simples (ajuda a não explodir o localStorage)
    // se precisar, podemos comprimir depois
    const MAX_MB = 2.5;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Imagem muito grande. Tente uma com menos de ${MAX_MB}MB.`);
      return;
    }

    const dataUrl = await readAsDataURL(file);
    setAvatarDataUrl(dataUrl);
  }

  function onPickClick() {
    fileInputRef.current?.click();
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
              {avatarToShow ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarToShow}
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
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm text-white/70">Nome (apelido)</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Pita"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
              />
              <p className="text-xs text-white/50">
                Se deixar vazio, usa o nome do Google (se tiver) ou seu email.
              </p>
            </label>

            {/* ✅ Upload avatar */}
            <div className="grid gap-2">
              <span className="text-sm text-white/70">Avatar</span>

              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);

                  const file = e.dataTransfer.files?.[0];
                  if (file) await handleFile(file);
                }}
                className={[
                  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4",
                  "flex flex-col gap-3",
                  dragOver ? "ring-2 ring-emerald-400/30 border-emerald-400/30" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">
                      Arraste uma imagem aqui ou clique para enviar
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onPickClick}
                      className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm transition"
                    >
                      Escolher arquivo
                    </button>

                    {avatarDataUrl && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm transition inline-flex items-center gap-2"
                        title="Remover avatar enviado"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleFile(file);
                    // limpa o input pra permitir selecionar o mesmo arquivo de novo
                    e.currentTarget.value = "";
                  }}
                />

                <div className="text-xs text-white/50 flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Se não enviar nada, usa a foto do Google (se tiver) ou sua inicial.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* dica: mostrar limite */}
        <p className="mt-4 text-xs text-white/40">
          Dica: use uma imagem pequena (ex.: 256x256) pra não pesar no armazenamento.
        </p>
      </div>
    </div>
  );
}

function readAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}
