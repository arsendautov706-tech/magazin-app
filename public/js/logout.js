document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('logoutBtn');
  if (btn) btn.addEventListener('click', async () => {
    try {
      const res = await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type':'application/json'}
      });
      if (res.ok) {
        window.location.href = '/login.html';
        return;
      }
      alert('Ошибка выхода');
    } catch (err) {
      console.error('Logout error', err);
      window.location.href = '/login.html';
    }
  });
});
