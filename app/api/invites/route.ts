import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

function randomToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(req: Request) {
  const email = getUserEmail(req);
  if (!email) {
    return NextResponse.json({ error: "Sem usuário (x-user-email)" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const groupId = String(body.groupId || "").trim();
  const roleRaw = String(body.role || "MEMBER").toUpperCase();
  const role = roleRaw === "ADMIN" ? "ADMIN" : "MEMBER";

  if (!groupId) {
    return NextResponse.json({ error: "groupId obrigatório" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

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
      expiresAt,
      createdById: user.id,
    },
    select: {
      token: true,
      groupId: true,
      role: true,
      expiresAt: true,
      createdAt: true,
      usedAt: true,
    },
  });

  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";

  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : req.headers.get("origin") || "https://acerto.site";

  const link = `${origin}/invite/${invite.token}`;

  return NextResponse.json({ invite, link });
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
