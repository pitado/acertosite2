import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

type Params = { params: { id: string } };

const emailRegex = /[^@]+@[^.]+\..+/;

/**
 * GET /api/groups/:id/members
 * Retorna [{ email, created_at }]
 */
export async function GET(_req: Request, { params }: Params) {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("group_members")
    .select("email, created_at")
    .eq("group_id", params.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/groups/:id/members
 * Body: { email: string }
 * Usa UPSERT para evitar erro de duplicado.
 */
export async function POST(req: Request, { params }: Params) {
  const { email } = (await req.json()) as { email?: string };

  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const sb = supabaseServer();
  const normalized = String(email).toLowerCase();

  const { error } = await sb
    .from("group_members")
    .upsert(
      { group_id: params.id, email: normalized },
      { onConflict: "group_id,email" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
