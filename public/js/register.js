const regForm = document.getElementById('registerForm');
const regMsg = document.getElementById('regMsg');

regForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const role = document.getElementById('role').value;

  if (!username || !email || !password || !confirmPassword) {
    regMsg.textContent = '❌ Заполните все поля';
    regMsg.style.color = 'red';
    return;
  }

  if (password !== confirmPassword) {
    regMsg.textContent = '❌ Пароли не совпадают';
    regMsg.style.color = 'red';
    return;
  }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });

    const data = await res.json();

    if (data.success) {
      regMsg.textContent = '✅ Регистрация успешна! Сейчас вы будете перенаправлены...';
      regMsg.style.color = 'green';
      setTimeout(() => window.location.href = '/login.html', 1500);
    } else {
      regMsg.textContent = data.message || 'Ошибка регистрации';
      regMsg.style.color = 'red';
    }
  } catch {
    regMsg.textContent = 'Ошибка соединения с сервером';
    regMsg.style.color = 'red';
  }
});
