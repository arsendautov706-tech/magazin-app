document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/session');
    const data = await res.json();

    if (data.success) {
      const { username, role } = data.user;

      // Приветствие
      const welcome = document.createElement('div');
      welcome.innerHTML = `👋 Добро пожаловать, <b>${username}</b>!`;
      welcome.style.marginBottom = '20px';
      welcome.style.fontSize = '18px';
      welcome.style.textAlign = 'center';
      document.querySelector('.container')?.prepend(welcome);

      // Кнопка перехода в панель
      const panelBtn = document.createElement('button');
      panelBtn.innerText = 'Перейти в панель';
      panelBtn.style.marginTop = '10px';
      panelBtn.onclick = () => {
        if (role === 'admin') window.location.href = '/admin.html';
        else if (role === 'cashier') window.location.href = '/cashier.html';
        else if (role === 'worker') window.location.href = '/worker.html';
        else window.location.href = '/';
      };
      document.querySelector('.container')?.appendChild(panelBtn);
    } else {
      console.log('👤 Гость: остаётся на home.html');
    }
  } catch (err) {
    console.error('Ошибка проверки сессии:', err);
  }

  // Твои функции — не трогаем
  loadInventory();
});

function logout() {
  window.location.href = '/logout';
}

function toggleInventory() {
  const box = document.getElementById('inventoryBox');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

async function loadInventory() {
  const res = await fetch('/inventory/items');
  const data = await res.json();
  if (data.success) {
    const tbody = document.querySelector('#inventoryTable tbody');
    if (tbody) {
      tbody.innerHTML = '';
      data.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${item.name}</td><td>${item.quantity}</td><td>${item.price}</td><td>${item.sku}</td>`;
        tbody.appendChild(row);
      });
    }
  }
}

async function loadUsers() {
  const res = await fetch('/admin/users');
  const data = await res.json();
  if (data.success) {
    const tbody = document.querySelector('#userTable tbody');
    if (tbody) {
      tbody.innerHTML = '';
      data.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td><button onclick="deleteUser(${user.id})">❌</button></td>
        `;
        tbody.appendChild(row);
      });
    }
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
async function goToPanel(targetRole) {
  try {
    const res = await fetch('/session');
    const data = await res.json();

    if (!data.success) {
      alert('Сначала войдите в систему');
      return window.location.href = '/login.html';
    }

    const { role } = data.user;
    if (role !== targetRole) {
      alert(`⛔ У вас нет доступа к роли "${targetRole}"`);
      return;
    }

    // Всё ок — переходим
    if (role === 'admin') window.location.href = '/admin.html';
    else if (role === 'cashier') window.location.href = '/cashier.html';
    else if (role === 'worker') window.location.href = '/worker.html';
  } catch (err) {
    console.error('Ошибка перехода:', err);
    alert('Ошибка сети');
  }
}
