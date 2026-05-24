import { vi } from 'vitest';

// Mock Cloudflare Workers D1 database
vi.mock('@cloudflare/workers-types', () => ({
  D1Database: class MockD1Database {
    prepare(sql: string) {
      return {
        bind(...args: any[]) {
          return {
            first() {
              return Promise.resolve(null);
            },
            all() {
              return Promise.resolve({ results: [] });
            },
            run() {
              return Promise.resolve({ success: true });
            },
          };
        },
      };
    }
  },
}));
