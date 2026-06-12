const API_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8787'
    : 'https://tennis-admin-api.vnyson.workers.dev';

export interface QueueStatus {
  count: number;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  string_pref: string;
  tension: string;
  tension_cross: string;
  grip: string;
  notes: string;
  access_token: string;
  [key: string]: unknown;
}

export interface Racket {
  id: string;
  brand: string;
  model: string;
  year?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface StringingJob {
  id: string;
  player_id: string;
  job_type: string;
  racquet: string;
  string_mains: string;
  string_crosses?: string;
  tension_mains: string;
  tension_crosses?: string;
  tension_unit: string;
  status: string;
  queue_position?: number;
  created_at: string;
  [key: string]: unknown;
}

export interface HistoryRecord {
  id: string;
  player_id: string;
  job_type: string;
  racquet: string;
  current_weight?: string;
  current_balance?: string;
  target_weight?: string;
  target_balance?: string;
  mass_added?: string;
  mass_location?: string;
  sw_delta?: string;
  sw_result?: string;
  notes?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  price?: string;
  string_type?: string;
  string_characteristics?: string;
  [key: string]: unknown;
}

export interface PlayerVerifyResponse {
  token?: string;
  player?: Player;
  jobs?: StringingJob[];
  rackets?: Racket[];
  history?: HistoryRecord[];
  multiple?: boolean;
  error?: string;
}

export interface PlayerByTokenResponse {
  player: Player;
  jobs: StringingJob[];
  rackets: Racket[];
  history: HistoryRecord[];
}

export async function fetchQueueStatus(): Promise<QueueStatus> {
  const response = await fetch(`${API_URL}/api/queue-status`);
  if (!response.ok) throw new Error('Failed to fetch queue status');
  return response.json();
}

export async function verifyPlayer(payload: {
  name: string;
  phone_last4?: string;
  phone?: string;
}): Promise<PlayerVerifyResponse> {
  const response = await fetch(`${API_URL}/api/player-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function loadPlayerByToken(token: string): Promise<PlayerByTokenResponse> {
  const response = await fetch(`${API_URL}/api/player-by-token?token=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('Invalid token or network error');
  return response.json();
}

export async function updatePlayer(
  playerId: string,
  token: string,
  payload: Partial<Player>,
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_URL}/api/players/${playerId}?token=${encodeURIComponent(token)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const response = await fetch(`${API_URL}/api/inventory`);
  if (!response.ok) throw new Error('Failed to fetch inventory');
  return response.json();
}

export interface DemoRacket {
  id: string;
  brand: string;
  model: string;
  year?: number;
  head_size?: string;
  length?: string;
  static_weight?: string;
  swing_weight?: string;
  balance?: string;
  stiffness?: string;
  string_pattern?: string;
  beam_width?: string;
  grip_size?: string;
  color?: string;
  image_url?: string;
  notes?: string;
  demo_condition?: string;
  active_demos?: number;
  [key: string]: unknown;
}

export async function fetchDemoRackets(): Promise<DemoRacket[]> {
  const response = await fetch(`${API_URL}/api/rackets?demo=true`);
  if (!response.ok) throw new Error('Failed to fetch demo rackets');
  return response.json();
}
