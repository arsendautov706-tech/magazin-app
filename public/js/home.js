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
      panelBtn.addEventListener('click', () => {
        goToPanel(role);
      });
      document.querySelector('.container')?.appendChild(panelBtn);
    } else {
      console.log('👤 Гость: остаётся на home.html');
    }
  } catch (err) {
    console.error('Ошибка проверки сессии:', err);
  }

  // Подгружаем инвентарь
  loadInventory();

  // Навешиваем обработчики на кнопки ролей
  const btnAdmin = document.getElementById("btn-admin");
  const btnCashier = document.getElementById("btn-cashier");
  const btnWorker = document.getElementById("btn-worker");

  if (btnAdmin) btnAdmin.addEventListener("click", () => goToPanel("admin"));
  if (btnCashier) btnCashier.addEventListener("click", () => goToPanel("cashier"));
  if (btnWorker) btnWorker.addEventListener("click", () => goToPanel("worker"));
});

// ===== Функции =====

function logout() {
  window.location.href = '/logout';
}

function toggleInventory() {
  const box = document.getElementById('inventoryBox');
  if (box) {
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }
}

async function loadInventory() {
  try {
    const res = await fetch('/inventory/items');
    const data = await res.json();
    if (data.success) {
      const tbody = document.querySelector('#inventoryTable tbody');
      if (tbody) {
        tbody.innerHTML = '';
        data.items.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
            <td>${item.sku}</td>
          `;
          tbody.appendChild(row);
        });
      }
    }
  } catch (err) {
    console.error('Ошибка загрузки инвентаря:', err);
  }
}

async function loadUsers() {
  try {
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
            <td><button class="delete-btn" data-id="${user.id}">❌</button></td>
          `;
          tbody.appendChild(row);
        });

        // навешиваем события на кнопки удаления
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            deleteUser(btn.dataset.id);
          });
        });
      }
    }
  } catch (err) {
    console.error('Ошибка загрузки пользователей:', err);
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
