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

function renderLoginHTML() {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Brouwerij Admin - Brouwerij Robier</title>
  <style>
    body { font-family: sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
    h1 { text-align: center; }
    form { display: flex; flex-direction: column; }
    input { padding: 10px; margin: 10px 0; font-size: 16px; }
    button { padding: 10px; background: #0066cc; color: white; border: none; cursor: pointer; font-size: 16px; }
    button:hover { background: #0052a3; }
    .error { color: red; text-align: center; }
  </style>
</head>
<body>
  <h1>Brouwerij Admin</h1>
  <form method="POST">
    <input type="password" name="password" placeholder="Wachtwoord" required autofocus>
    <button type="submit">Inloggen</button>
  </form>
</body>
</html>`;
}

function renderDashboardHTML(beers) {
  const beerOptions = beers.map(b => `<option value="${b.id}">${b.name} (#${b.id})</option>`).join('');

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard - Brouwerij Robier Admin</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { text-align: center; }
    .controls { margin-bottom: 20px; }
    select, input, textarea, button { padding: 8px; margin: 5px 0; width: 100%; box-sizing: border-box; font-size: 14px; }
    button { background: #0066cc; color: white; border: none; cursor: pointer; }
    button:hover { background: #0052a3; }
    .form-group { margin: 15px 0; }
    label { display: block; font-weight: bold; margin: 5px 0; }
    textarea { min-height: 100px; }
    .logout { text-align: right; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <div class="logout"><a href="/brouwerij/logout">Uitloggen</a></div>
  <h1>Brouwerij Admin Dashboard</h1>

  <div class="controls">
    <div class="form-group">
      <label>Selecteer bier:</label>
      <select id="beerSelect">
        <option value="">-- Nieuw bier --</option>
        ${beerOptions}
      </select>
    </div>

    <form id="beerForm" method="POST" action="/brouwerij/api/beer">
      <input type="hidden" id="beerId" name="beer_id" value="">

      <div class="form-group">
        <label>Bier ID:</label>
        <input type="text" id="newBeerId" name="new_beer_id" placeholder="bv. 46-experimenteel">
      </div>

      <div class="form-group">
        <label>Naam:</label>
        <input type="text" name="name" placeholder="bv. Experimenteel IPA">
      </div>

      <div class="form-group">
        <label>Type:</label>
        <input type="text" name="type" placeholder="bv. IPA">
      </div>

      <div class="form-group">
        <label>ABV (%):</label>
        <input type="number" name="abv" step="0.1" placeholder="bv. 6.5">
      </div>

      <div class="form-group">
        <label>Brouwen (YYYY-MM-DD):</label>
        <input type="date" name="brew_date">
      </div>

      <div class="form-group">
        <label>Bottelen (YYYY-MM-DD):</label>
        <input type="date" name="bottle_date">
      </div>

      <div class="form-group">
        <label>Voorraad:</label>
        <select name="in_stock">
          <option value="1">Ja</option>
          <option value="0">Nee</option>
        </select>
      </div>

      <div class="form-group">
        <label>Beschrijving:</label>
        <textarea name="description" placeholder="Beschrijving van het bier"></textarea>
      </div>

      <div class="form-group">
        <label>Gist:</label>
        <input type="text" name="yeast" placeholder="bv. S-33">
      </div>

      <div class="form-group">
        <label>OG:</label>
        <input type="text" name="og" placeholder="bv. 1.085">
      </div>

      <div class="form-group">
        <label>FG:</label>
        <input type="text" name="fg" placeholder="bv. 1.024">
      </div>

      <div class="form-group">
        <label>Alcohol (%):</label>
        <input type="number" name="alc" step="0.1" placeholder="bv. 8.4">
      </div>

      <div class="form-group">
        <label>Maischwater (liter):</label>
        <input type="number" name="mash_water_liters" step="0.1" placeholder="bv. 8">
      </div>

      <div class="form-group">
        <label>Spoelwater (liter):</label>
        <input type="number" name="sparge_water_liters" step="0.1" placeholder="bv. 9">
      </div>

      <button type="submit">Opslaan</button>
    </form>
  </div>

  <script>
    const select = document.getElementById('beerSelect');
    const form = document.getElementById('beerForm');
    const beerId = document.getElementById('beerId');

    select.addEventListener('change', async function() {
      if (!this.value) {
        form.reset();
        beerId.value = '';
        return;
      }

      const resp = await fetch('/api/bieren');
      const beers = await resp.json();
      const beer = beers.find(b => b.id === this.value);

      if (beer) {
        document.querySelector('input[name="beer_id"]').value = beer.id;
        document.querySelector('input[name="name"]').value = beer.name;
        document.querySelector('input[name="type"]').value = beer.type;
        document.querySelector('input[name="abv"]').value = beer.abv || '';
        document.querySelector('input[name="brew_date"]').value = beer.brew_date || '';
        document.querySelector('input[name="bottle_date"]').value = beer.bottle_date || '';
        document.querySelector('select[name="in_stock"]').value = beer.in_stock ? '1' : '0';
      }
    });
  </script>
</body>
</html>`;
}

function checkAuth(request) {
  const cookies = request.headers.get('cookie') || '';
  return cookies.includes('admin_session=true');
}

function setAuthCookie(response) {
  response.headers.set('Set-Cookie', 'admin_session=true; Path=/brouwerij; HttpOnly; Secure; SameSite=Strict; Max-Age=86400');
  return response;
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

    if (url.pathname === '/brouwerij/' || url.pathname === '/brouwerij') {
      if (checkAuth(request)) {
        const { results } = await env.DB.prepare('SELECT * FROM beers ORDER BY id').all();
        return setAuthCookie(new Response(renderDashboardHTML(results), { headers: htmlHeaders() }));
      }

      if (request.method === 'POST') {
        const formData = await request.formData();
        const password = formData.get('password');

        if (password === env.ADMIN_PASSWORD) {
          return setAuthCookie(new Response(renderDashboardHTML([]), { headers: htmlHeaders() }));
        }

        return new Response(renderLoginHTML() + '<p style="color:red;text-align:center;">Wachtwoord ongeldig</p>', { headers: htmlHeaders() });
      }

      return new Response(renderLoginHTML(), { headers: htmlHeaders() });
    }

    if (url.pathname === '/brouwerij/logout') {
      const resp = new Response('Uitgelogd. <a href="/brouwerij/">Terug</a>', { headers: htmlHeaders() });
      resp.headers.set('Set-Cookie', 'admin_session=; Path=/brouwerij; Max-Age=0');
      return resp;
    }

    if (url.pathname === '/brouwerij/api/beer' && request.method === 'POST') {
      if (!checkAuth(request)) {
        return new Response('Unauthorized', { status: 401 });
      }

      const formData = await request.formData();
      const beerId = formData.get('beer_id');
      const newBeerId = formData.get('new_beer_id') || beerId;

      const name = formData.get('name');
      const type = formData.get('type');
      const abv = formData.get('abv') ? parseFloat(formData.get('abv')) : null;
      const brewDate = formData.get('brew_date') || null;
      const bottleDate = formData.get('bottle_date') || null;
      const inStock = formData.get('in_stock') === '1' ? 1 : 0;

      const description = formData.get('description') || null;
      const yeast = formData.get('yeast') || null;
      const og = formData.get('og') || null;
      const fg = formData.get('fg') || null;
      const alc = formData.get('alc') ? parseFloat(formData.get('alc')) : null;
      const mashWater = formData.get('mash_water_liters') ? parseFloat(formData.get('mash_water_liters')) : null;
      const spargeWater = formData.get('sparge_water_liters') ? parseFloat(formData.get('sparge_water_liters')) : null;

      if (!name || !type) {
        return new Response('Naam en Type zijn verplicht', { status: 400 });
      }

      try {
        if (beerId && beerId !== newBeerId) {
          await env.DB.prepare('UPDATE beers SET id = ? WHERE id = ?').bind(newBeerId, beerId).run();
          await env.DB.prepare('UPDATE beer_details SET beer_id = ? WHERE beer_id = ?').bind(newBeerId, beerId).run();
        } else if (beerId) {
          await env.DB.prepare(
            'UPDATE beers SET name = ?, type = ?, abv = ?, brew_date = ?, bottle_date = ?, in_stock = ? WHERE id = ?'
          ).bind(name, type, abv, brewDate, bottleDate, inStock, beerId).run();

          await env.DB.prepare(
            'UPDATE beer_details SET description = ?, yeast = ?, og = ?, fg = ?, alc = ?, mash_water_liters = ?, sparge_water_liters = ? WHERE beer_id = ?'
          ).bind(description, yeast, og, fg, alc, mashWater, spargeWater, beerId).run();
        } else {
          const detailId = `${newBeerId}-detail`;
          await env.DB.prepare(
            'INSERT INTO beers (id, name, type, abv, brew_date, bottle_date, in_stock, detail_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(newBeerId, name, type, abv, brewDate, bottleDate, inStock, `bieren/${newBeerId}.md`).run();

          await env.DB.prepare(
            'INSERT INTO beer_details (id, beer_id, title, description, yeast, og, fg, alc, mash_water_liters, sparge_water_liters) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(detailId, newBeerId, name, description, yeast, og, fg, alc, mashWater, spargeWater).run();
        }

        return new Response('Opgeslagen!', { headers: htmlHeaders() });
      } catch (err) {
        return new Response(`Fout: ${err.message}`, { status: 500 });
      }
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
