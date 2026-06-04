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

function htmlHeaders() {
  return {
    'Content-Type': 'text/html; charset=utf-8',
  };
}

function renderBeerDetailHTML(beer, detail) {
  const maltRows = detail.malt ? detail.malt.map(m =>
    `<tr><td>${m.naam}</td><td>${m.gewicht}</td><td>${m.procent}</td><td>${m.ebc}</td></tr>`
  ).join('') : '';

  const hopRows = detail.hops ? detail.hops.map(h =>
    `<tr><td>${h.naam}</td><td>${h.gewicht}</td><td>${h.alpha}</td><td>${h.kooktijd}</td><td>${h.type}</td></tr>`
  ).join('') : '';

  const mashRows = detail.mash ? detail.mash.map(m =>
    `<tr><td>${m.temp}</td><td>${m.tijd}</td><td>${m.sg || ''}</td></tr>`
  ).join('') : '';

  const untappd = `https://untappd.com/search?q=brouwerij-robier+${encodeURIComponent(detail.title)}`;

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${detail.title} - Brouwerij Robier</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    table, th, td { border: 1px solid #ddd; }
    th, td { padding: 10px; text-align: left; }
    th { background-color: #f5f5f5; }
    .meta { color: #666; margin: 10px 0; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <a href="/bieren/">← Terug naar alle bieren</a>
  <h1>${detail.title}</h1>
  <div class="meta">
    <p><strong>Type:</strong> ${beer.type}</p>
    ${beer.abv ? `<p><strong>ABV:</strong> ${beer.abv}%</p>` : ''}
    ${beer.brew_date ? `<p><strong>Brouwen:</strong> ${beer.brew_date}</p>` : ''}
    ${beer.bottle_date ? `<p><strong>Bottelen:</strong> ${beer.bottle_date}</p>` : ''}
  </div>

  ${detail.description ? `<p>${detail.description}</p>` : ''}

  <a href="${untappd}" target="_blank">Laat je review achter op Untappd</a>

  ${maltRows ? `
  <h2>Brouwschema voor 10 liter</h2>
  <h3>Mout</h3>
  <table>
    <thead>
      <tr><th>Naam</th><th>Gewicht (g)</th><th>%</th><th>EBC</th></tr>
    </thead>
    <tbody>${maltRows}</tbody>
  </table>
  ` : ''}

  ${hopRows ? `
  <h3>Hop</h3>
  <table>
    <thead>
      <tr><th>Naam</th><th>Gewicht (g)</th><th>Alpha zuur %</th><th>Kooktijd</th><th>Bloem/pellet</th></tr>
    </thead>
    <tbody>${hopRows}</tbody>
  </table>
  ` : ''}

  ${mashRows ? `
  <h3>Maischen</h3>
  <table>
    <thead>
      <tr><th>Temperatuur (°C)</th><th>Tijd</th><th>SG</th></tr>
    </thead>
    <tbody>${mashRows}</tbody>
  </table>
  ` : ''}

  ${detail.yeast ? `<p><strong>Gist:</strong> ${detail.yeast}</p>` : ''}
  ${detail.og ? `<p><strong>OG:</strong> ${detail.og}</p>` : ''}
  ${detail.fg ? `<p><strong>FG:</strong> ${detail.fg}</p>` : ''}
  ${detail.alc ? `<p><strong>Alc:</strong> ${detail.alc}%</p>` : ''}
  ${detail.mash_water_liters ? `<p><strong>Maischwater:</strong> ${detail.mash_water_liters} liter</p>` : ''}
  ${detail.sparge_water_liters ? `<p><strong>Spoelwater:</strong> ${detail.sparge_water_liters} liter</p>` : ''}
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (url.pathname === '/api/bieren') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM beers ORDER BY brew_date DESC, id ASC'
      ).all();

      return new Response(JSON.stringify(results), { headers: corsHeaders(origin) });
    }

    const beerMatch = url.pathname.match(/^\/bieren\/([^/]+)\/?$/);
    if (beerMatch) {
      const beerId = beerMatch[1];

      const { results: beerResults } = await env.DB.prepare(
        'SELECT * FROM beers WHERE id = ?'
      ).bind(beerId).all();

      const { results: detailResults } = await env.DB.prepare(
        'SELECT * FROM beer_details WHERE beer_id = ?'
      ).bind(beerId).all();

      if (beerResults.length === 0) {
        return new Response('Bier niet gevonden', { status: 404, headers: htmlHeaders() });
      }

      const beer = beerResults[0];
      const detail = detailResults[0] || {
        title: beer.name,
        description: null,
        malt: null,
        hops: null,
        mash: null,
        yeast: null,
        og: null,
        fg: null,
        alc: null,
        mash_water_liters: null,
        sparge_water_liters: null,
      };

      const html = renderBeerDetailHTML(beer, detail);
      return new Response(html, { headers: htmlHeaders() });
    }

    return new Response('Not found', { status: 404 });
  },
};
