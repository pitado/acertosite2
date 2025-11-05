import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

const uid = () => Math.random().toString(36).slice(2);

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data, error } = await sb.from("group_invites").select("id,token,created_at,expires_at").eq("group_id", ctx.params.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const sb = supabaseServer();
  const token = uid();
  const { error } = await sb.from("group_invites").insert({ group_id: ctx.params.id, token });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await sb.from("group_logs").insert({ group_id: ctx.params.id, message: "Convite gerado." });
  return NextResponse.json({ token });
}
