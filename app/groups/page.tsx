"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Receipt,
  AlertCircle,
  Settings,
  ChevronRight,
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  BarChart3,
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

  // modais
  const [howOpen, setHowOpen] = useState(false);
  const [howStep, setHowStep] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const groupsRef = useRef<HTMLDivElement | null>(null);

  // 🔹 carrega dados do usuário + grupos (localStorage)
  useEffect(() => {
    setName(localStorage.getItem("acerto_name") || "");
    setAvatar(localStorage.getItem("acerto_avatar") || "");

    const stored = localStorage.getItem("acerto_groups");
    if (stored) {
      try {
        setGroups(JSON.parse(stored));
      } catch {
        setGroups([]);
      }
    }
  }, []);

  const hasGroups = groups.length > 0;

  const firstName = useMemo(() => {
    if (!name) return "Bem-vindo ao Acertô";
    return `Bem-vindo ao Acertô, ${name.split(" ")[0]}!`;
  }, [name]);

  function persist(next: Group[]) {
    setGroups(next);
    localStorage.setItem("acerto_groups", JSON.stringify(next));
  }

  function scrollToGroups() {
    groupsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function createId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `g_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  function openCreate() {
    setNewName("");
    setNewDesc("");
    setCreateOpen(true);
  }

  function submitCreate() {
    const n = newName.trim();
    const d = newDesc.trim();

    if (!n) return;

    const newGroup: Group = {
      id: createId(),
      name: n,
      description: d ? d : undefined,
    };

    persist([...groups, newGroup]);
    setCreateOpen(false);

    // depois que cria, já rola pra seção de grupos (fica “em evidência”)
    setTimeout(() => scrollToGroups(), 120);
  }

  function openHow(startAt = 0) {
    setHowStep(startAt);
    setHowOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#071611] text-white relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-32 -right-40 h-[620px] w-[620px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 h-[620px] w-[620px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 border-b border-white/10 bg-[#071611]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-semibold">
                  {(name?.[0] || "A").toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">Seus grupos</h1>
              <p className="text-sm text-white/60 truncate">
                Crie, gerencie e organize seus grupos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Relatórios (placeholder por enquanto) */}
            <Link
              href="/reports"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
              title="Relatórios"
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </Link>

            <Link
              href="/profile"
              className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
              aria-label="Configurações do perfil"
              title="Perfil"
            >
              <Settings className="h-4 w-4" />
            </Link>

            <button
              onClick={openCreate}
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
        {/* SAUDAÇÃO + CTA */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{firstName}</h2>
            <p className="text-sm text-white/60 mt-1">
              Crie, gerencie e organize suas despesas de forma simples.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => openHow(0)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 transition"
            >
              Como funciona
              <ChevronRight className="h-4 w-4" />
            </button>

            {hasGroups ? (
              <button
                onClick={scrollToGroups}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition"
              >
                Ver meus grupos
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400 transition"
              >
                <Sparkles className="h-4 w-4" />
                Criar primeiro grupo
              </button>
            )}
          </div>
        </section>

        {/* SEM GRUPOS */}
        {!hasGroups && (
          <section className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Não há grupos por aqui</h3>
              <p className="text-sm text-white/60 mt-1">
                Que tal criar um agora e deixar as contas em ordem?
              </p>

              <button
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black font-medium w-fit hover:bg-emerald-400 transition"
              >
                <Plus className="h-4 w-4" />
                Criar primeiro grupo
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Comece em 30 segundos
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <Step icon={<Users />} text="Crie um grupo" />
                <Step icon={<Receipt />} text="Adicione despesas" />
                <Step icon={<AlertCircle />} text="Veja os acertos" />
              </div>

              <button
                onClick={() => openHow(0)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 transition text-sm"
              >
                Ver passo a passo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* COM GRUPOS */}
        {hasGroups && (
          <>
            {/* RESUMOS */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-white/70">Resumo do mês</h3>

              <div className="grid md:grid-cols-4 gap-4">
                <Summary title="Total este mês" value="R$ 0,00" />
                <Summary title="Seus grupos" value={groups.length.toString()} />
                <Summary title="Pendentes" value="0" />
                <Summary title="Não acertados" value="0" />
              </div>
            </section>

            {/* DASHBOARD ORGANIZADO */}
            <section className="grid lg:grid-cols-3 gap-6">
              {/* COLUNA DIREITA (Meus grupos) — deixa em evidência no mobile */}
              <div
                ref={groupsRef}
                className="order-1 lg:order-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Meus grupos</h3>
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-black font-medium hover:bg-emerald-400 transition text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Novo
                  </button>
                </div>

                <p className="mt-1 text-sm text-white/60">
                  Acesse rapidamente seus grupos.
                </p>

                <div className="mt-4 space-y-3 max-h-[520px] overflow-auto pr-1">
                  {groups.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">{g.name}</h4>
                          <p className="text-xs text-white/60 mt-1">
                            1 membro · R$ 0,00
                          </p>
                        </div>

                        <button
                          className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
                          onClick={() =>
                            alert(
                              "Abrir (quando existir a página do grupo /groups/[id])"
                            )
                          }
                        >
                          Abrir
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-sm transition"
                          onClick={() =>
                            alert(
                              "Convidar: por enquanto sem banco. (Depois ligamos com regra certinha)"
                            )
                          }
                        >
                          Convidar
                        </button>
                        <button
                          className="flex-1 rounded-xl bg-emerald-500 text-black py-2 text-sm font-medium hover:bg-emerald-400 transition"
                          onClick={() =>
                            alert("Atualizar: (quando tiver banco/serviço)")
                          }
                        >
                          Atualizar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-xs text-white/40">
                  Dica: quando ligar o banco, dá pra mostrar “pendentes”, “última
                  atividade” e “saldo do grupo” aqui.
                </div>
              </div>

              {/* COLUNA ESQUERDA */}
              <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
                {/* Atividades recentes */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Atividades recentes</h3>
                    <button className="text-white/60 hover:text-white transition text-sm">
                      ⋯
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-white/70" />
                    </div>
                    <p className="mt-3 text-sm text-white/60">
                      Aqui aparecerão as últimas despesas, acertos e movimentações.
                    </p>
                    <p className="mt-2 text-xs text-white/40">
                      • Nenhuma atividade recente
                    </p>
                  </div>
                </div>

                {/* Como funciona (agora vira CTA pro wizard) */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">
                      Como funciona o Acertô?
                    </h3>

                    <button
                      onClick={() => openHow(0)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm"
                    >
                      Ver passo a passo
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid sm:grid-cols-3 gap-3">
                    <QuickAction
                      icon={<Users className="h-5 w-5" />}
                      title="Crie um grupo"
                      subtitle="Defina os participantes"
                      onClick={() => openHow(0)}
                    />
                    <QuickAction
                      icon={<Receipt className="h-5 w-5" />}
                      title="Adicionar despesas"
                      subtitle="Lance gastos e categorize"
                      onClick={() => openHow(1)}
                    />
                    <QuickAction
                      icon={<BarChart3 className="h-5 w-5" />}
                      title="Ver relatórios"
                      subtitle="Quem deve e quem recebe"
                      onClick={() => openHow(2)}
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* MODAL: Criar grupo */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo grupo">
        <div className="space-y-4">
          <label className="grid gap-2">
            <span className="text-sm text-white/70">Nome do grupo</span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex.: Viagem, AP 302, Churrasco..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
              autoFocus
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-white/70">Descrição (opcional)</span>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Ex.: contas do mês / divisão entre amigos..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
            />
          </label>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={submitCreate}
              disabled={!newName.trim()}
              className="flex-1 rounded-xl bg-emerald-500 text-black py-2.5 text-sm font-medium hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Como funciona (wizard) */}
      <Modal
        open={howOpen}
        onClose={() => setHowOpen(false)}
        title="Como funciona o Acertô?"
      >
        <HowWizard
          step={howStep}
          setStep={setHowStep}
          onClose={() => setHowOpen(false)}
          onCreateGroup={() => {
            setHowOpen(false);
            openCreate();
          }}
        />
      </Modal>
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

function Step({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center gap-2 text-center">
      <div className="text-emerald-400">{icon}</div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
    >
      <div className="text-emerald-300">{icon}</div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="mt-1 text-xs text-white/60">{subtitle}</div>
    </button>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Fechar modal"
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#071611]/90 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
          <div className="font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function HowWizard({
  step,
  setStep,
  onClose,
  onCreateGroup,
}: {
  step: number;
  setStep: (n: number) => void;
  onClose: () => void;
  onCreateGroup: () => void;
}) {
  const steps = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "1) Crie um grupo",
      text: "Dê um nome (ex.: Viagem) e convide a galera. Depois a gente liga o banco e o convite vira “de verdade”.",
      cta: { label: "Criar grupo agora", action: onCreateGroup },
    },
    {
      icon: <Receipt className="h-5 w-5" />,
      title: "2) Adicione despesas",
      text: "Você lança gastos e escolhe quem participa. O Acertô calcula automaticamente quanto cada pessoa deve.",
      cta: { label: "Entendi", action: () => setStep(2) },
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "3) Veja relatórios",
      text: "Aqui você acompanha quem deve, quem recebe, e o saldo por grupo. (A aba já existe, a gente liga os dados depois.)",
      cta: { label: "Fechar", action: onClose },
    },
  ];

  const current = steps[Math.max(0, Math.min(step, steps.length - 1))];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-emerald-300">
          {current.icon}
        </div>
        <div>
          <div className="font-semibold">{current.title}</div>
          <p className="text-sm text-white/60 mt-1">{current.text}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="text-xs text-white/50">
          {step + 1} / {steps.length}
        </div>

        <button
          onClick={current.cta.action}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-black px-3 py-2 transition text-sm font-medium hover:bg-emerald-400"
        >
          {current.cta.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
