document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;

    if (!username || !password || !role) return alert('Заполните все поля');

    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ Пользователь создан, теперь войдите');
      window.location.href = '/login.html';
    } else {
      alert('❌ Ошибка регистрации: ' + (data.message || ''));
    }
  });
});
