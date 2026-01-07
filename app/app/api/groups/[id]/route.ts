import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * PATCH /api/groups/:id
 * Body JSON (qualquer campo é opcional):
 * {
 *   "name": string,
 *   "description": string,
 *   "start_at": string (ISO),
 *   "emails": string[]   // membros por e-mail
 * }
 */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const groupId = ctx.params.id;
    if (!groupId) {
      return NextResponse.json({ error: "Missing group id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    let { name, description, start_at, emails } = body as {
      name?: string;
      description?: string;
      start_at?: string;
      emails?: string[];
    };

    // Normaliza valores
    if (typeof name === "string") name = name.trim();
    if (typeof description === "string") description = description.trim();
    if (typeof start_at === "string") start_at = start_at.trim();
    if (Array.isArray(emails)) {
      emails = emails
        .filter((e) => typeof e === "string")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 3);
      // remove duplicados
      emails = [...new Set(emails)];
    }

    const sb = supabaseServer();

    // Monta objeto de atualização só com campos enviados
    const patch: Record<string, any> = {};
    if (name) patch.name = name;
    if (typeof description === "string") patch.description = description;
    if (start_at) {
      const d = new Date(start_at);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "start_at inválido" }, { status: 400 });
      }
      patch.start_at = d.toISOString();
    }
    if (emails) patch.members = emails; // se você estiver usando groups.members (text[])

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const { data, error } = await sb
      .from("groups")
      .update(patch)
      .eq("id", groupId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Erro inesperado" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/:id
 */
export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const groupId = ctx.params.id;
    if (!groupId) {
      return NextResponse.json({ error: "Missing group id" }, { status: 400 });
    }

    const sb = supabaseServer();

    // Se você tem tabela de itens/depêndencias, delete aqui antes (FK sem cascade):
    // await sb.from("group_items").delete().eq("group_id", groupId);

    const { error } = await sb.from("groups").delete().eq("id", groupId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Erro inesperado" },
      { status: 500 }
    );
  }
}
