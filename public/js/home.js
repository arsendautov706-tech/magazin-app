document.addEventListener('DOMContentLoaded', () => {
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

  showTab('features');

  const detailData = {
    advantage: {
      cloud: `
        <h3>☁️ Работа из облака</h3>
        <p>Magazin ERP доступен с любого устройства.</p>
        <ul>
          <li>Автоматические обновления</li>
          <li>Резервное копирование</li>
          <li>Масштабируемость</li>
        </ul>
      `,
      integrations: `
        <h3>🔗 Интеграции</h3>
        <p>Соединение с внешними сервисами:</p>
        <ul>
          <li>Кассы и онлайн‑оплата</li>
          <li>CRM и бухгалтерия</li>
          <li>Маркетплейсы и API</li>
        </ul>
      `,
      analytics: `
        <h3>📊 Отчёты и аналитика</h3>
        <p>Полная картина бизнеса:</p>
        <ul>
          <li>Дашборды KPI</li>
          <li>Экспорт в Excel/CSV</li>
          <li>Фильтры и сегменты</li>
        </ul>
      `,
      security: `
        <h3>🔒 Безопасность</h3>
        <p>Ваши данные под защитой:</p>
        <ul>
          <li>SSL‑шифрование</li>
          <li>Резервные копии</li>
          <li>Роли и права доступа</li>
        </ul>
      `
    }
  };

  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const key = btn.dataset.key;

      const targetBoxId =
        type === 'benefit' ? 'benefit-detail' :
        type === 'feature' ? 'feature-detail' : 'advantage-detail';

      const box = document.getElementById(targetBoxId);
      const parentSection = btn.closest('.tab-content');

      if (box.dataset.active === key) {
        parentSection.querySelector('.btn-group').style.display = 'flex';
        box.innerHTML = '';
        box.style.display = 'none';
        box.dataset.active = '';
      } else {
        parentSection.querySelector('.btn-group').style.display = 'none';
        box.innerHTML = detailData[type]?.[key] || '<p>Информация скоро появится.</p>';
        box.style.display = 'block';
        box.dataset.active = key;
      }
    });
  });

  const footerText = document.getElementById("footer-text");
  if (footerText) {
    const now = new Date();
    const year = now.getFullYear();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    footerText.textContent = `© ${year} Magazin ERP | Текущее время: ${time}`;
  }
});
