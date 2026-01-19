// app/api/expenses/[expenseId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

export async function DELETE(req: Request, { params }: { params: { expenseId: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Sem usuário (x-user-email)" }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const expense = await prisma.expense.findUnique({
    where: { id: params.expenseId },
    select: { id: true, groupId: true },
  });

  if (!expense) return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });

  // precisa ser membro do grupo
  const member = await prisma.groupMember.findFirst({
    where: { groupId: expense.groupId, userId: user.id },
  });
  if (!member) return NextResponse.json({ error: "Você não está nesse grupo" }, { status: 403 });

  await prisma.expense.delete({ where: { id: expense.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { expenseId: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Sem usuário (x-user-email)" }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const body = await req.json().catch(() => ({}));

  const expense = await prisma.expense.findUnique({
    where: { id: params.expenseId },
    select: { id: true, groupId: true, participants: true, proof_url: true },
  });

  if (!expense) return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });

  const member = await prisma.groupMember.findFirst({
    where: { groupId: expense.groupId, userId: user.id },
  });
  if (!member) return NextResponse.json({ error: "Você não está nesse grupo" }, { status: 403 });

  // Atualiza proof_url (comprovante)
  const proof_url = typeof body?.proof_url === "string" ? body.proof_url : undefined;

  // Marca pago dentro do JSON participants (não exige mudar schema agora)
  let participants = expense.participants as any;
  if (typeof body?.paidByEmail === "string") {
    const paid = body?.paid !== false; // default true
    if (Array.isArray(participants)) {
      participants = participants.map((p) => {
        if (p?.email === body.paidByEmail) return { ...p, paid };
        return p;
      });
    }
  }

  const updated = await prisma.expense.update({
    where: { id: expense.id },
    data: {
      ...(proof_url !== undefined ? { proof_url } : {}),
      ...(participants !== undefined ? { participants } : {}),
    },
  });

  return NextResponse.json({ expense: updated });
}
