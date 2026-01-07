import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
  }

  const sb = supabaseServer();

  // 1) localizar convite pela tabela 'invites'
  const { data: invite, error: invErr } = await sb
    .from("invites")
    .select("group_id, expires_at")
    .eq("token", params.token)
    .single();

  if (invErr || !invite) {
    return NextResponse.json({ error: "Convite inválido" }, { status: 400 });
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 400 });
  }

  // 2) adicionar membro com upsert para evitar duplicado
  const normalized = String(email).toLowerCase();

  const { error: upErr } = await sb
    .from("group_members")
    .upsert(
      { group_id: invite.group_id, email: normalized },
      { onConflict: "group_id,email" }
    );

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, group_id: invite.group_id }, { status: 201 });
}
