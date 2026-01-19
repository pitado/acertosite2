import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserEmail(req: Request) {
  return req.headers.get("x-user-email") || "";
}

export async function GET(req: Request) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Missing x-user-email" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: true },
  });

  const groupIds = user?.memberships.map((m) => m.groupId) ?? [];
  if (!groupIds.length) return NextResponse.json({ activity: [] });

  const activity = await prisma.logEntry.findMany({
    where: { groupId: { in: groupIds } },
    orderBy: { created_at: "desc" },
    take: 30,
  });

  return NextResponse.json({ activity });
}
