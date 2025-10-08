document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('email')||{}).value || '';
    try {
      const res = await fetch('/reset', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email })
      });
      const j = await res.json().catch(()=>null);
      if (res.ok && j && j.success) { alert('Инструкция отправлена на почту.'); return; }
      alert(j && j.message ? j.message : `Ошибка (status ${res.status})`);
    } catch (err) { console.error('Reset error', err); alert('Сетевая ошибка'); }
  });
});
