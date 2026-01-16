import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

async function assertMembership(groupId: string, email: string) {
  const member = await prisma.groupMember.findFirst({
    where: { groupId, user: { email } },
    include: { user: true },
  });
  return member;
}

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Missing x-user-email" }, { status: 401 });

  const groupId = params.groupId;

  const me = await assertMembership(groupId, email);
  if (!me) return NextResponse.json({ error: "Você não está nesse grupo" }, { status: 403 });

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    members: members.map((m) => ({
      email: m.user.email,
      role: m.role,
    })),
  });
}
