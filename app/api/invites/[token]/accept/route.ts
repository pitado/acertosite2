import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      group: true,
      createdBy: true,
    },
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

  return NextResponse.json({
    invite: {
      token: invite.token,
      role: invite.role,
      expiresAt: invite.expiresAt,
      group: {
        id: invite.group.id,
        name: invite.group.name,
        description: invite.group.description,
      },
      createdBy: invite.createdBy?.email || null,
      createdAt: invite.createdAt,
    },
  });
}
