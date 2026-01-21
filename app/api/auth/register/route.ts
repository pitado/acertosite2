import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normEmail(v: unknown) {
  return String(v || "").trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = normEmail(body?.email);
    const password = String(body?.password || "");
    const name = String(body?.name || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha muito curta (mínimo 6 caracteres)." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // se já existe usuário, não cria
      return NextResponse.json(
        { error: "Esse e-mail já está cadastrado. Faça login." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro ao cadastrar." },
      { status: 500 }
    );
  }
}
