import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchQueueStatus,
  verifyPlayer,
  loadPlayerByToken,
  updatePlayer,
  fetchInventory,
} from '../lib/api';

// Mock global fetch
global.fetch = vi.fn();

describe('fetchQueueStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches queue status successfully', async () => {
    const mockData = { count: 3 };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchQueueStatus();
    expect(result).toEqual(mockData);
  });

  it('throws error when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchQueueStatus()).rejects.toThrow('Failed to fetch queue status');
  });

  it('throws on network error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    await expect(fetchQueueStatus()).rejects.toThrow('Network error');
  });
});

describe('verifyPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies player with last 4 digits', async () => {
    const mockData = { token: 'abc-123', player: { name: 'Vinay' } };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await verifyPlayer({ name: 'Vinay', phone_last4: '3062' });
    expect(result).toEqual(mockData);
  });

  it('returns collision response', async () => {
    const mockData = { multiple: true };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await verifyPlayer({ name: 'Vinay', phone_last4: '3062' });
    expect(result).toEqual(mockData);
    expect(result.multiple).toBe(true);
  });

  it('returns error when player not found', async () => {
    const mockData = { error: 'Player not found' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => mockData,
    });

    const result = await verifyPlayer({ name: 'Unknown', phone_last4: '0000' });
    expect(result).toBeDefined();
  });
});

describe('loadPlayerByToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads player data with valid token', async () => {
    const mockData = {
      player: { id: '1', name: 'Vinay' },
      jobs: [],
      rackets: [],
      history: [],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await loadPlayerByToken('valid-token');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('player-by-token?token='));
  });

  it('throws when token is invalid', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(loadPlayerByToken('invalid-token')).rejects.toThrow(
      'Invalid token or network error',
    );
  });
});

describe('updatePlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates player profile', async () => {
    const mockData = { success: true };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await updatePlayer('player-1', 'token-1', {
      name: 'Vinay',
      email: 'vinay@test.com',
    });
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api/players/player-1'),
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('throws on failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(updatePlayer('player-1', 'token-1', { name: 'Vinay' })).rejects.toThrow(
      'Failed to update profile',
    );
  });
});

describe('fetchInventory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches inventory successfully', async () => {
    const mockData = [{ id: '1', name: 'String', category: 'string' }];
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchInventory();
    expect(result).toEqual(mockData);
  });

  it('throws when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchInventory()).rejects.toThrow('Failed to fetch inventory');
  });
});
