// app/groups/types.ts

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "OBSERVER";

export type Group = {
  id: string;
  name: string;
  description?: string | null;
  role?: Role; // role do usuário logado dentro do grupo
  ownerId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type Member = {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  role: Role;
};

export type InviteInfo = {
  token: string;
  groupId: string;
  role: Role;
  email?: string | null;
  expiresAt?: string | Date | null;
  usedAt?: string | Date | null;
  createdAt?: string | Date;

  // opcional (quando o backend retorna)
  link?: string;
  group?: {
    id: string;
    name: string;
  };
};

export type Expense = {
  id: string;
  groupId: string;

  title: string;
  amount: number;

  buyer: string; // quem pagou / quem comprou
  payer: string; // quem vai receber (ou dono)
  split: string;

  participants: any; // pode virar JSON tipado depois
  category: string;
  subcategory?: string | null;
  location?: string | null;
  date_iso?: string | null;

  pix_key?: string | null;
  proof_url?: string | null;

  created_at?: string | Date;

  // opcional (se você estiver marcando como pago no front)
  paid?: boolean;
};

export type ActivityItem = {
  id: string;
  groupId: string;
  message: string;
  created_at?: string | Date;
};

// ✅ Compat: alguns componentes importam LogEntry
export type LogEntry = ActivityItem;
