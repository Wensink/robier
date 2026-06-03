const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.robier.nl',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/bieren') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM beers ORDER BY brew_date DESC, id ASC'
      ).all();

      return new Response(JSON.stringify(results), { headers: CORS_HEADERS });
    }

    return new Response('Not found', { status: 404 });
  },
};
