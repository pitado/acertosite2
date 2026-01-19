// app/groups/services.ts
export type Group = {
  id: string;
  name: string;
  description?: string | null;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type InviteCreateResponse = {
  invite: {
    token: string;
    groupId: string;
    role: "MEMBER" | "ADMIN" | "OWNER";
    expiresAt?: string | null;
    usedAt?: string | null;
    createdAt?: string;
  };
  link: string;
};

export type ActivityItem = {
  id: string;
  message: string;
  createdAt: string;
  groupId: string;
};

function getEmailFromStorage(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("acerto_email") || "";
}

function authHeaders(): Record<string, string> {
  const email = getEmailFromStorage();
  // NUNCA retorne header com undefined (isso quebra o build do TS)
  if (!email) return {};
  return { "x-user-email": email };
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || "Erro na requisição");
  }
  return data as T;
}

export const Services = {
  async listGroups(): Promise<Group[]> {
    const res = await fetch(`/api/groups`, { headers: authHeaders() });
    const data = await handle<{ groups: Group[] }>(res);
    return data.groups || [];
  },

  async createGroup(name: string, description?: string | null): Promise<Group> {
    const res = await fetch(`/api/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name, description: description ?? null }),
    });
    const data = await handle<{ group: Group }>(res);
    return data.group;
  },

  async createInvite(
    groupId: string,
    role: "MEMBER" | "ADMIN"
  ): Promise<InviteCreateResponse> {
    const res = await fetch(`/api/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ groupId, role }),
    });
    return handle<InviteCreateResponse>(res);
  },

  async getInvite(token: string) {
    const res = await fetch(`/api/invites/${token}`, { headers: authHeaders() });
    return handle<{
      invite: {
        token: string;
        groupId: string;
        role: "MEMBER" | "ADMIN" | "OWNER";
        expiresAt?: string | null;
        usedAt?: string | null;
        group?: { id: string; name: string; description?: string | null };
        createdBy?: { email?: string | null };
      };
    }>(res);
  },

  async acceptInvite(token: string) {
    const res = await fetch(`/api/invites/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });
    return handle<{ ok: true; groupId: string }>(res);
  },

  async declineInvite(token: string) {
    const res = await fetch(`/api/invites/${token}/decline`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });
    return handle<{ ok: true }>(res);
  },

  async groupActivity(groupId: string): Promise<ActivityItem[]> {
    const res = await fetch(`/api/groups/${groupId}/activity`, { headers: authHeaders() });
    const data = await handle<{ items: ActivityItem[] }>(res);
    return data.items || [];
  },
};
