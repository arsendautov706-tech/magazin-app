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
const buttons = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.tab-content');
const defaultText = document.getElementById('default-text');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const target = document.getElementById(targetId);

    if (target.classList.contains('show')) {
      target.classList.remove('show');
      defaultText.style.display = 'block';
    } else {
      sections.forEach(s => s.classList.remove('show'));
      target.classList.add('show');
      defaultText.style.display = 'none';
    }
  });
});

