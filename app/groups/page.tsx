"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Receipt,
  AlertCircle,
  Settings,
} from "lucide-react";

type Group = {
  id: string;
  name: string;
  description?: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  // 🔹 carrega dados do usuário + grupos (localStorage)
  useEffect(() => {
    setName(localStorage.getItem("acerto_name") || "");
    setAvatar(localStorage.getItem("acerto_avatar") || "");

    const stored = localStorage.getItem("acerto_groups");
    if (stored) setGroups(JSON.parse(stored));
  }, []);

  const hasGroups = groups.length > 0;

  const firstName = useMemo(() => {
    if (!name) return "Bem-vindo ao Acertô";
    return `Bem-vindo ao Acertô, ${name.split(" ")[0]}!`;
  }, [name]);

  function createGroup() {
    const groupName = prompt("Nome do grupo:");
    if (!groupName) return;

    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: groupName,
    };

    const updated = [...groups, newGroup];
    setGroups(updated);
    localStorage.setItem("acerto_groups", JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 border-b border-white/10 bg-[#071611]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="font-semibold">
                  {(name?.[0] || "A").toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-lg font-semibold">Seus grupos</h1>
              <p className="text-sm text-white/60">
                Crie, busque e gerencie seus grupos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
            >
              <Settings className="h-4 w-4" />
            </Link>

            <button
              onClick={createGroup}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition"
            >
              <Plus className="h-4 w-4" />
              Novo grupo
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* SAUDAÇÃO */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="text-xl font-semibold">{firstName}</h2>
          <p className="text-sm text-white/60 mt-1">
            Crie, gerencie e organize suas despesas de forma simples.
          </p>
        </section>

        {/* SEM GRUPOS */}
        {!hasGroups && (
          <section className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col justify-center">
              <h3 className="text-lg font-semibold">
                Não há grupos por aqui
              </h3>
              <p className="text-sm text-white/60 mt-1">
                Que tal criar um agora e deixar as contas em ordem?
              </p>

              <button
                onClick={createGroup}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium w-fit"
              >
                Criar primeiro grupo
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Como funciona o Acertô?
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <Step icon={<Users />} text="Crie um grupo" />
                <Step icon={<Receipt />} text="Adicione despesas" />
                <Step icon={<AlertCircle />} text="Veja os acertos" />
              </div>
            </div>
          </section>
        )}

        {/* COM GRUPOS */}
        {hasGroups && (
          <>
            {/* RESUMOS */}
            <section className="grid md:grid-cols-4 gap-4">
              <Summary title="Total este mês" value="R$ 0,00" />
              <Summary title="Seus grupos" value={groups.length.toString()} />
              <Summary title="Pendentes" value="0" />
              <Summary title="Não acertados" value="0" />
            </section>

            {/* LISTA DE GRUPOS */}
            <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
                >
                  <h3 className="font-semibold">{g.name}</h3>
                  <p className="text-sm text-white/60 mt-1">
                    1 membro · R$ 0,00
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-sm">
                      Convidar
                    </button>
                    <button className="flex-1 rounded-xl bg-emerald-500 text-black py-2 text-sm font-medium">
                      Abrir
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Summary({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <p className="text-sm text-white/60">{title}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function Step({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center gap-2 text-center">
      <div className="text-emerald-400">{icon}</div>
      <span className="text-sm">{text}</span>
    </div>
  );
}
