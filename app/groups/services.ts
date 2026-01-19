// app/groups/services.ts
import type { Group, InviteInfo, Member, Expense, ActivityItem, Role } from "./types";

function getEmailFallback(ownerEmail?: string): string {
  if (ownerEmail) return ownerEmail;
  if (typeof window === "undefined") return "";
  return localStorage.getItem("acerto_email") || "";
}

function authHeaders(ownerEmail?: string): Record<string, string> {
  const email = getEmailFallback(ownerEmail);
  const headers: Record<string, string> = {};
  if (email) headers["x-user-email"] = email;
  return headers;
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Erro HTTP ${res.status}`;
    throw new Error(String(msg));
  }
  return data as T;
}

export const Services = {
  // ============ GROUPS ============
  async listGroups(ownerEmail?: string): Promise<Group[]> {
    const res = await fetch(`/api/groups`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ groups: Group[] }>(res);
    return data.groups || [];
  },

  async createGroup(name: string, description?: string | null, ownerEmail?: string): Promise<Group> {
    const res = await fetch(`/api/groups`, {
      method: "POST",
      headers: { ...authHeaders(ownerEmail), "content-type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await handle<{ group: Group }>(res);
    return data.group;
  },

  // (opcional) detalhes do grupo — se existir sua rota
  async getGroup(groupId: string, ownerEmail?: string): Promise<Group> {
    const res = await fetch(`/api/groups/${groupId}`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ group: Group }>(res);
    return data.group;
  },

  // ============ INVITES ============
  async createInvite(
    groupId: string,
    role: Role = "MEMBER",
    ownerEmail?: string
  ): Promise<{ invite: InviteInfo; link: string }> {
    const res = await fetch(`/api/invites`, {
      method: "POST",
      headers: { ...authHeaders(ownerEmail), "content-type": "application/json" },
      body: JSON.stringify({ groupId, role }),
    });
    return handle<{ invite: InviteInfo; link: string }>(res);
  },

  async getInvite(token: string, ownerEmail?: string): Promise<InviteInfo> {
    const res = await fetch(`/api/invites/${token}`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ invite: InviteInfo }>(res);
    return data.invite;
  },

  async acceptInvite(token: string, ownerEmail?: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/invites/${token}/accept`, {
      method: "POST",
      headers: authHeaders(ownerEmail),
    });
    return handle<{ ok: true }>(res);
  },

  async declineInvite(token: string, ownerEmail?: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/invites/${token}/decline`, {
      method: "POST",
      headers: authHeaders(ownerEmail),
    });
    return handle<{ ok: true }>(res);
  },

  // ============ MEMBERS (opcional, se existir rota) ============
  async listMembers(groupId: string, ownerEmail?: string): Promise<Member[]> {
    const res = await fetch(`/api/groups/${groupId}/members`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ members: Member[] }>(res);
    return data.members || [];
  },

  // ============ EXPENSES ============
  async listExpenses(groupId: string, ownerEmail?: string): Promise<Expense[]> {
    const res = await fetch(`/api/groups/${groupId}/expenses`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ expenses: Expense[] }>(res);
    return data.expenses || [];
  },

  // nome "addExpense" (interno)
  async addExpense(groupId: string, expense: Partial<Expense>, ownerEmail?: string): Promise<Expense> {
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { ...authHeaders(ownerEmail), "content-type": "application/json" },
      body: JSON.stringify(expense),
    });
    const data = await handle<{ expense: Expense }>(res);
    return data.expense;
  },

  // ✅ alias para não quebrar o GroupModal (ele chama createExpense)
  async createExpense(groupId: string, expense: Partial<Expense>, ownerEmail?: string): Promise<Expense> {
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { ...authHeaders(ownerEmail), "content-type": "application/json" },
      body: JSON.stringify(expense),
    });
    const data = await handle<{ expense: Expense }>(res);
    return data.expense;
  },

  async removeExpense(expenseId: string, ownerEmail?: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: "DELETE",
      headers: authHeaders(ownerEmail),
    });
    return handle<{ ok: true }>(res);
  },

  // ✅ assinatura EXATA (expenseId, paid, by)
  async markPaid(expenseId: string, paid: boolean, by: string, ownerEmail?: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/expenses/${expenseId}/paid`, {
      method: "POST",
      headers: { ...authHeaders(ownerEmail), "content-type": "application/json" },
      body: JSON.stringify({ paid, by }),
    });
    return handle<{ ok: true }>(res);
  },

  // ✅ usado no ExpenseRow (upload de comprovante)
  async attachProof(expenseId: string, proofUrl: string, ownerEmail?: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/expenses/${expenseId}/proof`, {
      method: "POST",
      headers: { ...authHeaders(ownerEmail), "content-type": "application/json" },
      body: JSON.stringify({ proofUrl }),
    });
    return handle<{ ok: true }>(res);
  },

  // ============ ACTIVITY ============
  async listActivity(groupId: string, ownerEmail?: string): Promise<ActivityItem[]> {
    const res = await fetch(`/api/groups/${groupId}/activity`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ activity: ActivityItem[] }>(res);
    return data.activity || [];
  },
};
