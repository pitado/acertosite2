import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!token) return NextResponse.json({ error: "Token inválido" }, { status: 400 });

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });

  // aqui você pode só “marcar como usado” ou deletar.
  // Vou deletar pra não ficar pendurado.
  await prisma.invite.delete({ where: { token } });

  return NextResponse.json({ ok: true });
}
