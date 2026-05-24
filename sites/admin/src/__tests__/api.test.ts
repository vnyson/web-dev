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

  it('should create a stringing job with in_queue status by default', async () => {
    const mockResponse = { success: true, id: '1' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createStringingJob({ player_name: 'Jane Doe', racquet: 'Wilson Pro Staff' });
    expect(result).toEqual(mockResponse);
    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.status).toBe('in_queue');
  });

  it('should create a stringing job with rush priority', async () => {
    const mockResponse = { success: true, id: '1' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createStringingJob({ player_name: 'Jane Doe', racquet: 'Wilson Pro Staff', priority: 'rush' });
    expect(result).toEqual(mockResponse);
    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.priority).toBe('rush');
  });

  it('should create a stringing job with player_id', async () => {
    const mockResponse = { success: true, id: '1' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createStringingJob({ player_id: 'player-123', player_name: 'Jane Doe', racquet: 'Wilson Pro Staff' });
    expect(result).toEqual(mockResponse);
    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.player_id).toBe('player-123');
  });
});

describe('Queue Ordering Logic', () => {
  it('should order rush jobs before normal jobs', () => {
    const jobs = [
      { id: '1', status: 'in_queue', priority: 'normal', created_at: '2026-05-24T10:00:00Z' },
      { id: '2', status: 'in_queue', priority: 'rush', created_at: '2026-05-24T11:00:00Z' },
      { id: '3', status: 'in_queue', priority: 'normal', created_at: '2026-05-24T09:00:00Z' },
    ];

    const sorted = jobs.sort((a, b) => {
      if (a.priority === 'rush' && b.priority !== 'rush') return -1;
      if (a.priority !== 'rush' && b.priority === 'rush') return 1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    expect(sorted[0].id).toBe('2'); // Rush job first
    expect(sorted[1].id).toBe('3'); // Normal job with earlier created_at
    expect(sorted[2].id).toBe('1'); // Normal job with later created_at
  });

  it('should filter jobs by in_queue status', () => {
    const jobs = [
      { id: '1', status: 'in_queue', priority: 'normal' },
      { id: '2', status: 'completed', priority: 'normal' },
      { id: '3', status: 'in_queue', priority: 'rush' },
      { id: '4', status: 'waiting_for_pickup', priority: 'normal' },
    ];

    const queueJobs = jobs.filter(job => job.status === 'in_queue');

    expect(queueJobs.length).toBe(2);
    expect(queueJobs.map(j => j.id)).toEqual(['1', '3']);
  });

  it('should calculate ETA based on queue position', () => {
    const AVERAGE_TIME_PER_JOB_MINUTES = 30;
    const position = 3;
    const etaMinutes = position * AVERAGE_TIME_PER_JOB_MINUTES;
    
    expect(etaMinutes).toBe(90);
  });

  it('should format ETA as hours and minutes when > 60 minutes', () => {
    const etaMinutes = 90;
    const etaHours = Math.floor(etaMinutes / 60);
    const etaRemainingMinutes = etaMinutes % 60;
    const etaString = etaHours > 0 
      ? `${etaHours}h ${etaRemainingMinutes}m`
      : `${etaRemainingMinutes}m`;
    
    expect(etaString).toBe('1h 30m');
  });

  it('should format ETA as minutes when < 60 minutes', () => {
    const etaMinutes = 30;
    const etaHours = Math.floor(etaMinutes / 60);
    const etaRemainingMinutes = etaMinutes % 60;
    const etaString = etaHours > 0 
      ? `${etaHours}h ${etaRemainingMinutes}m`
      : `${etaRemainingMinutes}m`;
    
    expect(etaString).toBe('30m');
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
