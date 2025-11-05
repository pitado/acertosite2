import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });

  const sb = supabaseServer();

  // localiza o convite
  const { data: invite, error: invErr } = await sb
    .from("group_invites")
    .select("group_id, expires_at")
    .eq("token", params.token)
    .single();

  if (invErr || !invite) {
    return NextResponse.json({ error: "Convite inválido" }, { status: 400 });
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 400 });
  }

  // insere membro (ignora se já existe)
  const { error: insErr } = await sb
    .from("group_members")
    .insert({ group_id: invite.group_id, email: String(email).toLowerCase() })
    .select()
    .single()
    .catch(() => ({ error: null })); // se houver unique conflict, segue

  if (insErr && !String(insErr.message).includes("duplicate")) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, group_id: invite.group_id });
}
