document.addEventListener('DOMContentLoaded', async () => {
  try {
    const sessionRes = await fetch('/session');
    const sessionData = await sessionRes.json();

    if (!sessionData.success || sessionData.user.role !== 'admin') {
      return window.location.href = '/login.html';
    }

    // Навигация по вкладкам
    document.querySelectorAll('nav .btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
        document.querySelectorAll('nav .btn[data-tab]').forEach(b => b.classList.remove('active'));

        document.getElementById(btn.dataset.tab).classList.add('active');
        btn.classList.add('active');

        // Загружаем данные только при открытии вкладки
        if (btn.dataset.tab === 'reports') loadReports();
        if (btn.dataset.tab === 'inventory') loadInventory();
        if (btn.dataset.tab === 'users') loadUsers();
        if (btn.dataset.tab === 'notifications') loadNotifications();
      });
    });

    // Загружаем первую вкладку (отчёты)
    loadReports();
  } catch (err) {
    console.error('Ошибка загрузки админки:', err);
    alert('Ошибка загрузки данных');
  }
});

// ====== Отчёты ======
async function loadReports() {
  const res = await fetch('/reports/list');
  const data = await res.json();
  if (data.success) {
    const tbody = document.getElementById('reportsList');
    tbody.innerHTML = '';
    data.reports.forEach(r => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${r.date}</td>
        <td>${r.cashier}</td>
        <td>${r.total}</td>
        <td><a href="/reports/${r.filename}" target="_blank">📥 Скачать</a></td>
      `;
      tbody.appendChild(row);
    });
  }
}

// ====== Склад ======
async function loadInventory() {
  const res = await fetch('/inventory/items');
  const data = await res.json();
  if (data.success) {
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';
    data.items.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price}</td>
        <td><button onclick="editItem(${item.id})">✏️</button></td>
      `;
      tbody.appendChild(row);
    });
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

// ====== Пользователи ======
async function loadUsers() {
  const res = await fetch('/admin/users');
  const data = await res.json();
  if (data.success) {
    const tbody = document.getElementById('usersList');
    tbody.innerHTML = '';
    data.users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td><button onclick="deleteUser(${user.id})">❌</button></td>
      `;
      tbody.appendChild(row);
    });
  }
}

async function deleteUser(id) {
  if (!confirm('Удалить пользователя?')) return;
  await fetch('/admin/users/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id })
  });
  loadUsers();
}

// ====== Уведомления ======
async function loadNotifications() {
  const res = await fetch('/notifications');
  const data = await res.json();
  if (data.success) {
    const list = document.getElementById('notificationsList');
    list.innerHTML = '';
    data.notifications.forEach(n => {
      const li = document.createElement('li');
      li.innerHTML = `
        <b>${n.author ?? 'система'}</b>: ${n.message}
        <br><small>${new Date(n.created_at).toLocaleString()}</small>
        ${n.url ? `<br><a href="${n.url}" target="_blank">📂 Открыть</a>` : ''}
      `;
      list.appendChild(li);
    });
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const section = document.getElementById(targetId);
      if (section) {
        section.classList.toggle('hidden');
      }
    });
  });
});
