const regForm = document.getElementById('registerForm');
const regMsg = document.getElementById('regMsg');

regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!email || !password || !confirmPassword) {
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
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      regMsg.textContent = '✅ Регистрация успешна! Теперь войдите.';
      regMsg.style.color = 'green';
      setTimeout(() => window.location.href = '/login.html', 1500);
    } else {
      regMsg.textContent = data.message || 'Ошибка регистрации';
      regMsg.style.color = 'red';
    }
  } catch (err) {
    regMsg.textContent = 'Ошибка соединения с сервером';
    regMsg.style.color = 'red';
  }
});
