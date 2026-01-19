import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Sem usuário (x-user-email)" }, { status: 401 });

  const token = params.token;
  if (!token) return NextResponse.json({ error: "Token inválido" }, { status: 400 });

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { group: true },
  });

  if (!invite) return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "Convite já utilizado" }, { status: 409 });

  const now = new Date();
  if (invite.expiresAt && invite.expiresAt < now) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
  }

  // cria/garante membership
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: invite.groupId, userId: user.id } },
    update: { role: invite.role },
    create: {
      groupId: invite.groupId,
      userId: user.id,
      role: invite.role,
    },
  });

  // marca convite como usado
  await prisma.invite.update({
    where: { token },
    data: { usedAt: now },
  });

  // log (opcional, mas ajuda em "atividades recentes")
  await prisma.logEntry.create({
    data: {
      groupId: invite.groupId,
      message: `${email} entrou no grupo como ${invite.role}`,
    },
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
