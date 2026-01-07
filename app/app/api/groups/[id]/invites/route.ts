// app/api/groups/[id]/invites/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: { id: string } };

function randomToken(len = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** GET /api/groups/:id/invites */
export async function GET(_req: Request, { params }: Params) {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("invites") // <<< tabela correta do SQL
    .select("token, created_at, expires_at")
    .eq("group_id", params.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? [], { status: 200 });
}

/** POST /api/groups/:id/invites */
export async function POST(_req: Request, { params }: Params) {
  const sb = supabaseServer();

  const MAX_TRIES = 5;
  for (let i = 0; i < MAX_TRIES; i++) {
    const token = randomToken(10);

    const { data, error } = await sb
      .from("invites") // <<< tabela correta do SQL
      .insert({
        group_id: params.id,
        token,
        // opcional:
        // expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      })
      .select("token")
      .single();

    if (!error && data) {
      return NextResponse.json({ token: data.token }, { status: 201 });
    }

    // se o erro NÃO for de duplicidade de token, retorna
    if (!String(error?.message || "").toLowerCase().includes("duplicate")) {
      return NextResponse.json(
        { error: error?.message || "Falha ao criar convite" },
        { status: 500 }
      );
    }
    // duplicidade: tenta outro token no próximo loop
  }

  return NextResponse.json(
    { error: "Não foi possível gerar um token único" },
    { status: 500 }
  );
}
