const TOKEN_KEY = 'zk_donation_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  idempotencyKey?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth) {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.error === 'string' ? data.error : 'Request failed';
    const err = new Error(message) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  return data as T;
}

export type User = {
  id: string;
  email: string;
  role: string;
};

export type Campaign = {
  id: string;
  title: string;
  description: string;
  target_amount: string;
  max_donation: string;
  status: string;
  image_url?: string;
  category?: string;
  location?: string;
  created_by: string;
  created_at: string;
};

export type Donation = {
  id: string;
  campaign_id: string;
  commitment: string;
  encrypted_amount: string;
  amount?: string;
  tx_hash: string;
  status: string;
  created_at: string;
};

export type DayDonationStat = {
  date: string;
  count: number;
};

export type ZKProof = {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
};

export type AggregateSummary = {
  encrypted_total: string;
  donation_count: number;
  decrypted_total?: string;
};
