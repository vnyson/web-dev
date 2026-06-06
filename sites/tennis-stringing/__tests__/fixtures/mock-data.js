/**
 * Shared mock data for E2E tests.
 * These mimic the Cloudflare Worker API responses.
 */

export const MOCK_QUEUE_STATUS = {
  count: 3,
};

export const MOCK_PLAYER = {
  id: 'player-123',
  name: 'Vinay Soni',
  email: 'vinay@example.com',
  phone: '817-798-3062',
  string_pref: 'Tourna Big Hitter Silver 17g',
  tension: '52',
  tension_cross: '50',
  grip: 'Wilson Pro Overgrip',
  notes: 'Prefers yellow overgrip',
  access_token: 'test-token-abc-123',
};

export const MOCK_RACKETS = [
  { id: 'racket-1', brand: 'Wilson', model: 'Pro Staff', year: '2023', notes: 'Stock grip' },
  { id: 'racket-2', brand: 'Babolat', model: 'Pure Aero', year: '2022', notes: 'Added lead at 12' },
];

export const MOCK_JOBS = [
  {
    id: 'job-1',
    player_id: 'player-123',
    job_type: 'stringing',
    racquet: 'Wilson Pro Staff',
    string_mains: 'Tourna Big Hitter Silver 17g',
    string_crosses: 'Tourna Big Hitter Silver 17g',
    tension_mains: '52',
    tension_crosses: '50',
    tension_unit: 'lbs',
    status: 'in_queue',
    queue_position: 2,
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'job-2',
    player_id: 'player-123',
    job_type: 'stringing',
    racquet: 'Babolat Pure Aero',
    string_mains: 'ReString Zero 1.23mm',
    string_crosses: 'ReString Zero 1.23mm',
    tension_mains: '55',
    tension_unit: 'lbs',
    status: 'ready_for_pickup',
    created_at: '2026-05-28T14:30:00Z',
  },
];

export const MOCK_HISTORY = [
  {
    id: 'hist-1',
    player_id: 'player-123',
    job_type: 'matching',
    racquet: 'Head Speed',
    current_weight: '315',
    current_balance: '32.5',
    target_weight: '320',
    target_balance: '32.0',
    mass_added: '5',
    mass_location: "12 o'clock",
    sw_delta: '3',
    sw_result: '335',
    notes: 'Custom ordered',
    created_at: '2026-04-15T09:00:00Z',
  },
];

export const MOCK_INVENTORY = [
  {
    id: 'inv-1',
    name: 'Tourna Big Hitter Silver 17g',
    category: 'string',
    price: '12',
    string_type: 'co-poly',
    string_characteristics: '["control", "durable"]',
  },
  {
    id: 'inv-2',
    name: 'Wilson NXT 16g',
    category: 'string',
    price: '18',
    string_type: 'multi',
    string_characteristics: '["comfort", "power"]',
  },
  {
    id: 'inv-3',
    name: 'Babolat Pure Aero',
    category: 'racket',
    price: '269',
  },
  {
    id: 'inv-4',
    name: 'Wilson Pro Overgrip',
    category: 'grip',
    price: '3',
    string_type: null,
    string_characteristics: null,
  },
];

export const MOCK_PLAYER_BY_TOKEN_RESPONSE = {
  player: MOCK_PLAYER,
  jobs: MOCK_JOBS,
  rackets: MOCK_RACKETS,
  history: MOCK_HISTORY,
};
