const API_URL = 'https://tennis-admin-api.vnyson.workers.dev';

export async function fetchPlayers() {
  const response = await fetch(`${API_URL}/api/players`);
  if (!response.ok) throw new Error('Failed to fetch players');
  return response.json();
}

export async function fetchStringing() {
  const response = await fetch(`${API_URL}/api/stringing`);
  if (!response.ok) throw new Error('Failed to fetch stringing jobs');
  return response.json();
}

export async function fetchInventory() {
  const response = await fetch(`${API_URL}/api/inventory`);
  if (!response.ok) throw new Error('Failed to fetch inventory');
  return response.json();
}

export async function fetchHistory() {
  const response = await fetch(`${API_URL}/api/history`);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

export async function createPlayer(data: any) {
  const response = await fetch(`${API_URL}/api/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create player');
  return response.json();
}

export async function createStringingJob(data: any) {
  const response = await fetch(`${API_URL}/api/stringing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create stringing job');
  return response.json();
}

export async function updateStringingJob(id: string, data: any) {
  const response = await fetch(`${API_URL}/api/stringing/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update stringing job');
  return response.json();
}

export async function createInventoryItem(data: any) {
  const response = await fetch(`${API_URL}/api/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create inventory item');
  return response.json();
}

export async function updateInventoryItem(id: string, data: any) {
  const response = await fetch(`${API_URL}/api/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update inventory item');
  return response.json();
}

export async function fetchRackets(playerId?: string) {
  const url = playerId ? `${API_URL}/api/rackets?player_id=${playerId}` : `${API_URL}/api/rackets`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch rackets');
  return response.json();
}

export async function createRacket(data: any) {
  const response = await fetch(`${API_URL}/api/rackets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create racket');
  return response.json();
}

export async function deleteRacket(id: string) {
  const response = await fetch(`${API_URL}/api/rackets/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete racket');
  return response.json();
}
