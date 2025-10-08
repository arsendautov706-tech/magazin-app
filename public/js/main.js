async function getMe() {
  try {
    const r = await fetch('/me', { credentials: 'same-origin' });
    return await r.json();
  } catch (e) { return { loggedIn: false }; }
}

async function initNavRole() {
  const me = await getMe();
  document.querySelectorAll('.role-dependent').forEach(el => el.style.display = 'none');
  if (!me.loggedIn) {
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'inline-block');
    return;
  }
  document.querySelectorAll('.common-auth').forEach(el => el.style.display = 'inline-block');
  if (me.user.role === 'admin') document.querySelectorAll('.role-admin').forEach(el => el.style.display = 'inline-block');
  if (me.user.role === 'cashier') document.querySelectorAll('.role-cashier').forEach(el => el.style.display = 'inline-block');
  if (me.user.role === 'worker') document.querySelectorAll('.role-worker').forEach(el => el.style.display = 'inline-block');
}

document.addEventListener('DOMContentLoaded', initNavRole);
