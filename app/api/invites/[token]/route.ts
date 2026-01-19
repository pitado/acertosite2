import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  if (!token) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      group: { select: { id: true, name: true, description: true } },
      createdBy: { select: { id: true, email: true, name: true } },
    },
  });

  if (!invite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  const now = new Date();
  const expired = invite.expiresAt ? invite.expiresAt < now : false;
  const used = !!invite.usedAt;

  return NextResponse.json({
    invite: {
      token: invite.token,
      role: invite.role,
      email: invite.email,
      expiresAt: invite.expiresAt,
      usedAt: invite.usedAt,
      expired,
      used,
      group: invite.group,
      createdBy: invite.createdBy
        ? { email: invite.createdBy.email, name: invite.createdBy.name }
        : null,
    },
  });
}
