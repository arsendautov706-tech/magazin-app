document.addEventListener('DOMContentLoaded', () => {
  // Навигация по верхним кнопкам
  const tabs = document.querySelectorAll('.tab-content');
  const navBtns = document.querySelectorAll('.navbar .btn');

  function showTab(id) {
    tabs.forEach(tab => tab.style.display = 'none');
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      showTab(btn.dataset.tab);
    });
  });

  // По умолчанию показываем первую секцию
  showTab('features');

  // Словари деталей
  const detailData = {
    benefit: {
      retail: `<h3>Розничная торговля</h3><p>Касса, учёт товаров, CRM, финансы.</p>`,
      wholesale: `<h3>Оптовая торговля</h3><p>Закупки, дистрибьюция, складской учёт.</p>`,
      online: `<h3>Онлайн‑торговля</h3><p>Интеграция с Ozon, WB, Яндекс.Маркет.</p>`,
      manufacturing: `<h3>Производство</h3><p>Учёт сырья, себестоимость, планирование.</p>`
    },
    feature: {
      stock: `<h3>Склад</h3><p>Приход, расход, перемещения, инвентаризация.</p>`,
      crm: `<h3>CRM</h3><p>Карточки клиентов, история, задачи.</p>`,
      finance: `<h3>Финансы</h3><p>Касса, платежи, отчёты о прибыли.</p>`,
      marketplaces: `<h3>Маркетплейсы</h3><p>Импорт/экспорт заказов, синхронизация остатков.</p>`
    },
    advantage: {
      cloud: `<h3>Облако</h3><p>Доступ с любого устройства, авто‑обновления.</p>`,
      integrations: `<h3>Интеграции</h3><p>Кассы, CRM, API, webhooks.</p>`,
      analytics: `<h3>Аналитика</h3><p>Дашборды, экспорт в Excel, фильтры.</p>`,
      security: `<h3>Безопасность</h3><p>SSL, резервные копии, права доступа.</p>`
    }
  };

  // Обработчик внутренних кнопок
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const key = btn.dataset.key;
      const targetBoxId =
        type === 'benefit' ? 'benefit-detail' :
        type === 'feature' ? 'feature-detail' : 'advantage-detail';
      const box = document.getElementById(targetBoxId);
      if (!box) return;
      box.innerHTML = detailData[type][key] || '<p>Информация скоро появится.</p>';
      box.style.display = 'block';
      box.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Футер (год и время)
  const footerText = document.getElementById("footer-text");
  if (footerText) {
    const now = new Date();
    const year = now.getFullYear();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    footerText.textContent = `© ${year} Magazin ERP | Текущее время: ${time}`;
  }
});
