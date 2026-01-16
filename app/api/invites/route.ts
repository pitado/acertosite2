import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

function randomToken() {
  // token curto e url-safe
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(req: Request) {
  const email = getUserEmail(req);
  if (!email) {
    return NextResponse.json({ error: "Sem usuário (x-user-email)" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const groupId = String(body?.groupId || "");
  const role = body?.role === "OWNER" ? "OWNER" : "MEMBER";

  if (!groupId) {
    return NextResponse.json({ error: "groupId obrigatório" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  // confirma se é dono do grupo
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
  if (group.ownerId !== user.id) {
    return NextResponse.json({ error: "Apenas o dono pode convidar" }, { status: 403 });
  }

  const token = randomToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  const invite = await prisma.invite.create({
    data: {
      groupId,
      token,
      role,
      createdById: user.id,
      expiresAt,
    },
  });

  const origin =
    typeof req.headers.get("origin") === "string" && req.headers.get("origin")
      ? req.headers.get("origin")!
      : "https://acerto.site";

  const link = `${origin}/invite/${invite.token}`;
  return NextResponse.json({ invite, link });
}
