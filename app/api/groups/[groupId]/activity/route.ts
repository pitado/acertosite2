import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Missing x-user-email" }, { status: 401 });

  const groupId = params.groupId;

  const member = await prisma.groupMember.findFirst({
    where: { groupId, user: { email } },
  });
  if (!member) return NextResponse.json({ error: "Você não está nesse grupo" }, { status: 403 });

  const activity = await prisma.logEntry.findMany({
    where: { groupId },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  return NextResponse.json({ activity });
}
