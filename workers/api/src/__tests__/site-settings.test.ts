import { describe, expect, it, vi } from 'vitest';
import { handleSiteSettings } from '../index';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function createDatabase(firstResult: any = null) {
  const run = vi.fn(() => Promise.resolve({ success: true }));
  const first = vi.fn(() => Promise.resolve(firstResult));
  const bind = vi.fn(() => ({ first, run }));
  const prepare = vi.fn(() => ({ bind, first, run }));
  return { DB: { prepare }, prepare, bind, first, run };
}

describe('API - Site settings', () => {
  it('returns a hidden default when no setting exists', async () => {
    const database = createDatabase();
    const response = await handleSiteSettings(
      new Request('https://example.com/api/site-settings'),
      database as any,
      corsHeaders,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: '', showMessage: false });
  });

  it('returns the public message setting', async () => {
    const database = createDatabase({ public_message: 'Closed Friday', show_public_message: 1 });
    const response = await handleSiteSettings(
      new Request('https://example.com/api/site-settings'),
      database as any,
      corsHeaders,
    );

    expect(await response.json()).toEqual({ message: 'Closed Friday', showMessage: true });
  });

  it('requires admin authentication for updates', async () => {
    const database = createDatabase();
    const response = await handleSiteSettings(
      new Request('https://example.com/api/site-settings', {
        method: 'PUT',
        body: JSON.stringify({ message: 'Closed Friday', showMessage: true }),
      }),
      database as any,
      corsHeaders,
    );

    expect(response.status).toBe(401);
    expect(database.prepare).not.toHaveBeenCalled();
  });

  it('stores a valid update and disables blank messages', async () => {
    const database = createDatabase();
    const response = await handleSiteSettings(
      new Request('https://example.com/api/site-settings', {
        method: 'PUT',
        headers: { Authorization: 'Bearer test-token' },
        body: JSON.stringify({ message: '   ', showMessage: true }),
      }),
      database as any,
      corsHeaders,
    );

    expect(response.status).toBe(200);
    expect(database.bind).toHaveBeenCalledWith('', 0, expect.any(String));
  });

  it('rejects an invalid payload', async () => {
    const database = createDatabase();
    const response = await handleSiteSettings(
      new Request('https://example.com/api/site-settings', {
        method: 'PUT',
        headers: { Authorization: 'Bearer test-token' },
        body: JSON.stringify({ message: 'Closed Friday', showMessage: 'yes' }),
      }),
      database as any,
      corsHeaders,
    );

    expect(response.status).toBe(400);
    expect(database.bind).not.toHaveBeenCalled();
  });
});
