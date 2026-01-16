import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pega o user via headers simples (por enquanto)
// Depois a gente liga isso com Supabase session de verdade.
function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

export async function GET(req: Request) {
  const email = getUserEmail(req);
  if (!email) {
    return NextResponse.json({ error: "Sem usuário (x-user-email)" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { group: true },
      },
    },
  });

  const groups =
    user?.memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      role: m.role,
      ownerId: m.group.ownerId,
      createdAt: m.group.createdAt,
      updatedAt: m.group.updatedAt,
    })) ?? [];

  return NextResponse.json({ groups });
}

export async function POST(req: Request) {
  const email = getUserEmail(req);
  if (!email) {
    return NextResponse.json({ error: "Sem usuário (x-user-email)" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const description = body?.description ? String(body.description) : null;

  if (!name) {
    return NextResponse.json({ error: "Nome do grupo é obrigatório" }, { status: 400 });
  }

  // garante user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const group = await prisma.group.create({
    data: {
      name,
      description,
      ownerId: user.id,
      members: {
        create: [{ userId: user.id, role: "OWNER" }],
      },
    },
  });

  return NextResponse.json({ group }, { status: 201 });
}
