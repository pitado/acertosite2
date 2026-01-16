import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

async function assertMembership(groupId: string, email: string) {
  return prisma.groupMember.findFirst({
    where: { groupId, user: { email } },
    include: { user: true },
  });
}

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Missing x-user-email" }, { status: 401 });

  const groupId = params.groupId;
  const me = await assertMembership(groupId, email);
  if (!me) return NextResponse.json({ error: "Você não está nesse grupo" }, { status: 403 });

  const expenses = await prisma.expense.findMany({
    where: { groupId },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ expenses });
}

export async function POST(req: Request, { params }: { params: { groupId: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Missing x-user-email" }, { status: 401 });

  const groupId = params.groupId;
  const me = await assertMembership(groupId, email);
  if (!me) return NextResponse.json({ error: "Você não está nesse grupo" }, { status: 403 });

  const body = await req.json().catch(() => ({}));

  const title = String(body?.title || "").trim();
  const amount = Number(body?.amount || 0);
  const buyer = String(body?.buyer || email);
  const payer = String(body?.payer || email);
  const split = String(body?.split || "equal");
  const participants = Array.isArray(body?.participants) ? body.participants : [];
  const category = String(body?.category || "outros");

  if (!title) return NextResponse.json({ error: "title obrigatório" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0)
    return NextResponse.json({ error: "amount inválido" }, { status: 400 });
  if (!participants.length)
    return NextResponse.json({ error: "participants obrigatório" }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      groupId,
      title,
      amount,
      buyer,
      payer,
      split,
      participants,
      category,
      subcategory: body?.subcategory ?? null,
      location: body?.location ?? null,
      date_iso: body?.date_iso ?? null,
      pix_key: body?.pix_key ?? null,
      proof_url: body?.proof_url ?? null,
    },
  });

  await prisma.logEntry.create({
    data: {
      groupId,
      message: `${email} adicionou despesa: ${title} (R$ ${amount.toFixed(2)})`,
    },
  });

  return NextResponse.json({ expense });
}
