import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;

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

  await prisma.invite.update({
    where: { token },
    data: {
      usedAt: new Date(), // marca como “encerrado”
      email: email, // opcional: registra quem recusou (se quiser)
    },
  });

  return NextResponse.json({
    ok: true,
    message: `Convite para "${invite.group.name}" recusado.`,
  });
}
