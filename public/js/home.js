document.addEventListener('DOMContentLoaded', () => {
  // Навигация по кнопкам
  const tabs = document.querySelectorAll('.tab-content');
  const navBtns = document.querySelectorAll('.navbar .btn');

  function showTab(id) {
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(id).style.display = 'block';
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      showTab(btn.dataset.tab);
    });
  });

  // По умолчанию показываем первую секцию
  showTab('features');

  // Автоматический год и время в футере
  const footerText = document.getElementById("footer-text");
  if (footerText) {
    const now = new Date();
    const year = now.getFullYear();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    footerText.textContent = `© ${year} Magazin ERP | Текущее время: ${time}`;
  }
});
