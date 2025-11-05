import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient"; // seu helper já existe

type SplitMode = "equal_all" | "equal_selected";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("expenses")
    .select("*")
    .eq("group_id", params.id)
    .order("date_iso", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  // validações mínimas
  if (!body?.title || typeof body.title !== "string")
    return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0)
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });

  const payload = {
    group_id: params.id,
    title: body.title.trim(),
    amount,
    buyer: String(body.buyer || ""),
    payer: String(body.payer || ""),
    split: (body.split as SplitMode) || "equal_all",
    participants: Array.isArray(body.participants) ? body.participants : null,
    category: body.category ?? null,
    subcategory: body.subcategory ?? null,
    pix_key: body.pix_key ?? null,
    location: body.location ?? null,
    date_iso: body.date_iso ? new Date(body.date_iso).toISOString() : new Date().toISOString(),
    proof_url: body.proof_url ?? null,
    paid: !!body.paid,
  };

  const sb = supabaseServer();
  const { data, error } = await sb.from("expenses").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
