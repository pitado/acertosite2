export type Group = {
  id: string;
  name: string;
  description?: string | null;
};

export type InviteResponse = {
  link: string;
  invite: { token: string; role: string; groupId: string };
};

export type ActivityItem = {
  id: string;
  groupId: string;
  message: string;
  created_at: string;
};

function getEmailFromLocalStorage() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("acerto_email") || "";
}

function authHeaders(): Record<string, string> {
  const email = getEmailFromLocalStorage();
  // sempre retorna Record<string,string> (sem undefined) => não dá erro no fetch
  return email ? { "x-user-email": email } : { "x-user-email": "" };
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const Services = {
  async listGroups(): Promise<Group[]> {
    const res = await fetch(`/api/groups`, { headers: authHeaders() });
    const data = await handle<{ groups: Group[] }>(res);
    return data.groups;
  },

  async createGroup(name: string, description?: string): Promise<Group> {
    const res = await fetch(`/api/groups`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await handle<{ group: Group }>(res);
    return data.group;
  },

  async createInvite(groupId: string, role: "MEMBER" | "ADMIN"): Promise<InviteResponse> {
    const res = await fetch(`/api/invites`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, role }),
    });
    return handle<InviteResponse>(res);
  },

  async getDashboardActivity(): Promise<ActivityItem[]> {
    const res = await fetch(`/api/activity`, { headers: authHeaders() });
    const data = await handle<{ activity: ActivityItem[] }>(res);
    return data.activity;
  },

  async getGroupActivity(groupId: string): Promise<ActivityItem[]> {
    const res = await fetch(`/api/groups/${groupId}/activity`, { headers: authHeaders() });
    const data = await handle<{ activity: ActivityItem[] }>(res);
    return data.activity;
  },
};
