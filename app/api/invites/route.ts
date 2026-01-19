import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

function randomToken() {
  // token url-safe forte (evita colisão melhor que Math.random)
  return crypto.randomBytes(24).toString("base64url");
}

export async function POST(req: Request) {
  const email = getUserEmail(req);
  if (!email) {
    return NextResponse.json({ error: "Sem usuário (x-user-email)" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const groupId = String(body?.groupId || "");
  const role = body?.role === "OWNER" ? "OWNER" : body?.role === "ADMIN" ? "ADMIN" : "MEMBER";

  if (!groupId) {
    return NextResponse.json({ error: "groupId obrigatório" }, { status: 400 });
  }

  // garante user
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

  const origin = req.headers.get("origin") || "https://acerto.site";
  const link = `${origin}/invite/${invite.token}`;

  // ✅ Compat: devolve token/expiresAt no topo (frontend antigo usa data.token)
  return NextResponse.json({
    ok: true,
    token: invite.token,
    expiresAt: invite.expiresAt,
    link,
    invite,
  });
}
