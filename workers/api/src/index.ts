export interface Env {
  DB: any;
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

    // 404 for unknown routes
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

async function handlePlayers(request: Request, env: Env, corsHeaders: HeadersInit): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (request.method === 'GET') {
    if (id && id !== 'players') {
      // Get single player
      const result = await env.DB.prepare('SELECT * FROM players WHERE id = ?').bind(id).first();
      if (!result) return new Response('Not Found', { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    // Get all players
    const result = await env.DB.prepare('SELECT * FROM players ORDER BY name').all();
    return new Response(JSON.stringify(result.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO players (id, name, club, level, style, grip, string_pref, tension, racquet, notes, email, phone, restring_interval_weeks, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      body.id || crypto.randomUUID(),
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
      body.created_at || new Date().toISOString(),
      body.updated_at || new Date().toISOString()
    ).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'PUT') {
    const body = await request.json();
    const stmt = env.DB.prepare(`
      UPDATE players SET name = ?, club = ?, level = ?, style = ?, grip = ?, string_pref = ?, tension = ?, racquet = ?, notes = ?, email = ?, phone = ?, restring_interval_weeks = ?, updated_at = ?
      WHERE id = ?
    `);
    await stmt.bind(
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
      new Date().toISOString(),
      id
    ).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM players WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

async function handleStringing(request: Request, env: Env, corsHeaders: HeadersInit): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (request.method === 'GET') {
    if (id && id !== 'stringing') {
      const result = await env.DB.prepare('SELECT * FROM stringing WHERE id = ?').bind(id).first();
      if (!result) return new Response('Not Found', { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const result = await env.DB.prepare('SELECT * FROM stringing ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(result.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO stringing (id, player_id, racquet, string_mains, string_crosses, gauge_mains, gauge_crosses, tension_mains, tension_crosses, tension_unit, tension_unit_crosses, prestretch, prestretch_crosses, strung_at, notes, status, priority, created_at, player_own_string, labour_cost, material_cost, charge_total, string_tier, service_label, regrip, logo_color, pickup_time, picked_up_at, stringer_name, knots, player_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      body.id || crypto.randomUUID(),
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
      body.status || 'open',
      body.priority || 'regular',
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
      body.player_name || null
    ).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'PUT') {
    const body = await request.json();
    const stmt = env.DB.prepare(`
      UPDATE stringing SET status = ?, strung_at = ?, picked_up_at = ?, notes = ?
      WHERE id = ?
    `);
    await stmt.bind(
      body.status,
      body.strung_at || null,
      body.picked_up_at || null,
      body.notes || null,
      id
    ).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM stringing WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

async function handleInventory(request: Request, env: Env, corsHeaders: HeadersInit): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (request.method === 'GET') {
    if (id && id !== 'inventory') {
      const result = await env.DB.prepare('SELECT * FROM inventory WHERE id = ?').bind(id).first();
      if (!result) return new Response('Not Found', { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const result = await env.DB.prepare('SELECT * FROM inventory ORDER BY category, name').all();
    return new Response(JSON.stringify(result.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO inventory (id, name, brand, category, price, quantity, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      body.id || crypto.randomUUID(),
      body.name,
      body.brand || null,
      body.category || null,
      body.price || null,
      body.quantity || 0,
      body.status || 'in_stock',
      body.notes || null,
      body.created_at || new Date().toISOString(),
      body.updated_at || new Date().toISOString()
    ).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'PUT') {
    const body = await request.json();
    const stmt = env.DB.prepare(`
      UPDATE inventory SET name = ?, brand = ?, category = ?, price = ?, quantity = ?, status = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `);
    await stmt.bind(
      body.name,
      body.brand || null,
      body.category || null,
      body.price || null,
      body.quantity || 0,
      body.status || 'in_stock',
      body.notes || null,
      new Date().toISOString(),
      id
    ).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM inventory WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

async function handleHistory(request: Request, env: Env, corsHeaders: HeadersInit): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (request.method === 'GET') {
    if (id && id !== 'history') {
      const result = await env.DB.prepare('SELECT * FROM history WHERE id = ?').bind(id).first();
      if (!result) return new Response('Not Found', { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const result = await env.DB.prepare('SELECT * FROM history ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(result.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO history (id, player_id, racquet, notes, current_weight, target_weight, current_balance, target_balance, mass_added, mass_location, sw_delta, sw_result, created_at, price_currency, price_overgrip, price_specs_measurement, price_specs_matching, price_grip_replacement, price_bumper_grommet, price_other, price_other_label, price_total, player_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
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
      body.player_name || null
    ).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM history WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}
