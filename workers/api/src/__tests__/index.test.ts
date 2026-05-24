import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlePlayers, handleStringing, handleInventory, handleHistory } from '../index';

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: vi.fn(() => 'test-uuid-123'),
} as any;

// Mock D1 database
const mockDB = {
  prepare: vi.fn((sql: string) => ({
    bind: vi.fn((...args: any[]) => ({
      first: vi.fn(() => Promise.resolve(null)),
      all: vi.fn(() => Promise.resolve({ results: [] })),
      run: vi.fn(() => Promise.resolve({ success: true })),
    })),
  })),
};

const mockEnv = { DB: mockDB };
const mockCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

describe('API - Players', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all players', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        all: vi.fn(() => Promise.resolve({ results: [{ id: '1', name: 'John Doe' }] })),
      })),
    });

    const request = new Request('https://example.com/api/players', { method: 'GET' });
    const response = await handlePlayers(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([{ id: '1', name: 'John Doe' }]);
  });

  it('should create a new player', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/players', {
      method: 'POST',
      body: JSON.stringify({ name: 'Jane Doe' }),
    });
    const response = await handlePlayers(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it('should update a player', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/players/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Name' }),
    });
    const response = await handlePlayers(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it('should delete a player', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/players/1', { method: 'DELETE' });
    const response = await handlePlayers(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });
});

describe('API - Stringing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all stringing jobs', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        all: vi.fn(() => Promise.resolve({ results: [{ id: '1', player_name: 'John Doe' }] })),
      })),
    });

    const request = new Request('https://example.com/api/stringing', { method: 'GET' });
    const response = await handleStringing(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([{ id: '1', player_name: 'John Doe' }]);
  });

  it('should create a new stringing job', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/stringing', {
      method: 'POST',
      body: JSON.stringify({ player_name: 'Jane Doe', racquet: 'Wilson Pro Staff' }),
    });
    const response = await handleStringing(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it('should update a stringing job', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/stringing/1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
    });
    const response = await handleStringing(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it('should delete a stringing job', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/stringing/1', { method: 'DELETE' });
    const response = await handleStringing(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });
});

describe('API - Inventory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all inventory items', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        all: vi.fn(() => Promise.resolve({ results: [{ id: '1', name: 'Wilson NXT' }] })),
      })),
    });

    const request = new Request('https://example.com/api/inventory', { method: 'GET' });
    const response = await handleInventory(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([{ id: '1', name: 'Wilson NXT' }]);
  });

  it('should create a new inventory item', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/inventory', {
      method: 'POST',
      body: JSON.stringify({ name: 'Babolat RPM', quantity: 10 }),
    });
    const response = await handleInventory(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it('should update an inventory item', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/inventory/1', {
      method: 'PUT',
      body: JSON.stringify({ quantity: 5 }),
    });
    const response = await handleInventory(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it('should delete an inventory item', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/inventory/1', { method: 'DELETE' });
    const response = await handleInventory(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });
});

describe('API - History', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all history records', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        all: vi.fn(() => Promise.resolve({ results: [{ id: '1', player_name: 'John Doe' }] })),
      })),
    });

    const request = new Request('https://example.com/api/history', { method: 'GET' });
    const response = await handleHistory(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([{ id: '1', player_name: 'John Doe' }]);
  });

  it('should create a new history record', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/history', {
      method: 'POST',
      body: JSON.stringify({ player_name: 'Jane Doe', racquet: 'Wilson Pro Staff' }),
    });
    const response = await handleHistory(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it('should delete a history record', async () => {
    mockDB.prepare.mockReturnValue({
      bind: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve({ success: true })),
      })),
    });

    const request = new Request('https://example.com/api/history/1', { method: 'DELETE' });
    const response = await handleHistory(request, mockEnv as any, mockCorsHeaders);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });
});
