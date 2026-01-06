import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const groupId = ctx.params.id;
  if (!groupId) {
    return NextResponse.json({ error: "Missing group id" }, { status: 400 });
  }

  const sb = supabaseServer();
  const { data, error } = await sb
    .from("expenses")
    .select(
      "id,group_id,title,amount,buyer,payer,split,participants,category,subcategory,pix_key,location,date_iso,proof_url,paid,created_at"
    )
    .eq("group_id", groupId)
    .order("date_iso", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const groupId = ctx.params.id;
  if (!groupId) {
    return NextResponse.json({ error: "Missing group id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  if (!body.title) {
    return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  const payload = {
    group_id: groupId,
    title: String(body.title).trim(),
    amount,
    buyer: String(body.buyer || ""),
    payer: String(body.payer || ""),
    split: body.split || "equal_all",
    participants: Array.isArray(body.participants) ? body.participants : null,
    category: body.category || null,
    subcategory: body.subcategory || null,
    pix_key: body.pix_key || null,
    location: body.location || null,
    date_iso: body.date_iso ? new Date(body.date_iso).toISOString() : new Date().toISOString(),
    proof_url: body.proof_url || null,
    paid: !!body.paid,
    created_at: new Date().toISOString(),
  };

  const sb = supabaseServer();
  const { data, error } = await sb
    .from("expenses")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Erro ao criar despesa" }, { status: 400 });
  }

  await sb
    .from("group_logs")
    .insert({ group_id: groupId, message: `Despesa criada: ${payload.title}.` });

  return NextResponse.json(data, { status: 201 });
}
