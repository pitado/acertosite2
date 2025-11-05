import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sb = supabaseServer();

  // pega membros na group_members
  const { data: members, error: mErr } = await sb
    .from("group_members")
    .select("email")
    .eq("group_id", params.id);

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

  // garante que o owner também entra na lista
  const { data: g, error: gErr } = await sb
    .from("groups")
    .select("owner_email")
    .eq("id", params.id)
    .single();

  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 500 });

  const emails = new Set<string>();
  if (g?.owner_email) emails.add(String(g.owner_email).toLowerCase());
  for (const row of members || []) emails.add(String(row.email).toLowerCase());

  return NextResponse.json(Array.from(emails));
}
