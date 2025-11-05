import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ownerEmail = url.searchParams.get("ownerEmail") || "";
  const search = (url.searchParams.get("q") || "").toLowerCase();

  const sb = supabaseServer();
  const { data, error } = await sb
    .from("groups")
    .select("id,name,description,owner_email:owner_email,role_date,created_at,updated_at")
    .eq("owner_email", ownerEmail)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const filtered = search
    ? (data || []).filter(g => g.name.toLowerCase().includes(search))
    : (data || []);

  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { ownerEmail, name, description, roleDateISO, emails } = body as {
    ownerEmail: string; name: string; description?: string; roleDateISO?: string; emails: string[];
  };

  const sb = supabaseServer();
  const { data: g, error } = await sb
    .from("groups")
    .insert({
      owner_email: ownerEmail,
      name,
      description,
      role_date: roleDateISO ? new Date(roleDateISO).toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !g) return NextResponse.json({ error: error?.message || "erro" }, { status: 400 });

  if (Array.isArray(emails) && emails.length) {
    const rows = emails.map((e: string) => ({ group_id: g.id, email: e.toLowerCase() }));
    await sb.from("group_members").insert(rows);
  }

  await sb.from("group_logs").insert({ group_id: g.id, message: `Grupo criado: ${name}.` });
  return NextResponse.json({ id: g.id });
}
