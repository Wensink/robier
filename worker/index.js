// Make list dynamic based on database instead of hardcoded

const ALLOWED_ORIGINS = [
  'https://www.robier.nl',
  'https://robier.nl',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/bieren') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM beers ORDER BY brew_date DESC, id ASC'
      ).all();

      return new Response(JSON.stringify(results), { headers: corsHeaders(origin) });
    }

    return new Response('Not found', { status: 404 });
  },
};
