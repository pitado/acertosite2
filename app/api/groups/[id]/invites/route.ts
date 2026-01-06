import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const groupId = ctx.params.id;
  if (!groupId) {
    return NextResponse.json({ error: "Missing group id" }, { status: 400 });
  }

  const sb = supabaseServer();
  const { data, error } = await sb
    .from("invites")
    .select("token,created_at,expires_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const groupId = ctx.params.id;
  if (!groupId) {
    return NextResponse.json({ error: "Missing group id" }, { status: 400 });
  }

  const token = randomUUID();
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("invites")
    .insert({ group_id: groupId, token })
    .select("token")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Erro ao criar convite" }, { status: 400 });
  }

  return NextResponse.json({ token: data.token }, { status: 201 });
}
