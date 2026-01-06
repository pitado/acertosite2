export type SplitMode = "equal_all" | "equal_selected";

export type Group = {
  id: string;
  name: string;
  description?: string;
  owner_email: string;
  role_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type Invite = {
  token: string;
  created_at?: string;
  expires_at?: string | null;
};

export type Member = {
  email: string;
  created_at?: string | null;
};

export type LogEntry = {
  id: string;
  message: string;
  created_at: string;
};

export type Expense = {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  buyer: string;
  payer: string;
  split: SplitMode;
  participants?: string[] | null;
  category?: string | null;
  subcategory?: string | null;
  pix_key?: string | null;
  location?: string | null;
  date_iso: string;
  proof_url?: string | null;
  paid: boolean;
  created_at: string;
};
