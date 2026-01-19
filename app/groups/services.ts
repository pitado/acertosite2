// app/groups/services.ts
import type { Group, InviteInfo, Member, Expense, ActivityItem } from "./types";

function authHeaders(ownerEmail?: string): Record<string, string> {
  // sempre retorna Record<string,string> (nunca undefined) -> evita erro do fetch
  if (!ownerEmail) return {};
  return { "x-user-email": ownerEmail };
}

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `Erro HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export const Services = {
  // =============== GROUPS ===============
  async listGroups(ownerEmail?: string): Promise<Group[]> {
    const res = await fetch(`/api/groups`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ groups: Group[] }>(res);
    return data.groups;
  },

  async createGroup(
    name: string,
    description?: string | null,
    ownerEmail?: string
  ): Promise<Group> {
    const res = await fetch(`/api/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(ownerEmail) },
      body: JSON.stringify({ name, description }),
    });
    const data = await handle<{ group: Group }>(res);
    return data.group;
  },

  // =============== INVITES ===============
  async createInvite(
    groupId: string,
    role: "ADMIN" | "MEMBER",
    ownerEmail?: string
  ): Promise<{ invite: any; link: string }> {
    const res = await fetch(`/api/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(ownerEmail) },
      body: JSON.stringify({ groupId, role }),
    });
    return await handle(res);
  },

  async getInvite(token: string, ownerEmail?: string): Promise<InviteInfo> {
    const res = await fetch(`/api/invites/${token}`, { headers: authHeaders(ownerEmail) });
    return await handle(res);
  },

  async acceptInvite(token: string, ownerEmail?: string): Promise<any> {
    const res = await fetch(`/api/invites/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(ownerEmail) },
    });
    return await handle(res);
  },

  async declineInvite(token: string, ownerEmail?: string): Promise<any> {
    const res = await fetch(`/api/invites/${token}/decline`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(ownerEmail) },
    });
    return await handle(res);
  },

  // =============== MEMBERS ===============
  async listMembers(groupId: string, ownerEmail?: string): Promise<Member[]> {
    const res = await fetch(`/api/groups/${groupId}/members`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ members: Member[] }>(res);
    return data.members;
  },

  // =============== EXPENSES ===============
  async listExpenses(groupId: string, ownerEmail?: string): Promise<Expense[]> {
    const res = await fetch(`/api/groups/${groupId}/expenses`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ expenses: Expense[] }>(res);
    return data.expenses;
  },

  async createExpense(
    groupId: string,
    payload: Partial<Expense>,
    ownerEmail?: string
  ): Promise<Expense> {
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(ownerEmail) },
      body: JSON.stringify(payload),
    });
    const data = await handle<{ expense: Expense }>(res);
    return data.expense;
  },

  async removeExpense(expenseId: string, ownerEmail?: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: "DELETE",
      headers: authHeaders(ownerEmail),
    });
    return await handle(res);
  },

  // ✅ CORRIGIDO: aceita os dois formatos:
  // A) markPaid(expenseId, true, "owner")
  // B) markPaid(expenseId, "owner@email.com", true)
  async markPaid(
    expenseId: string,
    arg2: boolean | string,
    arg3: string | boolean,
    ownerEmail?: string
  ) {
    let paidByEmail: string;
    let paid: boolean;

    if (typeof arg2 === "boolean" && typeof arg3 === "string") {
      // formato A
      paid = arg2;
      paidByEmail = arg3;
    } else if (typeof arg2 === "string" && typeof arg3 === "boolean") {
      // formato B
      paidByEmail = arg2;
      paid = arg3;
    } else if (typeof arg2 === "string" && typeof arg3 === "string") {
      // fallback: arg3 vira "paidBy", paid default true
      paidByEmail = arg2;
      paid = true;
    } else {
      // fallback seguro
      paidByEmail = String(arg3);
      paid = Boolean(arg2);
    }

    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(ownerEmail) },
      body: JSON.stringify({ paidByEmail, paid }),
    });

    return await handle(res);
  },

  async attachProof(expenseId: string, proofUrl: string, ownerEmail?: string) {
    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(ownerEmail) },
      body: JSON.stringify({ proof_url: proofUrl }),
    });
    return await handle(res);
  },

  // =============== ACTIVITY ===============
  async listActivity(groupId: string, ownerEmail?: string): Promise<ActivityItem[]> {
    const res = await fetch(`/api/groups/${groupId}/activity`, { headers: authHeaders(ownerEmail) });
    const data = await handle<{ activity: ActivityItem[] }>(res);
    return data.activity;
  },
};
