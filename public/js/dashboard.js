document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/session', { credentials: 'include' });
    const data = await res.json();

    if (!data.success) {
      window.location.href = '/login.html';
      return;
    }

    const { username, role } = data.user;
    document.getElementById('welcomeText').innerText =
      `Добро пожаловать, ${username}! Ваша роль: ${role}`;

    const stats = await fetch('/dashboard/stats', { credentials: 'include' });
    const statData = await stats.json();
    if (statData.success) {
      document.getElementById('statsBox').innerHTML = `
        <div class="notif">
          <div class="left">
            <div class="msg">📦 Товаров</div>
            <div class="sub">${statData.products}</div>
          </div>
        </div>
        <div class="notif">
          <div class="left">
            <div class="msg">🧾 Продаж</div>
            <div class="sub">${statData.sales}</div>
          </div>
        </div>
        <div class="notif">
          <div class="left">
            <div class="msg">📑 Отчётов</div>
            <div class="sub">${statData.reports}</div>
          </div>
        </div>
      `;
    }
  } catch {
    alert('Ошибка загрузки панели');
  }

  const statsBtn = document.getElementById('loadStats');
  const statsBox = document.getElementById('statsBox');
  const chartCanvas = document.getElementById('statsChart');
  const toast = document.getElementById('toast');

  statsBtn.addEventListener('click', async () => {
    statsBox.innerHTML = '📡 Загружаем статистику...';

    try {
      const res = await fetch('/admin/stats');
      const data = await res.json();

      if (data.success) {
        statsBox.innerHTML = `
          <h3>📊 Статистика</h3>
          <ul style="list-style:none; padding:0; font-size:16px">
            <li>👥 Всего пользователей: <b>${data.totalUsers}</b></li>
            <li>📦 Всего товаров: <b>${data.totalItems}</b></li>
            <li>💰 Продаж сегодня: <b>${data.salesToday}</b></li>
            <li>🔔 Оповещений: <b>${data.notifications}</b></li>
          </ul>
        `;

        new Chart(chartCanvas, {
          type: 'bar',
          data: {
            labels: ['Пользователи', 'Товары', 'Продажи сегодня', 'Оповещения'],
            datasets: [{
              label: 'Статистика',
              data: [
                data.totalUsers,
                data.totalItems,
                data.salesToday,
                data.notifications
              ],
              backgroundColor: ['#4bc0c0', '#36a2eb', '#ffcd56', '#ff6384'],
              borderRadius: 5
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: '📊 Общая статистика',
                color: '#fff',
                font: { size: 18 }
              }
            },
            scales: {
              x: { ticks: { color: '#fff' } },
              y: { ticks: { color: '#fff' } }
            }
          }
        });

        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      } else {
        statsBox.innerHTML = '❌ Не удалось загрузить статистику';
      }
    } catch (err) {
      statsBox.innerHTML = '⚠️ Ошибка сети';
    }
  });
});
