"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Users, Pencil, Trash2, Search, Link as LinkIcon, Wallet, MapPin,
  Paperclip, ChevronDown, Loader2, Info, ShieldCheck, Check, X
} from "lucide-react";

/** ================ helpers & tipos ================== */
type Group = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;             // “dono” (email salvo no login)
  members: { email: string }[];
  roleDateISO?: string;        // data/hora do rolê (countdown)
  createdAt: string;
  updatedAt: string;
};
type Invite  = { id: string; groupId: string; token: string; createdAt: string };
type SplitMode = "equal_all" | "equal_selected";
type Expense = {
  id: string; groupId: string; title: string; amount: number;
  buyer: string; payer: string; split: SplitMode; participants?: string[];
  category?: string; subcategory?: string; pixKey?: string; location?: string;
  dateISO: string; proofUrl?: string; paid?: boolean; createdAt: string;
};
type LogEntry = { id: string; groupId: string; message: string; createdAt: string };

const emailRegex = /[^@]+@[^.]+\..+/;
const uid = () => Math.random().toString(36).slice(2);
const nowISO = () => new Date().toISOString();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const money = (n: number) => `R$ ${n.toFixed(2)}`;
const initials = (email: string) => email.split("@")[0].slice(0, 2).toUpperCase();

const CATEGORY: Record<string, string[]> = {
  Transporte: ["Gasolina", "Pedágio", "Estacionamento", "Uber/Taxi", "Ônibus/Metrô"],
  Alimentação: ["Comida", "Bebida", "Mercado"],
  Estadia: ["Acomodação", "Taxas"],
  Ingressos: ["Show/Evento", "Passeio", "Museu"],
  Diversos: ["Outros"],
};
const CAT = Object.keys(CATEGORY);

/** ================ mock “DB” em memória ================== */
const db: { groups: Group[]; invites: Invite[]; expenses: Expense[]; logs: LogEntry[] } = {
  groups: [], invites: [], expenses: [], logs: []
};

/** ================ serviços (mock) ================== */
const GroupService = {
  async list(ownerId: string, q=""){ await wait(80);
    const base = db.groups.filter(g => g.ownerId===ownerId);
    const s = q.trim().toLowerCase();
    return (s ? base.filter(g => g.name.toLowerCase().includes(s)) : base)
      .sort((a,b)=>a.name.localeCompare(b.name,"pt-BR",{sensitivity:"base"}));
  },
  async create(ownerId: string, data: Omit<Group,"id"|"ownerId"|"createdAt"|"updatedAt">){
    await wait(100);
    const name = data.name.trim();
    if(!name) throw new Error("Informe o nome do grupo.");
    // RN02: nome único por dono
    if(db.groups.some(g => g.ownerId===ownerId && g.name.toLowerCase()===name.toLowerCase()))
      throw new Error("Já existe um grupo com este nome.");
    const members = Array.from(new Set((data.members||[]).map(m => m.email.trim().toLowerCase())))
      .filter(e => emailRegex.test(e)).map(e => ({email:e}));
    if(members.length < 1) throw new Error("Adicione pelo menos 1 membro por e-mail.");

    const g: Group = { id: uid(), ownerId, name, description:data.description?.trim(),
      members, roleDateISO:data.roleDateISO, createdAt: nowISO(), updatedAt: nowISO() };
    db.groups.push(g);
    db.logs.unshift({id:uid(),groupId:g.id,message:`Grupo criado: ${g.name}.`,createdAt:nowISO()});
    return g;
  },
  async update(ownerId:string, id:string, patch: Partial<Omit<Group,"id"|"ownerId"|"createdAt">>){
    await wait(90);
    const i = db.groups.findIndex(g => g.ownerId===ownerId && g.id===id);
    if(i<0) throw new Error("Grupo não encontrado.");
    if(patch.name){
      const nm = patch.name.trim().toLowerCase();
      if(db.groups.some(g => g.ownerId===ownerId && g.name.toLowerCase()===nm && g.id!==id))
        throw new Error("Já existe um grupo com este nome.");
    }
    const prev = db.groups[i];
    const members = patch.members
      ? Array.from(new Set(patch.members.map(m=>m.email.trim().toLowerCase())))
          .filter(e=>emailRegex.test(e)).map(e=>({email:e}))
      : prev.members;
    const next: Group = { ...prev, ...patch, members, name: (patch.name?.trim() ?? prev.name), updatedAt: nowISO() };
    db.groups[i]=next;
    db.logs.unshift({id:uid(),groupId:id,message:`Grupo atualizado: ${next.name}.`,createdAt:nowISO()});
    return next;
  },
  async remove(ownerId:string, id:string){
    await wait(70);
    // RN08: não excluir se tiver despesa não paga
    if(db.expenses.some(e => e.groupId===id && !e.paid))
      throw new Error("Existe despesa pendente. Quite antes de excluir o grupo.");
    const before = db.groups.length;
    db.groups = db.groups.filter(g => !(g.ownerId===ownerId && g.id===id));
    if(db.groups.length===before) throw new Error("Grupo não encontrado.");
    db.expenses = db.expenses.filter(e=>e.groupId!==id);
    db.invites  = db.invites.filter(i=>i.groupId!==id);
    db.logs     = db.logs.filter(l=>l.groupId!==id);
  }
};

