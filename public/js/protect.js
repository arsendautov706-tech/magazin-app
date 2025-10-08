// Защищает страницы: проверяет /session и data-role атрибут в <html>
(async function(){
  const html = document.documentElement;
  const requiredRole = html && html.getAttribute && html.getAttribute('data-role');
  if (!requiredRole) return;
  try {
    const r = await fetch('/session', { credentials: 'include' });
    if (!r.ok) {
      window.location.href = '/login.html';
      return;
    }
    const j = await r.json().catch(()=>null);
    if (!j || !j.success || !j.user) {
      window.location.href = '/login.html';
      return;
    }
    const role = j.user.role;
    // role can be admin, worker, cashier
    if ((requiredRole === 'admin' && role !== 'admin') ||
        (requiredRole === 'worker' && role !== 'worker') ||
        (requiredRole === 'cashier' && role !== 'cashier')) {
      // not authorized for this page
      window.location.href = '/';
      return;
    }
    // user ok — continue
    window.__CURRENT_USER = j.user;
  } catch (e) {
    console.error('protect error', e);
    window.location.href = '/login.html';
  }
})();
