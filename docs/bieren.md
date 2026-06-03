Hier de bieren die er gemaakt zijn

<div id="bieren-table">Laden...</div>

<script>
(function () {
  const WORKER_URL = 'https://robier-worker.wensink9337.workers.dev/api/bieren';

  function formatDate(iso) {
    if (!iso) return '-';
    const [y, m, d] = iso.split('-');
    return `${d}-${m}-${y}`;
  }

  function formatAbv(abv) {
    if (abv === null || abv === undefined) return '-';
    return abv.toFixed(1).replace('.', ',');
  }

  fetch(WORKER_URL)
    .then(function (res) { return res.json(); })
    .then(function (bieren) {
      var rows = bieren.map(function (b) {
        var num = b.detail_path
          ? '<a href="/' + b.detail_path.replace('.md', '/') + '">' + b.id.split('-')[0] + '</a>'
          : b.id;
        var voorraad = b.in_stock ? 'Ja' : 'Nee';
        return '<tr>'
          + '<td>' + num + '</td>'
          + '<td>' + b.name + '</td>'
          + '<td>' + b.type + '</td>'
          + '<td>' + formatAbv(b.abv) + '</td>'
          + '<td>' + formatDate(b.brew_date) + '</td>'
          + '<td>' + formatDate(b.bottle_date) + '</td>'
          + '<td>' + voorraad + '</td>'
          + '</tr>';
      }).join('');

      document.getElementById('bieren-table').innerHTML =
        '<table>'
        + '<thead><tr>'
        + '<th>Nummer</th><th>Naam</th><th>Type</th><th>ABV</th>'
        + '<th>Brouwen</th><th>Bottelen</th><th>Voorraad</th>'
        + '</tr></thead>'
        + '<tbody>' + rows + '</tbody>'
        + '</table>';
    })
    .catch(function () {
      document.getElementById('bieren-table').innerHTML =
        '<p>Kon bieren niet laden. Probeer later opnieuw.</p>';
    });
})();
</script>
