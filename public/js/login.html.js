document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('email') || {}).value || '';
    const password = (document.getElementById('password') || {}).value || '';

    try {
      const res = await fetch('/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      let payload;
      try { payload = await res.json(); } catch (err) { payload = null; }

      if (!res.ok) {
        const msg = payload && payload.message ? payload.message : `Ошибка ${res.status}`;
        alert(msg);
        return;
      }

      if (payload && payload.success) {
        // redirect by role (server returns user with role)
        const role = payload.user && payload.user.role;
        if (role === 'admin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/cashier.html';
        }
      } else {
        alert((payload && payload.message) || 'Ошибка входа');
      }
    } catch (err) {
      console.error('Login fetch failed', err);
      alert('Сетeвая ошибка. Проверьте, запущен ли сервер и доступен ли http://localhost:3000');
    }
  });
});
