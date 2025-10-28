document.addEventListener("DOMContentLoaded", () => {
  // Анимация появления блоков
  const revealElements = document.querySelectorAll(".reveal, .step, .table");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  revealElements.forEach(el => observer.observe(el));

  // Плавный скролл по якорям меню
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const targetId = link.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Динамический футер с годом и временем
  const footerInfo = document.getElementById("footer-text");
  if (footerInfo) {
    const now = new Date();
    const year = now.getFullYear();
    const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    footerInfo.textContent = `© ${year} МойБизнес | Текущее время: ${time}`;
  }
});
