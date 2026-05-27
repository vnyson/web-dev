const API_URL = 'https://tennis-admin-api.vnyson.workers.dev';

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('admin_token');
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
function getAuthHeaders(): HeadersInit {
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
  const response = await fetch(`${API_URL}/api/players`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch players');
  return response.json();
}

export async function fetchStringing() {
  const response = await fetch(`${API_URL}/api/stringing`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch stringing jobs');
  return response.json();
}

export async function fetchInventory() {
  const response = await fetch(`${API_URL}/api/inventory`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch inventory');
  return response.json();
}

export async function fetchHistory() {
  const response = await fetch(`${API_URL}/api/history`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

export async function createPlayer(data: any) {
  const response = await fetch(`${API_URL}/api/players`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create player');
  return response.json();
}

export async function createStringingJob(data: any) {
  const response = await fetch(`${API_URL}/api/stringing`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create stringing job');
  return response.json();
}

export async function updateStringingJob(id: string, data: any) {
  const response = await fetch(`${API_URL}/api/stringing/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update stringing job');
  return response.json();
}

export async function createInventoryItem(data: any) {
  const response = await fetch(`${API_URL}/api/inventory`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create inventory item');
  return response.json();
}

export async function updateInventoryItem(id: string, data: any) {
  const response = await fetch(`${API_URL}/api/inventory/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update inventory item');
  return response.json();
}

export async function fetchRackets(playerId?: string) {
  const url = playerId ? `${API_URL}/api/rackets?player_id=${playerId}` : `${API_URL}/api/rackets`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch rackets');
  return response.json();
}

export async function createRacket(data: any) {
  const response = await fetch(`${API_URL}/api/rackets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create racket');
  return response.json();
}

export async function deleteRacket(id: string) {
  const response = await fetch(`${API_URL}/api/rackets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete racket');
  return response.json();
}

export async function regeneratePlayerToken(playerId: string) {
  const response = await fetch(`${API_URL}/api/regenerate-token`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ player_id: playerId }),
  });
  if (!response.ok) throw new Error('Failed to regenerate token');
  return response.json();
}
