document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username || !email || !password) {
      return alert('⚠️ Заполните все поля');
    }

    if (!emailRegex.test(email)) {
      return alert('⚠️ Введите корректный email');
    }

    if (password.length < 6) {
      return alert('⚠️ Пароль должен быть не менее 6 символов');
    }

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Пользователь зарегистрирован');
        window.location.href = '/login.html';
      } else {
        alert('❌ Ошибка: ' + (data.message || 'Не удалось зарегистрировать'));
      }
    } catch (err) {
      alert('⚠️ Ошибка сети: ' + err.message);
    }
  });
});
