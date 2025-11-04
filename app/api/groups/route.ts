import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Preferi criar o client aqui para evitar conflitos, mas
// se você já tem em `lib/supabaseClient.ts`, pode importar de lá.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET  /api/groups?ownerEmail=...   (lista)
// GET  /api/groups?id=...          (um item)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerEmail = searchParams.get("ownerEmail");
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json(data ?? null);
    }

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "ownerEmail é obrigatório" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("owner_email", ownerEmail)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "GET error" }, { status: 500 });
  }
}

// POST  /api/groups  body: { name, ownerEmail, description?, members?, startAt? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, ownerEmail, description, members, startAt } = body || {};
    if (!name || !ownerEmail) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, ownerEmail" },
        { status: 400 }
      );
    }

    const insertRow = {
      name,
      owner_email: ownerEmail,
      description: description ?? null,
      members: members ?? null,
      start_at: startAt ? new Date(startAt).toISOString() : null,
    };

    const { data, error } = await supabase
      .from("groups")
      .insert(insertRow)
      .select()
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "POST error" }, { status: 500 });
  }
}

// PUT  /api/groups  body: { id, name?, description?, members?, startAt? }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, members, startAt } = body || {};
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

    const patch: any = {};
    if (typeof name === "string") patch.name = name;
    patch.description = description ?? null;
    patch.members = members ?? null;
    patch.start_at = startAt ? new Date(startAt).toISOString() : null;

    const { data, error } = await supabase
      .from("groups")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "PUT error" }, { status: 500 });
  }
}

// DELETE  /api/groups?id=...
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

    const { error } = await supabase.from("groups").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "DELETE error" }, { status: 500 });
  }
}
