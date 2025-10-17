document.addEventListener('DOMContentLoaded', () => {
  // Проверка сессии
  fetch('/session')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log("Пользователь:", data.user.username, "роль:", data.user.role);
      }
    });

  // Роли
  const btnAdmin = document.getElementById("btn-admin");
  const btnCashier = document.getElementById("btn-cashier");
  const btnWorker = document.getElementById("btn-worker");

  if (btnAdmin) btnAdmin.addEventListener("click", () => goToPanel("admin"));
  if (btnCashier) btnCashier.addEventListener("click", () => goToPanel("cashier"));
  if (btnWorker) btnWorker.addEventListener("click", () => goToPanel("worker"));

  // Кому выгодно
  const cards = document.querySelectorAll(".benefit-card");
  const infoBox = document.getElementById("benefit-info");

  const infoData = {
    retail: `
      <h3>Розничная торговля</h3>
      <ul>
        <li>Кассовая программа с поддержкой 54‑ФЗ</li>
        <li>Учёт товаров и остатков</li>
        <li>CRM для клиентов</li>
        <li>Финансовый учёт</li>
      </ul>
    `,
    wholesale: `
      <h3>Оптовая торговля</h3>
      <ul>
        <li>Закупки и продажи</li>
        <li>Складской учёт</li>
        <li>Контроль финансов</li>
        <li>Планирование и аналитика</li>
      </ul>
    `,
    online: `
      <h3>Онлайн‑торговля</h3>
      <ul>
        <li>Интеграция с Ozon, WB, Яндекс.Маркет</li>
        <li>Автоматизация заказов</li>
        <li>Управление доставкой</li>
        <li>CRM для онлайн‑клиентов</li>
      </ul>
    `,
    manufacturing: `
      <h3>Производство</h3>
      <ul>
        <li>Планирование производства</li>
        <li>Учёт сырья и материалов</li>
        <li>Расчёт себестоимости</li>
        <li>Контроль выполнения заказов</li>
      </ul>
    `
  };

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const key = card.dataset.info;
      infoBox.innerHTML = infoData[key];
      infoBox.style.display = "block";
      infoBox.scrollIntoView({ behavior: "smooth" });
    });
  });
});

// Функция перехода в панель
async function goToPanel(targetRole) {
  try {
    const res = await fetch('/session');
    const data = await res.json();
    if (!data.success) return window.location.href = '/login.html';

    const { role } = data.user;
    if (role !== targetRole) {
      return alert(`⛔ У вас нет доступа к роли "${targetRole}"`);
    }

    if (role === 'admin') window.location.href = '/admin.html';
    else if (role === 'cashier') window.location.href = '/cashier.html';
    else if (role === 'worker') window.location.href = '/worker.html';
  } catch (err) {
    console.error(err);
  }
}
