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

  // cria membership se não existir
  await prisma.membership.upsert({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: invite.groupId,
      },
    },
    update: {
      role: invite.role, // respeita role do convite
    },
    create: {
      userId: user.id,
      groupId: invite.groupId,
      role: invite.role,
    },
  });

  // marca como usado (pra não reutilizar)
  await prisma.invite.update({
    where: { token },
    data: { usedAt: new Date(), usedById: user.id },
  });

  return NextResponse.json({
    ok: true,
    groupId: invite.groupId,
    groupName: invite.group.name,
  });
}
