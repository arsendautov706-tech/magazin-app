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
    retail: `<h3>Розничная торговля</h3><ul><li>Кассовая программа</li><li>Учёт товаров</li><li>CRM</li><li>Финансовый учёт</li></ul>`,
    wholesale: `<h3>Оптовая торговля</h3><ul><li>Закупки и продажи</li><li>Складской учёт</li><li>Финансы</li><li>Планирование</li></ul>`,
    online: `<h3>Онлайн‑торговля</h3><ul><li>Ozon, WB, Яндекс.Маркет</li><li>Автоматизация заказов</li><li>CRM</li></ul>`,
    manufacturing: `<h3>Производство</h3><ul><li>Планирование</li><li>Учёт сырья</li><li>Себестоимость</li><li>Контроль заказов</li></ul>`
  };

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const key = card.dataset.info;
      infoBox.innerHTML = infoData[key];
      infoBox.style.display = "block";
      infoBox.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Fade-in при скролле
  const faders = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  faders.forEach(el => observer.observe(el));

  // Автоматический год в футере
  const footerText = document.getElementById("footer-text");
  if (footerText) {
    const year = new Date().getFullYear();
    footerText.textContent = `© ${year} Magazin ERP. Все права защищены.`;
  }
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
    else if (role === 'cashier') window.location.href =
const faders = document.querySelectorAll('.fade-in, .benefit-card, .adv-card, .review-card');
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 150); // задержка 150мс между элементами
    }
  });
}, { threshold: 0.2 });

faders.forEach(el => observer.observe(el));
