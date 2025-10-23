document.addEventListener('DOMContentLoaded', async () => {
  const sessionRes = await fetch('/session');
  const sessionData = await sessionRes.json();
  if (!sessionData.success || sessionData.user.role !== 'admin') {
    return (window.location.href = '/login.html');
  }

  const burgerBtn = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  burgerBtn.addEventListener('click', () => nav.classList.toggle('active'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('active')));

  document.querySelectorAll('nav .btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
      document.querySelectorAll('nav .btn[data-tab]').forEach(b => b.classList.remove('active'));
      document.getElementById(btn.dataset.tab).classList.add('active');
      btn.classList.add('active');

      if (btn.dataset.tab === 'reports') loadReports();
      if (btn.dataset.tab === 'inventory') loadInventory();
      if (btn.dataset.tab === 'notifications') loadNotifications();
      if (btn.dataset.tab === 'crm') loadClients();
    });
  });

  loadReports();
});

async function loadReports() {}
async function loadInventory() {}
async function editItem(id) {}
async function loadNotifications() {}

document.getElementById('addClientBtn')?.addEventListener('click', () => {
  document.getElementById('clientModal').style.display = 'block';
});

document.getElementById('closeClientModal')?.addEventListener('click', () => {
  document.getElementById('clientModal').style.display = 'none';
});

document.getElementById('saveClient')?.addEventListener('click', saveClient);
document.getElementById('clientSearch')?.addEventListener('input', loadClients);
document.getElementById('segmentFilter')?.addEventListener('change', loadClients);

async function loadClients() {
  const q = document.getElementById('clientSearch').value.trim();
  const seg = document.getElementById('segmentFilter').value;
  const res = await fetch(`/crm/clients?q=${encodeURIComponent(q)}&segment=${seg}`);
  const data = await res.json();
  if (!data.success) return;

  const tbody = document.getElementById('clientsTable');
  tbody.innerHTML = '';
  data.clients.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.phone || '-'}</td>
      <td>${c.email || '-'}</td>
      <td>${c.segment || '-'}</td>
      <td>${c.bonus || 0}</td>
      <td>${c.purchases || 0}</td>
      <td>
        <button class="btn" onclick="editClient(${c.id})">✏️ Редактировать</button>
        <button class="btn" onclick="adjustBonus(${c.id})">🎁 Бонусы</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function saveClient() {
  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const segment = document.getElementById('cSegment').value;
  if (!name) return alert('Пожалуйста, укажите имя клиента');

  const res = await fetch('/crm/clients/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, email, segment })
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById('clientModal').style.display = 'none';
    loadClients();
  } else {
    alert('Ошибка при сохранении: ' + data.message);
  }
}

async function editClient(id) {
  const name = prompt('Введите новое имя клиента:');
  const phone = prompt('Введите новый телефон:');
  const email = prompt('Введите новый email:');
  const segment = prompt('Введите сегмент (vip, wholesale, new, loyal):');

  await fetch('/crm/clients/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, phone, email, segment })
  });
  loadClients();
}

async function adjustBonus(id) {
  const delta = parseInt(prompt('Введите изменение бонусов (+/-):') || '0');
  await fetch('/crm/clients/bonus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, delta })
  });
  loadClients();
}
