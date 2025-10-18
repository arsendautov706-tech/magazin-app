document.addEventListener('DOMContentLoaded', async () => {
  // Сессия
  const sessionRes = await fetch('/session');
  const sessionData = await sessionRes.json();
  if (!sessionData.success || sessionData.user.role !== 'admin') {
    return (window.location.href = '/login.html');
  }

  // Бургер-меню
  const burgerBtn = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  if (burgerBtn && nav) {
    burgerBtn.addEventListener('click', () => nav.classList.toggle('active'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('active')));
  }

  // Навигация по вкладкам
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
    });
  });

  // Первая вкладка
  loadReports();
});

// ====== Отчёты ======
async function loadReports() {
  try {
    const res = await fetch('/reports/list');
    const data = await res.json();
    if (!data.success) return;
    const tbody = document.getElementById('reportsList');
    tbody.innerHTML = '';
    data.reports.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.date}</td>
        <td>${r.cashier}</td>
        <td>${r.total}</td>
        <td><a href="/reports/${r.filename}" target="_blank">📥 Скачать</a></td>`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error('Ошибка загрузки отчётов:', e);
  }
}

// ====== Склад ======
async function loadInventory() {
  try {
    const res = await fetch('/inventory/items');
    const data = await res.json();
    if (!data.success) return;
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';
    data.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price}</td>
        <td><button class="btn" onclick="editItem(${item.id})">✏️</button></td>`;
      tbody.appendChild(tr);
    });

    // Заглушки для действий склада
    document.getElementById('receiveBtn').onclick = () => alert('Модалка приёмки (в разработке)');
    document.getElementById('writeoffBtn').onclick = () => alert('Модалка списания (в разработке)');
    document.getElementById('auditBtn').onclick = () => alert('Модалка инвентаризации (в разработке)');
  } catch (e) {
    console.error('Ошибка загрузки склада:', e);
  }
}

async function editItem(id) {
  const price = prompt('Новая цена:');
  const delta = prompt('Изменение количества (+/-):');
  if (price || delta) {
    await fetch('/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, delta: Number(delta) || 0, price: price ? Number(price) : undefined })
    });
    loadInventory();
  }
}

// ====== Уведомления ======
async function loadNotifications() {
  try {
    const res = await fetch('/notifications');
    const data = await res.json();
    if (!data.success) return;
    const list = document.getElementById('notificationsList');
    list.innerHTML = '';
    data.notifications.forEach(n => {
      const div = document.createElement('div');
      div.className = `notif-card ${n.type || 'notif-info'}`;
      div.innerHTML = `
        <b>${n.author ?? 'система'}</b>: ${n.message}
        <br><small>${new Date(n.created_at).toLocaleString()}</small>
        ${n.url ? `<br><a href="${n.url}" target="_blank">📂 Открыть</a>` : ''}`;
      list.appendChild(div);
    });
  } catch (e) {
    console.error('Ошибка загрузки уведомлений:', e);
  }
}
