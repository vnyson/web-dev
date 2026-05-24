import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchPlayers,
  fetchStringing,
  fetchInventory,
  fetchHistory,
  createPlayer,
  createStringingJob,
  updateStringingJob,
  createInventoryItem,
  updateInventoryItem,
} from '../lib/api';

// Mock global fetch
global.fetch = vi.fn();

describe('API Client - Players', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch players successfully', async () => {
    const mockPlayers = [{ id: '1', name: 'John Doe' }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayers,
    });

    const result = await fetchPlayers();
    expect(result).toEqual(mockPlayers);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tennis-admin-api.vnyson.workers.dev/api/players'
    );
  });

  it('should throw error when fetch players fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchPlayers()).rejects.toThrow('Failed to fetch players');
  });

  it('should create a player successfully', async () => {
    const mockResponse = { success: true, id: '1' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createPlayer({ name: 'Jane Doe' });
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tennis-admin-api.vnyson.workers.dev/api/players',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Jane Doe' }),
      })
    );
  });

  it('should throw error when create player fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(createPlayer({ name: 'Jane Doe' })).rejects.toThrow('Failed to create player');
  });
});

describe('API Client - Stringing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch stringing jobs successfully', async () => {
    const mockJobs = [{ id: '1', player_name: 'John Doe' }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobs,
    });

    const result = await fetchStringing();
    expect(result).toEqual(mockJobs);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tennis-admin-api.vnyson.workers.dev/api/stringing'
    );
  });

  it('should throw error when fetch stringing fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchStringing()).rejects.toThrow('Failed to fetch stringing jobs');
  });

  it('should create a stringing job successfully', async () => {
    const mockResponse = { success: true, id: '1' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createStringingJob({ player_name: 'Jane Doe', racquet: 'Wilson Pro Staff' });
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tennis-admin-api.vnyson.workers.dev/api/stringing',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ player_name: 'Jane Doe', racquet: 'Wilson Pro Staff' }),
      })
    );
  });

  it('should throw error when create stringing job fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(createStringingJob({ player_name: 'Jane Doe' })).rejects.toThrow(
      'Failed to create stringing job'
    );
  });

  it('should update a stringing job successfully', async () => {
    const mockResponse = { success: true };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await updateStringingJob('1', { status: 'completed' });
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tennis-admin-api.vnyson.workers.dev/api/stringing/1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' }),
      })
    );
  });

  it('should throw error when update stringing job fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(updateStringingJob('1', { status: 'completed' })).rejects.toThrow(
      'Failed to update stringing job'
    );
  });
});

describe('API Client - Inventory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch inventory successfully', async () => {
    const mockInventory = [{ id: '1', name: 'Wilson NXT' }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInventory,
    });

    const result = await fetchInventory();
    expect(result).toEqual(mockInventory);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tennis-admin-api.vnyson.workers.dev/api/inventory'
    );
  });

  it('should throw error when fetch inventory fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchInventory()).rejects.toThrow('Failed to fetch inventory');
  });

  it('should create an inventory item successfully', async () => {
    const mockResponse = { success: true, id: '1' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createInventoryItem({ name: 'Babolat RPM', quantity: 10 });
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tennis-admin-api.vnyson.workers.dev/api/inventory',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Babolat RPM', quantity: 10 }),
      })
    );
  });

  it('should throw error when create inventory item fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(createInventoryItem({ name: 'Babolat RPM' })).rejects.toThrow(
      'Failed to create inventory item'
    );
  });

  it('should update an inventory item successfully', async () => {
    const mockResponse = { success: true };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await updateInventoryItem('1', { quantity: 5 });
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tennis-admin-api.vnyson.workers.dev/api/inventory/1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ quantity: 5 }),
      })
    );
  });

  it('should throw error when update inventory item fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(updateInventoryItem('1', { quantity: 5 })).rejects.toThrow(
      'Failed to update inventory item'
    );
  });
});

describe('API Client - History', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch history successfully', async () => {
    const mockHistory = [{ id: '1', player_name: 'John Doe' }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHistory,
    });

    const result = await fetchHistory();
    expect(result).toEqual(mockHistory);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tennis-admin-api.vnyson.workers.dev/api/history'
    );
  });

  it('should throw error when fetch history fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchHistory()).rejects.toThrow('Failed to fetch history');
  });
});