const InviteService = {
  async create(groupId:string){ await wait(50);
    const inv: Invite = { id:uid(), groupId, token: uid(), createdAt: nowISO() };
    db.invites.unshift(inv);
    db.logs.unshift({id:uid(),groupId, message:"Convite gerado.", createdAt: nowISO()});
    return inv;
  },
  async list(groupId:string){ await wait(40); return db.invites.filter(i=>i.groupId===groupId); }
};

const ExpenseService = {
  async list(groupId:string){ await wait(50);
    return db.expenses.filter(e=>e.groupId===groupId).sort((a,b)=>b.dateISO.localeCompare(a.dateISO));
  },
  async create(groupId:string, data: Omit<Expense,"id"|"groupId"|"createdAt">){
    await wait(120);
    // RN05
    if(!data.title.trim()) throw new Error("Informe o título.");
    if(!isFinite(data.amount) || data.amount<=0) throw new Error("Valor inválido.");
    if(!emailRegex.test(data.buyer) || !emailRegex.test(data.payer)) throw new Error("E-mail inválido.");
    // RN06
    if(data.split==="equal_selected" && (!data.participants || data.participants.length===0))
      throw new Error("Selecione ao menos 1 participante para dividir.");

    const exp: Expense = { id:uid(), groupId, createdAt: nowISO(), ...data };
    db.expenses.unshift(exp);

    const cat = exp.category ? ` [${exp.category}${exp.subcategory?`/${exp.subcategory}`:""}]` : "";
    const loc = exp.location ? ` no ${exp.location}` : "";
    const status = exp.paid ? "(pago)" : "— pendente";
    const splitLabel = exp.split==="equal_selected" ? ` entre ${exp.participants?.length} participante(s)` : " entre todos";
    db.logs.unshift({
      id:uid(), groupId, createdAt: nowISO(),
      message:`${exp.buyer} comprou "${exp.title}"${cat}${loc} por ${money(exp.amount)} ${status} para ${exp.payer}${splitLabel}.`
    });
    if(exp.paid){
      db.logs.unshift({ id:uid(), groupId, createdAt: nowISO(), message:`Pagamento confirmado para "${exp.title}".` });
    }
    return exp;
  },
  async remove(id:string){
    await wait(50);
    const exp = db.expenses.find(e=>e.id===id);
    db.expenses = db.expenses.filter(e=>e.id!==id);
    if(exp) db.logs.unshift({id:uid(),groupId:exp.groupId,createdAt:nowISO(),message:`Despesa removida: ${exp.title}.`});
  },
  async markPaid(id:string, by:string){
    await wait(60);
    const i = db.expenses.findIndex(e=>e.id===id);
    if(i<0) throw new Error("Despesa não encontrada.");
    db.expenses[i] = { ...db.expenses[i], paid: true };
    db.logs.unshift({ id:uid(), groupId: db.expenses[i].groupId, createdAt: nowISO(),
      message:`${by} marcou como paga a despesa "${db.expenses[i].title}".` });
  }
};

