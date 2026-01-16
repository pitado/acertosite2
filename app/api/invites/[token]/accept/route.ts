import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  // email do usuário logado (por enquanto via header)
  const email = req.headers.get("x-user-email") || "";
  if (!email) {
    return NextResponse.json({ error: "Missing x-user-email" }, { status: 401 });
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { group: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Convite expirado." }, { status: 400 });
  }

  if (invite.usedAt) {
    return NextResponse.json({ error: "Convite já utilizado." }, { status: 400 });
  }

  // cria/pega user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  // ✅ cria membership (GroupMember) se não existir
  // @@unique([groupId, userId]) => chave composta vira groupId_userId
  await prisma.groupMember.upsert({
    where: {
      groupId_userId: {
        groupId: invite.groupId,
        userId: user.id,
      },
    },
    update: {
      role: invite.role, // respeita role do convite
    },
    create: {
      groupId: invite.groupId,
      userId: user.id,
      role: invite.role,
    },
  });

  // ✅ marca como usado (no schema atual só existe usedAt)
  await prisma.invite.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    groupId: invite.groupId,
    groupName: invite.group.name,
  });
}
