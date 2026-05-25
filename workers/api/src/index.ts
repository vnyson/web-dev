export interface Env {
  DB: any;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  ADMIN_EMAIL?: string;
  SESSION_SECRET?: string;
}

// Helper function to validate admin session
async function validateAdminSession(request: Request, env: Env): Promise<boolean> {
  // For local testing, if SESSION_SECRET is not set, allow any session cookie or token
  if (!env.SESSION_SECRET) {
    const cookie = request.headers.get('Cookie');
    const authHeader = request.headers.get('Authorization');
    if (cookie) {
      const sessionMatch = cookie.match(/admin_session=([^;]+)/);
      if (sessionMatch) return true;
    }
    if (authHeader) {
      const tokenMatch = authHeader.match(/Bearer (.+)/);
      if (tokenMatch) return true;
    }
    return false;
  }

  // Production validation - accept either cookie or Authorization header
  const cookie = request.headers.get('Cookie');
  const authHeader = request.headers.get('Authorization');

  let sessionToken = null;

  if (cookie) {
    const sessionMatch = cookie.match(/admin_session=([^;]+)/);
    if (sessionMatch) {
      sessionToken = sessionMatch[1];
    }
  }

  if (!sessionToken && authHeader) {
    const tokenMatch = authHeader.match(/Bearer (.+)/);
    if (tokenMatch) {
      sessionToken = tokenMatch[1];
    }
  }

  if (!sessionToken) return false;

  // In production, validate against stored session in KV or D1
  // For now, accept any valid-looking token
  return sessionToken.length > 0;
}

// Helper function to validate player token
async function validatePlayerToken(token: string, env: Env): Promise<string | null> {
  const result = await env.DB.prepare('SELECT id FROM players WHERE access_token = ?')
    .bind(token)
    .first();
  return result ? result.id : null;
}

// Helper function to generate access token
function generateAccessToken(): string {
  return crypto.randomUUID();
}

// OAuth handler - redirect to Google
async function handleGoogleAuth(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit,
): Promise<Response> {
  const redirectUri = `${new URL(request.url).origin}/auth/google/callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile`;
  return Response.redirect(authUrl, 302);
}