/** =================== componentes UI =================== */

function Badge({children}:{children:React.ReactNode}){
  return <span style={{
    display:"inline-flex", alignItems:"center", gap:6,
    background:"#0f362f", color:"#cdeee5", border:"1px solid #1f574c",
    padding:"4px 10px", borderRadius:999, fontSize:12, whiteSpace:"nowrap"
  }}>{children}</span>;
}

function Section({title, right, children}:{title:string; right?:React.ReactNode; children:React.ReactNode}){
  return (
    <div style={{marginTop:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h3 style={{margin:0, color:"#e8fff7"}}>{title}</h3>
        {right}
      </div>
      <div style={{background:"#0f2e28", border:"1px solid #1b4f45", borderRadius:12, padding:12}}>
        {children}
      </div>
    </div>
  );
}

/** =================== página =================== */
export default function GroupsPage(){
  const [ownerEmail, setOwnerEmail] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sel, setSel] = useState<Group | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // form de grupo
  const [gName, setGName] = useState("");
  const [gDesc, setGDesc] = useState("");
  const [gMembers, setGMembers] = useState<string>("");
  const [gDate, setGDate] = useState<string>("");

  // form de despesa
  const [dTitle,setDTitle] = useState("");
  const [dAmount,setDAmount] = useState<number | "">("");
  const [dBuyer,setDBuyer] = useState("");
  const [dPayer,setDPayer] = useState("");
  const [dSplit,setDSplit] = useState<SplitMode>("equal_all");
  const [dParts,setDParts] = useState<string[]>([]);
  const [dCat,setDCat] = useState<string>("Transporte");
  const [dSub,setDSub] = useState<string>("Gasolina");
  const [dPix,setDPix] = useState("");
  const [dLoc,setDLoc] = useState("");
  const [dDate,setDDate] = useState<string>("");
  const [dProof,setDProof] = useState("");
  const [dPaid,setDPaid] = useState(false);

  /** carregar e-mail salvo pelo login */
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("acerto_email") : "";
    if(saved) { setOwnerEmail(saved); load(saved); }
  }, []);

  async function load(owner: string){
    if(!owner) return;
    setLoading(true); setMsg(null);
    const list = await GroupService.list(owner, q);
    setGroups(list);
    if(!sel || !list.some(g=>g.id===sel.id)) setSel(list[0] ?? null);
    setLoading(false);
  }

  async function refreshSelected(){
    if(!sel) return;
    setInvites(await InviteService.list(sel.id));
    setExpenses(await ExpenseService.list(sel.id));
    setLogs(db.logs.filter(l=>l.groupId===sel.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
  }

  useEffect(()=>{ refreshSelected(); /* eslint-disable-next-line */ }, [sel]);

  /** criação/edição de grupo */
  async function submitGroup(){
    try{
      if(!ownerEmail) return setMsg("Faça login novamente.");
      setLoading(true); setMsg(null);
      const members = gMembers.split(",").map(s=>s.trim()).filter(Boolean).map(e=>({email:e}));
      if(!sel){ // criar
        const g = await GroupService.create(ownerEmail,{name:gName, description:gDesc, members, roleDateISO:gDate?new Date(gDate).toISOString():undefined});
        setSel(g); setGroups(await GroupService.list(ownerEmail,q));
      }else{ // editar
        const g = await GroupService.update(ownerEmail, sel.id, {name:gName||undefined, description:gDesc, members, roleDateISO:gDate?new Date(gDate).toISOString():null as any});
        setSel(g); setGroups(await GroupService.list(ownerEmail,q));
      }
      setGName(""); setGDesc(""); setGMembers(""); setGDate("");
    }catch(e:any){ setMsg(e.message||"Erro ao salvar."); }
    finally{ setLoading(false); }
  }

  async function editFromSelected(){
    if(!sel) return;
    setGName(sel.name);
    setGDesc(sel.description||"");
    setGMembers(sel.members.map(m=>m.email).join(", "));
    setGDate(sel.roleDateISO ? new Date(sel.roleDateISO).toISOString().slice(0,16) : "");
  }

  async function removeGroup(){
    if(!sel || !ownerEmail) return;
    try{
      setLoading(true); setMsg(null);
      await GroupService.remove(ownerEmail, sel.id);
      const list = await GroupService.list(ownerEmail,q);
      setGroups(list); setSel(list[0]??null);
    }catch(e:any){ setMsg(e.message||"Erro ao remover."); }
    finally{ setLoading(false); }
  }

  async function createInvite(){
    if(!sel) return;
    const inv = await InviteService.create(sel.id);
    setInvites([inv, ...invites]);
    navigator.clipboard?.writeText(`${location.origin}/join/${inv.token}`);
    setMsg("Link de convite copiado!");
  }

  /** despesas */
  async function addExpense(){
    if(!sel) return setMsg("Selecione um grupo.");
    try{
      setLoading(true); setMsg(null);
      const exp = await ExpenseService.create(sel.id,{
        title:dTitle.trim(), amount: Number(dAmount), buyer:dBuyer.trim().toLowerCase(),
        payer:dPayer.trim().toLowerCase(), split:dSplit, participants:(dSplit==="equal_selected"?dParts:undefined),
        category:dCat, subcategory:dSub, pixKey:dPix.trim(), location:dLoc.trim(),
        dateISO: dDate? new Date(dDate).toISOString() : new Date().toISOString(),
        proofUrl:dProof.trim(), paid:dPaid
      });
      setExpenses([exp, ...expenses]);
      // limpa form
      setDTitle(""); setDAmount(""); setDBuyer(""); setDPayer(""); setDSplit("equal_all"); setDParts([]);
      setDCat("Transporte"); setDSub("Gasolina"); setDPix(""); setDLoc(""); setDDate(""); setDProof(""); setDPaid(false);
      await refreshSelected();
    }catch(e:any){ setMsg(e.message||"Erro ao criar despesa."); }
    finally{ setLoading(false); }
  }

  /** derived */
  const countdown = useMemo(()=>{
    if(!sel?.roleDateISO) return "";
    const diff = +new Date(sel.roleDateISO) - Date.now();
    if(diff<=0) return "Já começou!";
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    return `${d}d ${h}h ${m}m`;
  },[sel?.roleDateISO]);

  return (
    <main style={{minHeight:"100vh", background:"radial-gradient(circle at 30% 30%, #0f3b31 0%, #071f1a 70%)", padding:"28px 18px"}}>
      <div style={{maxWidth:1200, margin:"0 auto"}}>
        <div style={{display:"flex", gap:16, alignItems:"flex-start"}}>
          {/* COLUNA ESQUERDA – lista de grupos */}
          <div style={{flex:"0 0 360px"}}>
            <div style={{background:"#0f2e28", border:"1px solid #1b4f45", borderRadius:16, padding:14, boxShadow:"0 10px 30px rgba(0,0,0,.25)"}}>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
                <img src="/logo.svg" alt="logo" style={{height:28}}/>
                <h2 style={{margin:0, color:"#e8fff7"}}>AcertÔ — Grupos</h2>
              </div>

              <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:10}}>
                <Search size={16} color="#9ad7c8"/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar grupo"
                  style={{flex:1, background:"#0b221d", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                <button onClick={()=>load(ownerEmail)} style={{background:"#1dd1a1", border:"none", padding:"8px 10px", borderRadius:8, color:"#083128", fontWeight:700}}>
                  Atualizar
                </button>
              </div>

              <div style={{maxHeight:400, overflow:"auto", borderTop:"1px solid #1b4f45"}}>
                {groups.map(g=>(
                  <div key={g.id}
                    onClick={()=>setSel(g)}
                    style={{
                      padding:"10px 6px", cursor:"pointer",
                      background: sel?.id===g.id ? "#114439" : "transparent",
                      borderBottom:"1px solid #123f36"
                    }}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <strong style={{color:"#dcfff4"}}>{g.name}</strong>
                      <small style={{color:"#9ad7c8"}}>{new Date(g.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div style={{display:"flex", gap:6, marginTop:6, flexWrap:"wrap"}}>
                      {g.members.slice(0,5).map(m=>(
                        <Badge key={m.email}><Users size={12}/>{m.email}</Badge>
                      ))}
                      {g.members.length>5 && <Badge>+{g.members.length-5}</Badge>}
                    </div>
                  </div>
                ))}
                {!groups.length && <div style={{padding:10, color:"#a5d8cd"}}>Nenhum grupo ainda.</div>}
              </div>
            </div>

            {/* criar/editar grupo */}
            <Section title={sel ? "Editar grupo" : "Novo grupo"}>
              <div style={{display:"grid", gap:8}}>
                <input value={gName} onChange={e=>setGName(e.target.value)} placeholder="Nome do grupo"
                  style={{background:"#0b221d", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                <textarea value={gDesc} onChange={e=>setGDesc(e.target.value)} placeholder="Descrição (opcional)"
                  style={{background:"#0b221d", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px", minHeight:60}}/>
                <input value={gMembers} onChange={e=>setGMembers(e.target.value)} placeholder="E-mails separados por vírgula"
                  style={{background:"#0b221d", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                <div style={{display:"flex", gap:8}}>
                  <input type="datetime-local" value={gDate} onChange={e=>setGDate(e.target.value)}
                    style={{flex:1, background:"#0b221d", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                  <button onClick={editFromSelected} disabled={!sel}
                    style={{background:"#164e88", color:"#e9f6ff", border:"none", borderRadius:8, padding:"8px 10px"}}>
                    Carregar do grupo
                  </button>
                </div>
                <div style={{display:"flex", gap:8}}>
                  <button onClick={submitGroup}
                    style={{flex:1, background:"#1dd1a1", border:"none", padding:"10px", borderRadius:8, color:"#083128", fontWeight:700}}>
                    {sel ? "Salvar alterações" : "Criar grupo"}
                  </button>
                  <button onClick={removeGroup} disabled={!sel}
                    style={{background:"#cc554e", color:"#210b0a", border:"none", padding:"10px 12px", borderRadius:8}}>
                    <Trash2 size={16}/> Remover
                  </button>
                </div>
                {!!countdown && <div style={{marginTop:6, color:"#a2e8db"}}>⏳ Rolê em: <strong>{countdown}</strong></div>}
              </div>
            </Section>
          </div>

          {/* COLUNA DIREITA – detalhes do grupo */}
          <div style={{flex:"1 1 auto"}}>
            {sel ? (
              <div style={{background:"#0f2e28", border:"1px solid #1b4f45", borderRadius:16, padding:16, boxShadow:"0 10px 30px rgba(0,0,0,.25)"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
                  <h2 style={{margin:0, color:"#e8fff7"}}>{sel.name}</h2>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <span style={{color:"#9ad7c8"}}>{ownerEmail}</span>
                    <Badge><ShieldCheck size={12}/> admin</Badge>
                  </div>
                </div>
                {sel.description && <p style={{marginTop:4, color:"#a5d8cd"}}>{sel.description}</p>}

                {/* CONVITES */}
                <Section
                  title="Convites"
                  right={<button onClick={createInvite} style={{background:"#1dd1a1", border:"none", padding:"8px 10px", borderRadius:8, color:"#083128", fontWeight:700}}>
                    <LinkIcon size={16}/> Gerar link
                  </button>}
                >
                  {!!invites.length ? (
                    <ul style={{margin:0, paddingLeft:18, color:"#daf5ef"}}>
                      {invites.map(inv=>(
                        <li key={inv.id} style={{marginBottom:4}}>
                          <code style={{background:"#0b221d", padding:"3px 6px", borderRadius:6, border:"1px solid #1b4f45"}}>
                            /join/{inv.token}
                          </code>{" "}
                          <small style={{color:"#8ccfc1"}}>({new Date(inv.createdAt).toLocaleString()})</small>
                        </li>
                      ))}
                    </ul>
                  ) : <div style={{color:"#9ad7c8"}}>Nenhum convite ainda.</div>}
                </Section>

                {/* DESPESAS */}
                <Section title="Despesas">
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                    {/* form */}
                    <div style={{background:"#0b221d", border:"1px solid #1b4f45", borderRadius:10, padding:10}}>
                      <div style={{display:"grid", gap:8}}>
                        <input value={dTitle} onChange={e=>setDTitle(e.target.value)} placeholder="Título"
                          style={{background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                        <div style={{display:"flex", gap:8}}>
                          <input type="number" min={0} value={dAmount} onChange={e=>setDAmount(e.target.value===""?"":Number(e.target.value))} placeholder="Valor"
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                          <input value={dDate} onChange={e=>setDDate(e.target.value)} type="datetime-local"
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                        </div>
                        <div style={{display:"flex", gap:8}}>
                          <input value={dBuyer} onChange={e=>setDBuyer(e.target.value)} placeholder="Quem comprou (e-mail)"
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                          <input value={dPayer} onChange={e=>setDPayer(e.target.value)} placeholder="Quem paga (e-mail)"
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                        </div>

                        <div style={{display:"flex", gap:8}}>
                          <select value={dCat} onChange={e=>{ setDCat(e.target.value); setDSub(CATEGORY[e.target.value][0]); }}
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}>
                            {CAT.map(c=><option key={c}>{c}</option>)}
                          </select>
                          <select value={dSub} onChange={e=>setDSub(e.target.value)}
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}>
                            {CATEGORY[dCat].map(s=><option key={s}>{s}</option>)}
                          </select>
                        </div>

                        <div style={{display:"flex", gap:8}}>
                          <input value={dPix} onChange={e=>setDPix(e.target.value)} placeholder="Chave PIX (opcional)"
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                          <input value={dLoc} onChange={e=>setDLoc(e.target.value)} placeholder="Local (opcional)"
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                        </div>

                        <div style={{display:"flex", gap:8}}>
                          <select value={dSplit} onChange={e=>setDSplit(e.target.value as SplitMode)}
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}>
                            <option value="equal_all">Dividir igualmente entre todos</option>
                            <option value="equal_selected">Dividir entre selecionados</option>
                          </select>
                          <input value={dProof} onChange={e=>setDProof(e.target.value)} placeholder="URL do comprovante (opcional)"
                            style={{flex:1, background:"#081a16", color:"#e6fff7", border:"1px solid #1b4f45", borderRadius:8, padding:"8px 10px"}}/>
                        </div>

                        {dSplit==="equal_selected" && (
                          <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                            {sel.members.map(m=>{
                              const on = dParts.includes(m.email);
                              return (
                                <button key={m.email} onClick={()=> setDParts(on ? dParts.filter(x=>x!==m.email) : [...dParts, m.email])}
                                  style={{border:"1px solid #1b4f45", background:on?"#155e52":"#081a16", color:"#e6fff7", borderRadius:999, padding:"6px 10px"}}>
                                  {m.email}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <label style={{display:"flex", alignItems:"center", gap:8, color:"#cfeee6", fontSize:14}}>
                          <input type="checkbox" checked={dPaid} onChange={e=>setDPaid(e.target.checked)}/> Marcar como paga
                        </label>

                        <button onClick={addExpense}
                          style={{background:"#1dd1a1", border:"none", padding:"10px", borderRadius:8, color:"#083128", fontWeight:700}}>
                          <Wallet size={16}/> Adicionar despesa
                        </button>
                      </div>
                    </div>

                    {/* tabela */}
                    <div style={{overflow:"auto"}}>
                      <table style={{width:"100%", borderCollapse:"collapse", color:"#e6fff7"}}>
                        <thead>
                          <tr style={{background:"#0b221d"}}>
                            <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #1b4f45"}}>Título</th>
                            <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #1b4f45"}}>Valor</th>
                            <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #1b4f45"}}>Quem comprou</th>
                            <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #1b4f45"}}>Quem paga</th>
                            <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #1b4f45"}}>Situação</th>
                            <th style={{padding:8, borderBottom:"1px solid #1b4f45"}}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map(e=>(
                            <tr key={e.id} style={{borderBottom:"1px solid #123f36"}}>
                              <td style={{padding:8}}>
                                <div style={{display:"flex", gap:6, alignItems:"center"}}>
                                  <strong>{e.title}</strong>
                                  <small style={{color:"#9ad7c8"}}>{e.category}{e.subcategory?`/${e.subcategory}`:""}</small>
                                </div>
                                <small style={{color:"#9ad7c8"}}>{new Date(e.dateISO).toLocaleString()}</small>
                              </td>
                              <td style={{padding:8}}>{money(e.amount)}</td>
                              <td style={{padding:8}}>{e.buyer}</td>
                              <td style={{padding:8}}>{e.payer}</td>
                              <td style={{padding:8}}>
                                {e.paid ? <Badge><Check size={12}/> pago</Badge> : <Badge><Info size={12}/> pendente</Badge>}
                              </td>
                              <td style={{padding:8, textAlign:"right"}}>
                                {!e.paid && (
                                  <button onClick={()=>ExpenseService.markPaid(e.id, ownerEmail).then(refreshSelected)}
                                    style={{marginRight:6, background:"#1dd1a1", border:"none", padding:"6px 10px", borderRadius:8, color:"#083128", fontWeight:700}}>
                                    Marcar pago
                                  </button>
                                )}
                                <button onClick={()=>ExpenseService.remove(e.id).then(refreshSelected)}
                                  style={{background:"#cc554e", color:"#210b0a", border:"none", padding:"6px 10px", borderRadius:8}}>
                                  <Trash2 size={14}/>
                                </button>
                              </td>
                            </tr>
                          ))}
                          {!expenses.length && (
                            <tr><td colSpan={6} style={{padding:10, color:"#a5d8cd"}}>Nenhuma despesa ainda.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Section>

                {/* LOG */}
                <Section title="Atividades">
                  {!!logs.length ? (
                    <ul style={{margin:0, paddingLeft:18, color:"#daf5ef"}}>
                      {logs.map(l=>(
                        <li key={l.id} style={{marginBottom:4}}>
                          {l.message}{" "}
                          <small style={{color:"#8ccfc1"}}>({new Date(l.createdAt).toLocaleString()})</small>
                        </li>
                      ))}
                    </ul>
                  ) : <div style={{color:"#9ad7c8"}}>Nenhuma atividade ainda.</div>}
                </Section>

                {msg && <div style={{marginTop:14, color:"#ffb3b3"}}>{msg}</div>}
              </div>
            ):(
              <div style={{color:"#a5d8cd"}}>Selecione ou crie um grupo à esquerda.</div>
            )}
          </div>
        </div>

        {loading && (
          <div style={{position:"fixed", inset:0, display:"grid", placeItems:"center", pointerEvents:"none"}}>
            <div style={{background:"rgba(0,0,0,.35)", padding:12, borderRadius:12}}>
              <Loader2 className="spin" size={28} color="#c7fff1"/>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
