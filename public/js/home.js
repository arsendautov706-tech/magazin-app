document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const target = document.getElementById(targetId);

    if (target.classList.contains('show')) {
      target.classList.remove('show');
    } else {
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('show'));
      target.classList.add('show');
    }
  });
});
