import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function DELETE(_req: Request, ctx: { params: { expenseId: string } }) {
  const sb = supabaseServer();
  const { data: exp } = await sb.from("expenses").select("group_id,title").eq("id", ctx.params.expenseId).single();
  await sb.from("expenses").delete().eq("id", ctx.params.expenseId);
  if (exp) await sb.from("group_logs").insert({ group_id: exp.group_id, message: `Despesa removida: ${exp.title}.` });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, ctx: { params: { expenseId: string } }) {
  const body = await req.json(); // { paid?: boolean, proofUrl?: string, by?: string }
  const sb = supabaseServer();
  const { data: exp, error } = await sb.from("expenses")
    .update({ paid: body.paid ?? true, proof_url: body.proofUrl ?? null })
    .eq("id", ctx.params.expenseId)
    .select("group_id,title").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await sb.from("group_logs").insert({ group_id: exp.group_id, message: `${body.by || "alguém"} marcou como pago: ${exp.title}.` });
  return NextResponse.json({ ok: true });
}
