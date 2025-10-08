document.addEventListener('DOMContentLoaded', async () => {
  const el = document.getElementById('reportsArea');
  if (!el) return;
  try {
    // example: fetch reports if you have endpoint /reports/list
    const r = await api.fetchJson('/reports'); // adapt server route if needed
    if (r.ok && Array.isArray(r.json)) {
      el.innerHTML = '<ul>' + r.json.map(rep => `<li>${rep.id} — ${rep.date}</li>`).join('') + '</ul>';
    } else el.innerText = 'Нет данных';
  } catch (e) {
    el.innerText = 'Ошибка';
    console.error(e);
  }
});
