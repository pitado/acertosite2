"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Pencil, Trash2, Search, Info, Link as LinkIcon, Wallet, MapPin, Paperclip, ChevronDown, Check, Loader2, X } from "lucide-react";

/** Tipos */
type SplitMode = "equal_all" | "equal_selected";
type Group = {
  id: string;
  name: string;
  description?: string;
  owner_email: string;
  role_date?: string | null;
  created_at: string;
  updated_at: string;
};
type Invite = { token: string; created_at?: string; expires_at?: string | null };
type Expense = {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  buyer: string;
  payer: string;
  split: SplitMode;
  participants?: string[] | null;
  category?: string | null;
  subcategory?: string | null;
  pix_key?: string | null;
  location?: string | null;
  date_iso: string;
  proof_url?: string | null;
  paid: boolean;
  created_at: string;
};
type LogEntry = { id: string; group_id: string; message: string; created_at: string };

const emailRegex = /[^@]+@[^.]+\..+/;
const uid = () => Math.random().toString(36).slice(2);
const formatBRL = (n: number) => `R$ ${Number(n).toFixed(2)}`;

/** mapeamento categorias */
const CATEGORY_MAP: Record<string, string[]> = {
  Transporte: ["Gasolina", "Pedágio", "Estacionamento", "Uber/Taxi", "Ônibus/Metrô"],
  Alimentação: ["Comida", "Bebida", "Mercado"],
  Estadia: ["Acomodação", "Taxas"],
  Ingressos: ["Show/Evento", "Passeio", "Museu"],
  Diversos: ["Outros"],
};
const CATEGORY_LIST = Object.keys(CATEGORY_MAP);

/** Services – via API */
const Services = {
  async listGroups(ownerEmail: string, q = "") {
    const r = await fetch(`/api/groups?ownerEmail=${encodeURIComponent(ownerEmail)}&q=${encodeURIComponent(q)}`);
    return r.ok ? (await r.json()) as Group[] : [];
  },
  async createGroup(ownerEmail: string, payload: { name: string; description?: string; roleDateISO?: string; emails: string[] }) {
    const r = await fetch("/api/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ownerEmail, ...payload }) });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao criar"); 
    return (await r.json()) as { id: string };
  },
  async updateGroup(id: string, payload: { name?: string; description?: string; roleDateISO?: string; emails?: string[] }) {
    const r = await fetch(`/api/groups/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao atualizar");
  },
  async deleteGroup(id: string) {
    const r = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao excluir");
  },
  async listInvites(groupId: string) {
    const r = await fetch(`/api/groups/${groupId}/invites`);
    return r.ok ? (await r.json()) as Invite[] : [];
  },
  async createInvite(groupId: string) {
    const r = await fetch(`/api/groups/${groupId}/invites`, { method: "POST" });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao convidar");
    return (await r.json()) as { token: string };
  },
  async listExpenses(groupId: string) {
    const r = await fetch(`/api/groups/${groupId}/expenses`);
    return r.ok ? (await r.json()) as Expense[] : [];
  },
  async createExpense(groupId: string, data: Omit<Expense, "id" | "group_id" | "created_at">) {
    const r = await fetch(`/api/groups/${groupId}/expenses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao salvar despesa");
    return (await r.json()) as Expense;
  },
  async removeExpense(id: string) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  },
  async markPaid(id: string, by: string) {
    await fetch(`/api/expenses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paid: true, by }) });
  },
  async attachProof(id: string, dataUrl: string, by: string) {
    await fetch(`/api/expenses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ proofUrl: dataUrl, paid: true, by }) });
  },
};

