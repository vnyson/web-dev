// Use localhost API when running locally
let _apiUrl: string | null = null;

export function getApiUrl(): string {
  if (_apiUrl) return _apiUrl;
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    _apiUrl = 'http://127.0.0.1:8787';
  } else {
    _apiUrl = 'https://tennis-admin-api.vnyson.workers.dev';
  }
  return _apiUrl;
}

// Kept for backward compatibility with existing imports (e.g. jobs.astro, players.astro)
// These pages use API_URL in client-side <script> blocks where window is available
export const API_URL =
  typeof window !== 'undefined'
    ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://127.0.0.1:8787'
      : 'https://tennis-admin-api.vnyson.workers.dev'
    : 'https://tennis-admin-api.vnyson.workers.dev';

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') {
    console.log('localStorage is undefined');
    return null;
  }
  const token = localStorage.getItem('admin_token');
  console.log('localStorage.getItem("admin_token") returned:', token ? 'token exists' : 'null');
  return token;
}

// Helper function to set auth token
function setAuthToken(token: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('admin_token', token);
  }
}

// Helper function to clear auth token
function clearAuthToken(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('admin_token');
  }
}

// Helper function to get auth headers
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Authorization header added');
  } else {
    console.log('No token found, Authorization header not added');
  }
  return headers;
}

// Export auth helpers for use in components
export { getAuthToken, setAuthToken, clearAuthToken };

export async function fetchPlayers() {
  const response = await fetch(`${getApiUrl()}/api/players`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch players');
  return response.json();
}

export async function fetchStringing() {
  const response = await fetch(`${getApiUrl()}/api/stringing`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch stringing jobs');
  return response.json();
}

export async function fetchInventory() {
  const response = await fetch(`${getApiUrl()}/api/inventory`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch inventory');
  return response.json();
}

export async function fetchHistory() {
  const response = await fetch(`${getApiUrl()}/api/history`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

export async function createPlayer(data: any) {
  const response = await fetch(`${getApiUrl()}/api/players`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create player');
  return response.json();
}

export async function createStringingJob(data: any) {
  const response = await fetch(`${getApiUrl()}/api/stringing`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create stringing job');
  return response.json();
}

export async function updateStringingJob(id: string, data: any) {
  const response = await fetch(`${getApiUrl()}/api/stringing/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update stringing job');
  return response.json();
}

export async function createInventoryItem(data: any) {
  const response = await fetch(`${getApiUrl()}/api/inventory`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create inventory item');
  return response.json();
}

export async function updateInventoryItem(id: string, data: any) {
  const response = await fetch(`${getApiUrl()}/api/inventory/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update inventory item');
  return response.json();
}

export async function deleteInventoryItem(id: string) {
  const response = await fetch(`${getApiUrl()}/api/inventory/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete inventory item');
  return response.json();
}

export async function fetchRackets(playerId?: string) {
  const url = playerId
    ? `${getApiUrl()}/api/rackets?player_id=${playerId}`
    : `${getApiUrl()}/api/rackets`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch rackets');
  return response.json();
}

export async function createRacket(data: any) {
  const response = await fetch(`${getApiUrl()}/api/rackets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create racket');
  return response.json();
}

export async function updateRacket(id: string, data: any) {
  const response = await fetch(`${getApiUrl()}/api/rackets/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update racket');
  return response.json();
}

export async function deleteRacket(id: string) {
  const response = await fetch(`${getApiUrl()}/api/rackets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete racket');
  return response.json();
}

export async function regeneratePlayerToken(playerId: string) {
  const response = await fetch(`${getApiUrl()}/api/regenerate-token`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ player_id: playerId }),
  });
  if (!response.ok) throw new Error('Failed to regenerate token');
  return response.json();
}

// Demo sessions
export async function fetchDemoSessions() {
  const response = await fetch(`${getApiUrl()}/api/demo-sessions`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch demo sessions');
  return response.json();
}

export async function createDemoSession(data: any) {
  const response = await fetch(`${getApiUrl()}/api/demo-sessions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create demo session');
  return response.json();
}

export async function returnDemoSession(id: string, notes?: string) {
  const response = await fetch(`${getApiUrl()}/api/demo-sessions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ returned_at: new Date().toISOString(), notes }),
  });
  if (!response.ok) throw new Error('Failed to return demo session');
  return response.json();
}

export async function deleteDemoSession(id: string) {
  const response = await fetch(`${getApiUrl()}/api/demo-sessions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete demo session');
  return response.json();
}

// Player racket setups (stock vs customized)
export async function fetchPlayerRacketSetups(playerId?: string) {
  const url = playerId
    ? `${getApiUrl()}/api/player-racket-setups?player_id=${playerId}`
    : `${getApiUrl()}/api/player-racket-setups`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch player racket setups');
  return response.json();
}

export async function fetchPlayerRacketSetupForRacket(racketId: string) {
  const response = await fetch(`${getApiUrl()}/api/player-racket-setups?racket_id=${racketId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch racket setup');
  return response.json();
}

export async function savePlayerRacketSetup(data: any) {
  const response = await fetch(`${getApiUrl()}/api/player-racket-setups`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to save racket setup');
  return response.json();
}

export async function deletePlayerRacketSetup(id: string) {
  const response = await fetch(`${getApiUrl()}/api/player-racket-setups/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete racket setup');
  return response.json();
}
