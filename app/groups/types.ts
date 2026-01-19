// app/groups/types.ts

// Roles do sistema (front)
export type Role = "OWNER" | "ADMIN" | "MEMBER" | "OBSERVER";

// ✅ SplitMode usado no ExpenseModal
export type SplitMode = "equal_all" | "equal_selected";

export type Group = {
  id: string;
  name: string;
  description?: string | null;

  // role do usuário logado dentro do grupo (quando o backend retorna)
  role?: Role;
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

  // opcionais (quando o backend retorna)
  link?: string;
  group?: {
    id: string;
    name: string;
    description?: string | null;
  };
  createdBy?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
};

export type Expense = {
  id: string;
  groupId: string;

  title: string;
  amount: number;

  buyer: string; // quem pagou / comprou
  payer: string; // quem vai receber (ou dono)

  // ✅ alinhado com o modal
  split: SplitMode;

  participants: any; // JSON (pode tipar depois)

  category: string;
  subcategory?: string | null;
  location?: string | null;
  date_iso?: string | null;

  pix_key?: string | null;
  proof_url?: string | null;

  // ✅ não opcional (evita erro de Date(undefined))
  created_at: string | Date;

  // opcional (se marcar como pago no front)
  paid?: boolean;
};

export type ActivityItem = {
  id: string;
  groupId: string;
  message: string;

  // ✅ não opcional (evita erro de Date(undefined))
  created_at: string | Date;
};

// ✅ Compat: alguns componentes importam LogEntry
export type LogEntry = ActivityItem;
