document.addEventListener('DOMContentLoaded', () => {
  // Навигация по вкладкам
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

  showTab('features'); // по умолчанию показываем "Возможности"

  // Полные тексты для кнопок
  const detailData = {
    feature: {
      stock: `
        <h3>📦 Учёт товаров и складские операции</h3>
        <p>Автоматизируйте склад, контролируйте остатки и движение товаров в реальном времени.</p>
        <ul>
          <li>Приёмка и списание</li>
          <li>Инвентаризация</li>
          <li>История движения</li>
        </ul>
      `,
      crm: `
        <h3>🤝 CRM для работы с клиентами</h3>
        <p>Ведите базу клиентов, фиксируйте сделки и стройте долгосрочные отношения.</p>
        <ul>
          <li>Карточки клиентов</li>
          <li>История взаимодействий</li>
          <li>Напоминания и задачи</li>
        </ul>
      `,
      finance: `
        <h3>💰 Финансовый учёт и отчёты</h3>
        <p>Отслеживайте доходы, расходы и формируйте отчёты для руководства и налоговой.</p>
        <ul>
          <li>Доходы и расходы</li>
          <li>Баланс и касса</li>
          <li>Экспорт отчётов</li>
        </ul>
      `,
      marketplaces: `
        <h3>🛒 Интеграция с маркетплейсами</h3>
        <p>Подключайте Wildberries, Ozon и другие площадки для синхронизации заказов и остатков.</p>
        <ul>
          <li>Автоматическая синхронизация</li>
          <li>Загрузка заказов</li>
          <li>Обновление остатков</li>
        </ul>
      `
    },
    benefit: {
      retail: `
        <h3>🏬 Розничная торговля</h3>
        <p>Полный контроль над остатками и продажами.</p>
        <ul>
          <li>Управление кассами</li>
          <li>Скидки и акции</li>
          <li>Учёт возвратов</li>
        </ul>
      `,
      wholesale: `
        <h3>📦 Оптовая торговля</h3>
        <p>Прозрачный складской учёт и быстрые отгрузки.</p>
        <ul>
          <li>Прайс‑листы</li>
          <li>Гибкие условия оплаты</li>
          <li>Управление заказами</li>
        </ul>
      `,
      online: `
        <h3>🛒 Онлайн‑торговля</h3>
        <p>Интеграции с маркетплейсами и удобная CRM.</p>
        <ul>
          <li>Синхронизация заказов</li>
          <li>Управление доставкой</li>
          <li>Поддержка онлайн‑оплаты</li>
        </ul>
      `,
      manufacturing: `
        <h3>🏭 Производство</h3>
        <p>Планирование ресурсов, контроль сырья и готовой продукции.</p>
        <ul>
          <li>Учёт сырья</li>
          <li>Технологические карты</li>
          <li>Контроль себестоимости</li>
        </ul>
      `
    },
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

  // Обработчики для внутренних кнопок
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

  // Футер с динамическим временем
  const footerText = document.getElementById("footer-text");
  if (footerText) {
    const now = new Date();
    const year = now.getFullYear();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    footerText.textContent = `© ${year} Magazin ERP | Текущее время: ${time}`;
  }
});
