import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET /api/groups?ownerEmail=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ownerEmail = url.searchParams.get("ownerEmail") || undefined;

  const supa = supabaseServer();
  let query = supa.from("groups").select("*").order("created_at", { ascending: false });
  if (ownerEmail) query = query.eq("owner_email", ownerEmail);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/groups  { name, ownerEmail }
export async function POST(req: Request) {
  const { name, ownerEmail } = await req.json();

  if (!name || !ownerEmail) {
    return NextResponse.json({ error: "name e ownerEmail são obrigatórios" }, { status: 400 });
  }

  const supa = supabaseServer();
  const { data, error } = await supa
    .from("groups")
    .insert({ name, owner_email: ownerEmail })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