// OAuth callback handler
async function handleGoogleCallback(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit,
): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Authorization code not found', { status: 400, headers: corsHeaders });
  }

  // Check if OAuth credentials are configured
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return new Response('OAuth not configured', { status: 500, headers: corsHeaders });
  }

  // Exchange code for tokens
  const redirectUri = `${url.origin}/auth/google/callback`;
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenResponse.json();

  if (tokens.error) {
    return new Response(JSON.stringify({ error: tokens.error }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get user info
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const user = await userResponse.json();

  // Validate email
  if (!env.ADMIN_EMAIL || user.email !== env.ADMIN_EMAIL) {
    return new Response('Unauthorized email', { status: 403, headers: corsHeaders });
  }

  // Create session token
  const sessionToken = crypto.randomUUID();

  // Return the token in the response body instead of setting a cookie
  return new Response(JSON.stringify({ token: sessionToken }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Handler for player-by-token endpoint
async function handlePlayerByToken(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit,
): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Token required', { status: 400, headers: corsHeaders });
  }

  const playerId = await validatePlayerToken(token, env);
  if (!playerId) {
    return new Response('Invalid token', { status: 401, headers: corsHeaders });
  }

  // Get player data
  const player = await env.DB.prepare('SELECT * FROM players WHERE id = ?').bind(playerId).first();
  if (!player) {
    return new Response('Player not found', { status: 404, headers: corsHeaders });
  }

  // Get player's stringing jobs
  const jobs = await env.DB.prepare(
    'SELECT * FROM stringing WHERE player_id = ? ORDER BY created_at DESC',
  )
    .bind(playerId)
    .all();

  // Get player's rackets
  const rackets = await env.DB.prepare(
    'SELECT * FROM rackets WHERE player_id = ? ORDER BY created_at DESC',
  )
    .bind(playerId)
    .all();

  return new Response(JSON.stringify({ player, jobs: jobs.results, rackets: rackets.results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Handler for regenerate-token endpoint
async function handleRegenerateToken(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  // Validate admin session
  const isAdmin = await validateAdminSession(request, env);
  if (!isAdmin) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const body = await request.json();
  const playerId = body.player_id;

  if (!playerId) {
    return new Response('player_id required', { status: 400, headers: corsHeaders });
  }

  // Generate new token
  const newToken = generateAccessToken();

  // Update player with new token
  await env.DB.prepare('UPDATE players SET access_token = ? WHERE id = ?')
    .bind(newToken, playerId)
    .run();

  // Return shareable link
  const shareableLink = `${new URL(request.url).origin}/player?token=${newToken}`;

  return new Response(JSON.stringify({ shareableLink }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // OAuth routes
    if (path === '/auth/google') {
      return handleGoogleAuth(request, env, corsHeaders);
    }
    if (path === '/auth/google/callback') {
      return handleGoogleCallback(request, env, corsHeaders);
    }

    // API routes
    if (path.startsWith('/api/players')) {
      return handlePlayers(request, env, corsHeaders);
    }
    if (path.startsWith('/api/stringing')) {
      return handleStringing(request, env, corsHeaders);
    }
    if (path.startsWith('/api/inventory')) {
      return handleInventory(request, env, corsHeaders);
    }
    if (path.startsWith('/api/history')) {
      return handleHistory(request, env, corsHeaders);
    }
    if (path.startsWith('/api/rackets')) {
      return handleRackets(request, env, corsHeaders);
    }
    if (path === '/api/player-by-token') {
      return handlePlayerByToken(request, env, corsHeaders);
    }
    if (path === '/api/regenerate-token') {
      return handleRegenerateToken(request, env, corsHeaders);
    }

    // 404 for unknown routes
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

export async function handlePlayers(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit,
): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (request.method === 'GET') {
    if (id && id !== 'players') {
      // Get single player - requires player token or admin session
      const token = url.searchParams.get('token');
      const isAdmin = await validateAdminSession(request, env);

      if (!token && !isAdmin) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      if (token) {
        const playerId = await validatePlayerToken(token, env);
        if (!playerId || playerId !== id) {
          return new Response('Unauthorized', { status: 401, headers: corsHeaders });
        }
      }

      const result = await env.DB.prepare('SELECT * FROM players WHERE id = ?').bind(id).first();
      if (!result) return new Response('Not Found', { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Get all players - requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
    const result = await env.DB.prepare('SELECT * FROM players ORDER BY name').all();
    return new Response(JSON.stringify(result.results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get player's last jobs
  if (request.method === 'GET' && url.searchParams.has('last_jobs')) {
    const playerId = url.searchParams.get('last_jobs');
    const result = await env.DB.prepare(
      'SELECT * FROM stringing WHERE player_id = ? ORDER BY created_at DESC LIMIT 5',
    )
      .bind(playerId)
      .all();
    return new Response(JSON.stringify(result.results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const playerId = body.id || crypto.randomUUID();
    const accessToken = generateAccessToken();

    const stmt = env.DB.prepare(`
      INSERT INTO players (id, name, club, level, style, grip, string_pref, tension, racquet, notes, email, phone, restring_interval_weeks, inventory_preferences, access_token, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt
      .bind(
        playerId,
        body.name,
        body.club || null,
        body.level || null,
        body.style || null,
        body.grip || null,
        body.string_pref || null,
        body.tension || null,
        body.racquet || null,
        body.notes || null,
        body.email || null,
        body.phone || null,
        body.restring_interval_weeks || null,
        body.inventory_preferences || null,
        accessToken,
        body.created_at || new Date().toISOString(),
        body.updated_at || new Date().toISOString(),
      )
      .run();
    return new Response(JSON.stringify({ success: true, player_id: playerId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'PUT') {
    const body = await request.json();
    const token = url.searchParams.get('token');
    const isAdmin = await validateAdminSession(request, env);

    // Require either player token or admin session
    if (!token && !isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    if (token) {
      const playerId = await validatePlayerToken(token, env);
      if (!playerId || playerId !== id) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }
    }

    const stmt = env.DB.prepare(`
      UPDATE players SET name = ?, club = ?, level = ?, style = ?, grip = ?, string_pref = ?, tension = ?, racquet = ?, notes = ?, email = ?, phone = ?, restring_interval_weeks = ?, inventory_preferences = ?, updated_at = ?
      WHERE id = ?
    `);
    await stmt
      .bind(
        body.name,
        body.club || null,
        body.level || null,
        body.style || null,
        body.grip || null,
        body.string_pref || null,
        body.tension || null,
        body.racquet || null,
        body.notes || null,
        body.email || null,
        body.phone || null,
        body.restring_interval_weeks || null,
        body.inventory_preferences || null,
        new Date().toISOString(),
        id,
      )
      .run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'DELETE') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
    await env.DB.prepare('DELETE FROM players WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

export async function handleStringing(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit,
): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (request.method === 'GET') {
    if (id && id !== 'stringing') {
      const result = await env.DB.prepare('SELECT * FROM stringing WHERE id = ?').bind(id).first();
      if (!result) return new Response('Not Found', { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Get all stringing jobs - requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
    const result = await env.DB.prepare('SELECT * FROM stringing ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(result.results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const jobId = body.id || crypto.randomUUID();

    // Generate token for player if they don't have one
    if (body.player_id) {
      const player = await env.DB.prepare('SELECT access_token FROM players WHERE id = ?')
        .bind(body.player_id)
        .first();
      if (player && !player.access_token) {
        const newToken = generateAccessToken();
        await env.DB.prepare('UPDATE players SET access_token = ? WHERE id = ?')
          .bind(newToken, body.player_id)
          .run();
      }
    }

    // Insert stringing job
    const stmt = env.DB.prepare(`
      INSERT INTO stringing (id, player_id, racquet, string_mains, string_crosses, gauge_mains, gauge_crosses, tension_mains, tension_crosses, tension_unit, tension_unit_crosses, prestretch, prestretch_crosses, strung_at, notes, status, priority, created_at, player_own_string, labour_cost, material_cost, charge_total, string_tier, service_label, regrip, logo_color, pickup_time, picked_up_at, stringer_name, knots, player_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt
      .bind(
        jobId,
        body.player_id || null,
        body.racquet || null,
        body.string_mains || null,
        body.string_crosses || null,
        body.gauge_mains || null,
        body.gauge_crosses || null,
        body.tension_mains || null,
        body.tension_crosses || null,
        body.tension_unit || null,
        body.tension_unit_crosses || null,
        body.prestretch || null,
        body.prestretch_crosses || null,
        body.strung_at || null,
        body.notes || null,
        body.status || 'in_queue',
        body.priority || 'normal',
        body.created_at || new Date().toISOString(),
        body.player_own_string || 0,
        body.labour_cost || null,
        body.material_cost || null,
        body.charge_total || null,
        body.string_tier || 'regular',
        body.service_label || null,
        body.regrip || 0,
        body.logo_color || null,
        body.pickup_time || null,
        body.picked_up_at || null,
        body.stringer_name || null,
        body.knots || null,
        body.player_name || null,
      )
      .run();

    // Consume inventory if strings are provided and player doesn't own strings
    if (body.string_mains && !body.player_own_string) {
      try {
        // Find inventory item by string name
        const inventoryItem = await env.DB.prepare(
          'SELECT * FROM inventory WHERE name = ? AND category = ?',
        )
          .bind(body.string_mains, 'string')
          .first();

        if (inventoryItem && inventoryItem.quantity > 0) {
          // Decrement inventory quantity
          await env.DB.prepare(
            'UPDATE inventory SET quantity = quantity - 1, updated_at = ? WHERE id = ?',
          )
            .bind(new Date().toISOString(), inventoryItem.id)
            .run();

          // Record inventory consumption
          await env.DB.prepare(
            `
            INSERT INTO inventory_consumption (id, inventory_id, stringing_job_id, quantity_consumed, consumed_at, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          )
            .bind(
              crypto.randomUUID(),
              inventoryItem.id,
              jobId,
              1,
              new Date().toISOString(),
              `Stringing job for ${body.player_name || 'player'}`,
            )
            .run();
        }
      } catch (error) {
        console.error('Error consuming inventory:', error);
        // Continue even if inventory consumption fails
      }
    }

    if (body.string_crosses && !body.player_own_string) {
      try {
        const inventoryItem = await env.DB.prepare(
          'SELECT * FROM inventory WHERE name = ? AND category = ?',
        )
          .bind(body.string_crosses, 'string')
          .first();

        if (inventoryItem && inventoryItem.quantity > 0) {
          await env.DB.prepare(
            'UPDATE inventory SET quantity = quantity - 1, updated_at = ? WHERE id = ?',
          )
            .bind(new Date().toISOString(), inventoryItem.id)
            .run();

          await env.DB.prepare(
            `
            INSERT INTO inventory_consumption (id, inventory_id, stringing_job_id, quantity_consumed, consumed_at, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          )
            .bind(
              crypto.randomUUID(),
              inventoryItem.id,
              jobId,
              1,
              new Date().toISOString(),
              `Stringing job for ${body.player_name || 'player'}`,
            )
            .run();
        }
      } catch (error) {
        console.error('Error consuming inventory:', error);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'PUT') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const stmt = env.DB.prepare(`
      UPDATE stringing SET status = ?, strung_at = ?, picked_up_at = ?, notes = ?
      WHERE id = ?
    `);
    await stmt
      .bind(body.status, body.strung_at || null, body.picked_up_at || null, body.notes || null, id)
      .run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'DELETE') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Rollback inventory consumption for this job
    const consumptions = await env.DB.prepare(
      'SELECT * FROM inventory_consumption WHERE stringing_job_id = ?',
    )
      .bind(id)
      .all();

    for (const consumption of consumptions.results) {
      try {
        await env.DB.prepare(
          'UPDATE inventory SET quantity = quantity + ?, updated_at = ? WHERE id = ?',
        )
          .bind(consumption.quantity_consumed, new Date().toISOString(), consumption.inventory_id)
          .run();
      } catch (error) {
        console.error('Error rolling back inventory:', error);
      }
    }

    // Delete inventory consumption records
    await env.DB.prepare('DELETE FROM inventory_consumption WHERE stringing_job_id = ?')
      .bind(id)
      .run();

    // Delete the stringing job
    await env.DB.prepare('DELETE FROM stringing WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

export async function handleInventory(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit,
): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (request.method === 'GET') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    if (id && id !== 'inventory') {
      const result = await env.DB.prepare('SELECT * FROM inventory WHERE id = ?').bind(id).first();
      if (!result) return new Response('Not Found', { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const result = await env.DB.prepare('SELECT * FROM inventory ORDER BY category, name').all();
    return new Response(JSON.stringify(result.results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO inventory (id, name, brand, category, price, quantity, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt
      .bind(
        body.id || crypto.randomUUID(),
        body.name,
        body.brand || null,
        body.category || null,
        body.price || null,
        body.quantity || 0,
        body.status || 'in_stock',
        body.notes || null,
        body.created_at || new Date().toISOString(),
        body.updated_at || new Date().toISOString(),
      )
      .run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'PUT') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const stmt = env.DB.prepare(`
      UPDATE inventory SET name = ?, brand = ?, category = ?, price = ?, quantity = ?, status = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `);
    await stmt
      .bind(
        body.name,
        body.brand || null,
        body.category || null,
        body.price || null,
        body.quantity || 0,
        body.status || 'in_stock',
        body.notes || null,
        new Date().toISOString(),
        id,
      )
      .run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'DELETE') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    await env.DB.prepare('DELETE FROM inventory WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

export async function handleHistory(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit,
): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (request.method === 'GET') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    if (id && id !== 'history') {
      const result = await env.DB.prepare('SELECT * FROM history WHERE id = ?').bind(id).first();
      if (!result) return new Response('Not Found', { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const result = await env.DB.prepare('SELECT * FROM history ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(result.results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO history (id, player_id, racquet, notes, current_weight, target_weight, current_balance, target_balance, mass_added, mass_location, sw_delta, sw_result, created_at, price_currency, price_overgrip, price_specs_measurement, price_specs_matching, price_grip_replacement, price_bumper_grommet, price_other, price_other_label, price_total, player_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt
      .bind(
        body.id || crypto.randomUUID(),
        body.player_id || null,
        body.racquet || null,
        body.notes || null,
        body.current_weight || null,
        body.target_weight || null,
        body.current_balance || null,
        body.target_balance || null,
        body.mass_added || null,
        body.mass_location || null,
        body.sw_delta || null,
        body.sw_result || null,
        body.created_at || new Date().toISOString(),
        body.price_currency || null,
        body.price_overgrip || null,
        body.price_specs_measurement || null,
        body.price_specs_matching || null,
        body.price_grip_replacement || null,
        body.price_bumper_grommet || null,
        body.price_other || null,
        body.price_other_label || null,
        body.price_total || null,
        body.player_name || null,
      )
      .run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'DELETE') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    await env.DB.prepare('DELETE FROM history WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

export async function handleRackets(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit,
): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  const playerId = url.searchParams.get('player_id');

  if (request.method === 'GET') {
    if (id && id !== 'rackets') {
      const result = await env.DB.prepare('SELECT * FROM rackets WHERE id = ?').bind(id).first();
      if (!result) return new Response('Not Found', { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (playerId) {
      // Get rackets by player_id - requires player token or admin session
      const token = url.searchParams.get('token');
      const isAdmin = await validateAdminSession(request, env);

      if (!token && !isAdmin) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      if (token) {
        const tokenPlayerId = await validatePlayerToken(token, env);
        if (!tokenPlayerId || tokenPlayerId !== playerId) {
          return new Response('Unauthorized', { status: 401, headers: corsHeaders });
        }
      }

      const result = await env.DB.prepare(
        'SELECT * FROM rackets WHERE player_id = ? ORDER BY created_at DESC',
      )
        .bind(playerId)
        .all();
      return new Response(JSON.stringify(result.results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Get all rackets - requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
    const result = await env.DB.prepare('SELECT * FROM rackets ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(result.results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO rackets (id, player_id, brand, model, year, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt
      .bind(
        body.id || crypto.randomUUID(),
        body.player_id,
        body.brand || null,
        body.model || null,
        body.year || null,
        body.notes || null,
        body.created_at || new Date().toISOString(),
        body.updated_at || new Date().toISOString(),
      )
      .run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'PUT') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const stmt = env.DB.prepare(`
      UPDATE rackets SET brand = ?, model = ?, year = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `);
    await stmt
      .bind(
        body.brand || null,
        body.model || null,
        body.year || null,
        body.notes || null,
        new Date().toISOString(),
        id,
      )
      .run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'DELETE') {
    // Requires admin session
    const isAdmin = await validateAdminSession(request, env);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    await env.DB.prepare('DELETE FROM rackets WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}
