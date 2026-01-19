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

  buyer: string;
  payer: string;

  split: string;
  participants: any;

  category: string;
  subcategory?: string | null;
  location?: string | null;
  date_iso?: string | null;

  pix_key?: string | null;
  proof_url?: string | null;

  created_at?: string | Date;

  paid?: boolean;
};

export type ActivityItem = {
  id: string;
  groupId: string;
  message: string;
  created_at?: string | Date;
};

// ✅ Compat: alguns componentes usam LogEntry
export type LogEntry = ActivityItem;

// ✅ também exporto ActivityItem como ActivityLogItem caso apareça em outro lugar
export type ActivityLogItem = ActivityItem;
