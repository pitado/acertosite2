import type { Expense, Group, Invite, LogEntry } from "./types";

function getEmail() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("acerto_email") || "";
}

function authHeaders() {
  const email = getEmail();
  return email ? { "x-user-email": email } : {};
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Erro");
  return data as T;
}

export const Services = {
  async listGroups(ownerEmail?: string): Promise<Group[]> {
    // compat (mas preferir header)
    const res = await fetch(`/api/groups`, { headers: authHeaders() });
    const data = await handle<{ groups: Group[] }>(res);
    return data.groups;
  },

  async createGroup(name: string, ownerEmail?: string): Promise<Group> {
    const res = await fetch(`/api/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name }),
    });
    const data = await handle<{ group: Group }>(res);
    return data.group;
  },

  async listExpenses(groupId: string): Promise<Expense[]> {
    const res = await fetch(`/api/groups/${groupId}/expenses`, { headers: authHeaders() });
    const data = await handle<{ expenses: Expense[] }>(res);
    return data.expenses;
  },

  async createExpense(groupId: string, expense: Omit<Expense, "id" | "group_id" | "created_at">) {
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(expense),
    });
    const data = await handle<{ expense: Expense }>(res);
    return data.expense;
  },

  async markPaid(expenseId: string, paid: boolean, by: string) {
    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ paid, by }),
    });
    const data = await handle<{ expense: Expense }>(res);
    return data.expense;
  },

  async attachProof(expenseId: string, proofUrl: string) {
    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ proofUrl }),
    });
    const data = await handle<{ expense: Expense }>(res);
    return data.expense;
  },

  async removeExpense(expenseId: string) {
    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await handle<{ ok: boolean }>(res);
    return data.ok;
  },

  async listMembers(groupId: string): Promise<{ email: string; role: string }[]> {
    const res = await fetch(`/api/groups/${groupId}/members`, { headers: authHeaders() });
    const data = await handle<{ members: { email: string; role: string }[] }>(res);
    return data.members;
  },

  async listActivity(groupId: string): Promise<LogEntry[]> {
    const res = await fetch(`/api/groups/${groupId}/activity`, { headers: authHeaders() });
    const data = await handle<{ activity: LogEntry[] }>(res);
    return data.activity;
  },
};
