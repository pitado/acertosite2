import type { Expense, Group, Invite } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const buildUrl = (path: string) => `${API_BASE}${path}`;

export const Services = {
  async listGroups(ownerEmail: string, q = "") {
    const r = await fetch(
      buildUrl(
        `/groups?ownerEmail=${encodeURIComponent(ownerEmail)}&q=${encodeURIComponent(q)}`
      )
    );
    return r.ok ? ((await r.json()) as Group[]) : [];
  },
  async createGroup(
    ownerEmail: string,
    payload: { name: string; description?: string; roleDateISO?: string; emails: string[] }
  ) {
    const r = await fetch(buildUrl("/groups"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerEmail, ...payload }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao criar");
    return (await r.json()) as { id: string };
  },
  async updateGroup(
    id: string,
    payload: { name?: string; description?: string; roleDateISO?: string; emails?: string[] }
  ) {
    const r = await fetch(buildUrl(`/groups/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao atualizar");
  },
  async deleteGroup(id: string) {
    const r = await fetch(buildUrl(`/groups/${id}`), { method: "DELETE" });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao excluir");
  },
  async listInvites(groupId: string) {
    const r = await fetch(buildUrl(`/groups/${groupId}/invites`));
    return r.ok ? ((await r.json()) as Invite[]) : [];
  },
  async createInvite(groupId: string) {
    const r = await fetch(buildUrl(`/groups/${groupId}/invites`), { method: "POST" });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao convidar");
    return (await r.json()) as { token: string };
  },
  async listExpenses(groupId: string) {
    const r = await fetch(buildUrl(`/expenses/${groupId}`));
    return r.ok ? ((await r.json()) as Expense[]) : [];
  },
  async createExpense(groupId: string, data: Omit<Expense, "id" | "group_id" | "created_at">) {
    const r = await fetch(buildUrl(`/expenses/${groupId}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Falha ao salvar despesa");
    return (await r.json()) as Expense;
  },
  async removeExpense(id: string) {
    await fetch(buildUrl(`/expenses/${id}`), { method: "DELETE" });
  },
  async markPaid(id: string, by: string) {
    await fetch(buildUrl(`/expenses/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: true, by }),
    });
  },
  async attachProof(id: string, dataUrl: string, by: string) {
    await fetch(buildUrl(`/expenses/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proofUrl: dataUrl, paid: true, by }),
    });
  },
};
