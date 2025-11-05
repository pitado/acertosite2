// app/api/groups/[id]/members/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: { id: string } };
const emailRegex = /[^@]+@[^.]+\..+/;

/**
 * GET /api/groups/:id/members
 * Retorna a lista de e-mails: owner + membros (sem duplicatas).
 */
export async function GET(_req: Request, { params }: Params) {
  const sb = supabaseServer();

  // pega o owner
  const { data: g, error: gErr } = await sb
    .from("groups")
    .select("owner_email")
    .eq("id", params.id)
    .single();

  if (gErr) {
    return NextResponse.json({ error: gErr.message }, { status: 500 });
  }

  // pega os membros
  const { data: m, error: mErr } = await sb
    .from("group_members")
    .select("email, created_at")
    .eq("group_id", params.id)
    .order("created_at", { ascending: true });

  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }

  // combina owner + membros (sem repetir)
  const list = new Map<string, { email: string; created_at: string | null }>();
  if (g?.owner_email) list.set(String(g.owner_email).toLowerCase(), { email: String(g.owner_email).toLowerCase(), created_at: null });
  (m ?? []).forEach((row) => {
    const e = String(row.email).toLowerCase();
    if (!list.has(e)) list.set(e, { email: e, created_at: row.created_at ?? null });
  });

  return NextResponse.json(Array.from(list.values()), { status: 200 });
}

/**
 * POST /api/groups/:id/members
 * Body: { email: string }
 * Faz upsert; se a sua versão do PostgREST não aceitar onConflict="group_id,email",
 * cai no insert e ignora erro 23505 (duplicado).
 */
export async function POST(req: Request, { params }: Params) {
  const { email } = (await req.json()) as { email?: string };
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const sb = supabaseServer();
  const normalized = String(email).toLowerCase();

  // 1) tenta upsert com onConflict (caminho feliz)
  const up = await sb
    .from("group_members")
    .upsert({ group_id: params.id, email: normalized }, { onConflict: "group_id,email" });

  if (!up.error) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // 2) fallback: insert simples e ignora duplicado (23505)
  const ins = await sb.from("group_members").insert({ group_id: params.id, email: normalized });
  if (ins.error && ins.error.code !== "23505") {
    return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

/**
 * DELETE /api/groups/:id/members
 * Body: { email: string }
 */
export async function DELETE(req: Request, { params }: Params) {
  const { email } = (await req.json()) as { email?: string };
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const sb = supabaseServer();
  const { error } = await sb
    .from("group_members")
    .delete()
    .eq("group_id", params.id)
    .eq("email", String(email).toLowerCase());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 200 });
}