/** Página */
export default function GroupsPage() {
  const ownerEmail = typeof window !== "undefined" ? (localStorage.getItem("acerto_email") || "").toLowerCase() : "";
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal grupo
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await Services.listGroups(ownerEmail, "");
        setItems(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerEmail]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return s ? items.filter(g => g.name.toLowerCase().includes(s)) : items;
  }, [items, search]);

  async function handleSave(p: { name: string; description?: string; emails: string[]; roleDateISO?: string }) {
    setError(null);
    try {
      if (editing) {
        await Services.updateGroup(editing.id, { ...p });
        const re = await Services.listGroups(ownerEmail);
        setItems(re);
      } else {
        await Services.createGroup(ownerEmail, p);
        const re = await Services.listGroups(ownerEmail);
        setItems(re);
      }
      setOpen(false); setEditing(null);
    } catch (e: any) { setError(e.message || "Erro ao salvar"); }
  }

  async function handleDelete(id: string) {
    try {
      await Services.deleteGroup(id);
      setItems(prev => prev.filter(g => g.id !== id));
      setConfirm(null);
    } catch (e: any) { setError(e.message || "Erro ao excluir"); }
  }

  return (
    <div className="min-h-screen bg-[#0f2a24] text-white p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="text-emerald-300">AcertÔ</span> <span className="text-emerald-100/80">— Grupos</span>
          </h1>
          <p className="text-sm text-emerald-200/80 mt-1">Crie, convide, registre despesas e acompanhe o rolê.</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Criar grupo
        </button>
      </header>

      <section className="max-w-6xl mx-auto mt-6">
        <div className="flex items-center gap-2 bg-emerald-900/50 border border-emerald-800/60 rounded-xl p-2">
          <Search className="h-5 w-5 text-emerald-200/80 ml-2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar grupos…" className="bg-transparent outline-none w-full text-emerald-50 placeholder:text-emerald-200/60"/>
        </div>
      </section>

      <main className="max-w-6xl mx-auto mt-6">
        {error && <div className="mb-4 rounded-lg border border-red-800/60 bg-red-900/40 p-3 text-sm text-red-100 flex items-center gap-2"><Info className="h-4 w-4" />{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-emerald-100/80"><Loader2 className="h-6 w-6 mr-2 animate-spin" /> Carregando…</div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={() => { setEditing(null); setOpen(true); }} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => (
              <GroupCard key={g.id} g={g} ownerEmail={ownerEmail} onEdit={() => { setEditing(g); setOpen(true); }} onDelete={() => setConfirm({ id: g.id, name: g.name })}/>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {open && (
          <GroupModal
            key={editing?.id || "create"}
            open={open}
            onClose={() => { setOpen(false); setEditing(null); }}
            initial={editing}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm && (
          <ConfirmDeleteModal
            name={confirm.name}
            onCancel={() => setConfirm(null)}
            onConfirm={() => handleDelete(confirm.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Componentes auxiliares (Empty, Modais, Cartões etc.) — idênticos à UX do arquivo antigo,
 *  mas chamando Services acima quando for gerar convite / salvar despesa / etc.
 *  Para encurtar, aqui vai a parte de cartão + despesa.
 */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20 text-emerald-100/80">
      <Users className="h-12 w-12 mx-auto mb-3 opacity-80" />
      <p className="text-lg">Você ainda não tem grupos.</p>
      <p className="text-sm mt-1">Crie um grupo e convide amigos para dividir despesas.</p>
      <button onClick={onCreate} className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl px-4 py-2 inline-flex items-center gap-2">
        <Plus className="h-4 w-4" /> Criar grupo
      </button>
    </div>
  );
}

function GroupCard({ g, ownerEmail, onEdit, onDelete }:{
  g: Group; ownerEmail: string; onEdit: () => void; onDelete: () => void;
}) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [exps, setExps] = useState<Expense[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expOpen, setExpOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setInvites(await Services.listInvites(g.id));
      setExps(await Services.listExpenses(g.id));
      // logs: para simplificar, mostro as 6 últimas via expenses/convites/atualizações (poderia expor /logs)
      // Se quiser, crio /api/groups/[id]/logs e carrego aqui.
    })();
  }, [g.id]);

  async function newInvite() {
    const inv = await Services.createInvite(g.id);
    const url = `${location.origin}/invite/${inv.token}`;
    try { await navigator.clipboard.writeText(url); alert("Link de convite copiado!\n" + url); }
    catch { prompt("Copie o link de convite:", url); }
    setInvites(prev => [{ token: inv.token }, ...prev]);
  }

  async function handleExpenseCreate(data: Omit<Expense,"id"|"group_id"|"created_at">) {
    await Services.createExpense(g.id, data);
    setExps(await Services.listExpenses(g.id));
    setExpOpen(false);
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-emerald-800/60 bg-emerald-900/50 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-emerald-100/70 mb-2">
          <span>Admin: <span className="font-semibold">{g.owner_email}</span></span>
          {g.role_date && <CountdownBadge dateISO={g.role_date} />}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-emerald-50">{g.name}</h3>
            {g.description && <p className="text-sm text-emerald-100/80 mt-0.5">{g.description}</p>}
          </div>
          <div className="flex gap-1">
            <button className="hover:bg-emerald-800/40 rounded-lg px-2 py-1" onClick={newInvite} title="Gerar link de convite"><LinkIcon className="h-4 w-4"/></button>
            <button className="hover:bg-emerald-800/40 rounded-lg px-2 py-1" onClick={() => setExpOpen(true)} title="Adicionar despesa"><Wallet className="h-4 w-4"/></button>
            <button className="hover:bg-emerald-800/40 rounded-lg px-2 py-1" onClick={onEdit} title="Editar grupo"><Pencil className="h-4 w-4"/></button>
            <button className="hover:bg-red-900/30 rounded-lg px-2 py-1" onClick={onDelete} title="Excluir grupo"><Trash2 className="h-4 w-4"/></button>
          </div>
        </div>

        {exps.length > 0 && (
          <div className="mt-4 border-t border-emerald-800/60 pt-3">
            <p className="text-sm font-semibold text-emerald-50 mb-2">Últimas despesas</p>
            <ul className="space-y-2">
              {exps.slice(0,3).map(e => <ExpenseRow key={e.id} e={e} refresh={async()=>{
                setExps(await Services.listExpenses(g.id));
              }} />)}
            </ul>
          </div>
        )}

        {invites.length > 0 && (
          <div className="mt-3 text-xs text-emerald-100/70">
            <p className="font-semibold mb-1">Convites</p>
            {invites.slice(0,2).map(i => (
              <div key={i.token} className="truncate">{location.origin}/invite/{i.token}</div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {expOpen && (
            <ExpenseModal
              open={true}
              onClose={() => setExpOpen(false)}
              members={[ownerEmail]}  /* para simplificar, use os e-mails dos membros quando expuser /members */
              onSave={handleExpenseCreate}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ExpenseRow({ e, refresh }: { e: Expense; refresh: ()=>Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="text-sm">
      <div className="flex items-center gap-2">
        <div className="font-medium text-emerald-50">
          {e.title} • {formatBRL(Number(e.amount))}
          {e.paid ? <span className="ml-2 text-xs bg-emerald-700/60 px-2 py-0.5 rounded">Pago</span> : <span className="ml-2 text-xs text-amber-300">Pendente</span>}
        </div>
        <span className="text-emerald-100/70 text-xs">• {new Date(e.date_iso).toLocaleDateString()}</span>
        <button className="ml-auto inline-flex items-center gap-1 text-emerald-200/80 hover:text-emerald-100 text-[11px]" onClick={()=>setOpen(v=>!v)}>
          Ver detalhes <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open?'rotate-180':'rotate-0'}`} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
            <div className="text-emerald-100/75 mt-2">
              {e.location && <div className="mt-1">Local: {e.location}</div>}
              {e.proof_url && <div className="mt-2"><a href={e.proof_url} target="_blank" className="text-xs underline inline-flex items-center gap-1"><Paperclip className="h-3 w-3"/>Ver comprovante</a></div>}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button className="text-emerald-200/70 hover:text-red-300 text-xs" onClick={async()=>{ await Services.removeExpense(e.id); await refresh(); }}>Excluir</button>
              {!e.paid && (
                <>
                  <button className="text-emerald-200/70 hover:text-emerald-100 text-xs" onClick={async()=>{ await Services.markPaid(e.id,"owner"); await refresh(); }}>Marcar como pago</button>
                  <label htmlFor={`proof-${e.id}`} className="text-emerald-200/70 hover:text-emerald-100 text-xs cursor-pointer inline-flex items-center gap-1"><Paperclip className="h-3 w-3"/>Adicionar comprovante</label>
                  <input id={`proof-${e.id}`} type="file" accept="image/*,application/pdf" className="hidden" onChange={async(ev)=>{ const f=ev.target.files?.[0]; if(!f) return; const fr=new FileReader(); fr.onload=async()=>{ await Services.attachProof(e.id, String(fr.result),"owner"); await refresh(); }; fr.readAsDataURL(f); }}/>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function ExpenseModal({ open, onClose, members, onSave }:{
  open: boolean; onClose: ()=>void; members: string[]; onSave:(e: Omit<Expense,"id"|"group_id"|"created_at">)=>void;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("0");
  const [buyer, setBuyer] = useState(members[0] || "");
  const [payer, setPayer] = useState(members[0] || "");
  const [pixKey, setPixKey] = useState("");
  const [location, setLocation] = useState("");
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0,10));
  const [category, setCategory] = useState(CATEGORY_LIST[0]);
  const [subcategory, setSubcategory] = useState(CATEGORY_MAP[CATEGORY_LIST[0]][0]);
  const [split, setSplit] = useState<SplitMode>("equal_all");
  const [selected, setSelected] = useState<string[]>(members);

  useEffect(()=>{ setSubcategory(CATEGORY_MAP[category]?.[0] || "Outros"); },[category]);
  const effective = split==="equal_all" ? members : selected;
  const perHead = useMemo(()=>{ const v = Number(String(amount).replace(",",".")); return (isFinite(v) && effective.length>0) ? Number((v/effective.length).toFixed(2)) : 0; },[amount,effective]);

  function submit(){
    const v = Number(String(amount).replace(",",".")); 
    if(!title.trim()) return alert("Informe o título");
    if(!isFinite(v) || v<=0) return alert("Valor inválido");
    onSave({
      title: title.trim(),
      amount: Number(v.toFixed(2)),
      buyer, payer,
      split,
      participants: effective,
      category, subcategory,
      pix_key: pixKey || null,
      location: location || null,
      date_iso: new Date(dateISO).toISOString(),
      proof_url: null,
      paid: false
    } as any);
  }

  if(!open) return null;
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <motion.div initial={{scale:.98,y:8,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:.98,y:8,opacity:0}} className="relative w-full max-w-lg rounded-2xl border border-emerald-800/60 bg-emerald-900/90 backdrop-blur p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-emerald-50">Nova despesa</h3>
          <button onClick={onClose} className="hover:bg-emerald-800/40 rounded-lg p-1"><X className="h-5 w-5"/></button>
        </div>

        <div className="grid gap-4">
          <input className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)}/>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2" placeholder="Valor (R$)" value={amount} onChange={e=>setAmount(e.target.value)}/>
            <input type="date" className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2" value={dateISO} onChange={e=>setDateISO(e.target.value)}/>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <select className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2" value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORY_LIST.map(c=><option key={c} value={c} className="bg-emerald-900">{c}</option>)}</select>
            <select className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2" value={subcategory} onChange={e=>setSubcategory(e.target.value)}>{(CATEGORY_MAP[category]||["Outros"]).map(s=><option key={s} value={s} className="bg-emerald-900">{s}</option>)}</select>
          </div>
          <div>
            <label className="text-sm">Quem comprou</label>
            <select className="w-full rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2" value={buyer} onChange={e=>setBuyer(e.target.value)}>{members.map(m=><option className="bg-emerald-900" key={m} value={m}>{m}</option>)}</select>
            <label className="text-sm mt-2 block">Quem pagou</label>
            <select className="w-full rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2" value={payer} onChange={e=>setPayer(e.target.value)}>{members.map(m=><option className="bg-emerald-900" key={m} value={m}>{m}</option>)}</select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <select className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2" value={split} onChange={e=>setSplit(e.target.value as SplitMode)}>
              <option value="equal_all" className="bg-emerald-900">Igual entre TODOS</option>
              <option value="equal_selected" className="bg-emerald-900">Igual entre SELECIONADOS</option>
            </select>
            <input className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2" placeholder="Chave PIX (opcional)" value={pixKey} onChange={e=>setPixKey(e.target.value)}/>
          </div>

          {split==="equal_selected" && (
            <div className="mt-1">
              <div className="text-xs text-emerald-100/70 mb-1">Marque quem divide:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {members.map(m=>(
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selected.includes(m)} onChange={()=>setSelected(prev=>prev.includes(m)?prev.filter(x=>x!==m):[...prev,m])}/>
                    {m}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-emerald-800/60 bg-emerald-900/40 p-3">
            <div className="text-sm font-semibold text-emerald-50">Prévia</div>
            <div className="text-xs text-emerald-100/80">{effective.length} participante(s) • {perHead>0?`≈ ${formatBRL(perHead)} por pessoa`:"valor/participantes pendentes"}</div>
          </div>

          <div className="relative">
            <input className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2 pl-9" placeholder="Local (opcional)" value={
