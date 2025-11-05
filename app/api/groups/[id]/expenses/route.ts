import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("expenses")
    .select("*")
    .eq("group_id", ctx.params.id)
    .order("date_iso", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const payload = await req.json();
  const sb = supabaseServer();

  const { data: e, error } = await sb.from("expenses").insert({
    group_id: ctx.params.id,
    title: payload.title,
    amount: payload.amount,
    buyer: payload.buyer,
    payer: payload.payer,
    split: payload.split,
    participants: payload.participants ?? null,
    category: payload.category,
    subcategory: payload.subcategory,
    pix_key: payload.pixKey ?? null,
    location: payload.location ?? null,
    date_iso: payload.dateISO,
    proof_url: payload.proofUrl ?? null,
    paid: !!payload.proofUrl
  }).select("*").single();

  if (error || !e) return NextResponse.json({ error: error?.message || "erro" }, { status: 400 });

  const cat = e.category ? ` [${e.category}${e.subcategory ? `/${e.subcategory}` : ""}]` : "";
  const loc = e.location ? ` no ${e.location}` : "";
  const status = e.paid ? "(pago)" : "— pendente";
  const splitLabel = e.split === "equal_selected" ? ` entre ${ (e.participants||[]).length } participante(s)` : " entre todos";
  const msg = `${e.buyer} comprou "${e.title}"${cat}${loc} por R$ ${Number(e.amount).toFixed(2)} ${status} para ${e.payer}${splitLabel}.`;

  await sb.from("group_logs").insert({ group_id: ctx.params.id, message: msg });
  if (e.paid) await sb.from("group_logs").insert({ group_id: ctx.params.id, message: `Pagamento confirmado para "${e.title}".` });

  return NextResponse.json(e);
}
