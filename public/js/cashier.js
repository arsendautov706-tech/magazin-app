let cart = [];

document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/session');
  const data = await res.json();
  if (!data.success || data.user.role !== 'cashier') {
    return window.location.href = '/login.html';
  }
  document.getElementById('searchBox').addEventListener('input', liveSearch);
  document.getElementById('printReceipt').addEventListener('click', submitReceipt);
  document.getElementById('closeShift').addEventListener('click', closeShift);
});

async function liveSearch(e) {
  const query = e.target.value.trim();
  const tbody = document.getElementById('searchResults');
  if (!query) {
    tbody.innerHTML = '';
    return;
  }
  const res = await fetch(`/inventory/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!data.success || !data.products) return;
  tbody.innerHTML = '';
  data.products.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.name}</td>
      <td>${p.quantity}</td>
      <td>${p.price}</td>
      <td><button onclick="addToCart(${p.id}, '${p.name}', ${p.price}, ${p.quantity})">➕</button></td>
    `;
    tbody.appendChild(row);
  });
}

function addToCart(id, name, price, stock) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    if (existing.qty < stock) existing.qty++;
    else return alert('Недостаточно товара на складе');
  } else {
    cart.push({ id, name, price, qty: 1, stock });
  }
  renderCart();
}

function renderCart() {
  const tbody = document.getElementById('cartItems');
  tbody.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    const sum = item.qty * item.price;
    total += sum;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <input type="number" min="1" max="${item.stock}" value="${item.qty}" 
               onchange="updateQty(${index}, this.value)">
      </td>
      <td>${item.price}</td>
      <td>${sum.toFixed(2)}</td>
      <td><button onclick="removeItem(${index})">❌</button></td>
    `;
    tbody.appendChild(row);
  });
  document.getElementById('cartTotal').innerText = total.toFixed(2);
}

function updateQty(index, newQty) {
  newQty = parseInt(newQty);
  if (newQty > 0 && newQty <= cart[index].stock) {
    cart[index].qty = newQty;
    renderCart();
  } else {
    alert('Неверное количество');
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

async function submitReceipt() {
  if (cart.length === 0) return alert('Чек пуст');
  const res = await fetch('/sales/receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart })
  });
  const data = await res.json();
  if (data.success) {
    alert('✅ Чек пробит. Сумма: ' + data.total);
    if (data.fileUrl) window.open(data.fileUrl, '_blank');
    cart = [];
    renderCart();
  } else {
    alert('❌ Ошибка при отправке: ' + data.message);
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.innerHTML = message;
  toast.style.cssText = `
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
    color: white;
    padding: 12px 20px;
    margin-top: 10px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    font-size: 14px;
    animation: fadeInOut 4s forwards;
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-10px); }
}`;
document.head.appendChild(style);

async function closeShift() {
  try {
    const res = await fetch('/reports/close-shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
    const data = await res.json();
    if (data.success) {
      showToast(`✅ Смена закрыта<br>Чеков: ${data.count}, сумма: ${data.total} сом<br>
        <a href="${data.fileUrl}" target="_blank" style="color:#fff;text-decoration:underline;">📥 Скачать отчёт</a>`);
    } else {
      showToast('❌ Ошибка: ' + data.message, 'error');
    }
  } catch (err) {
    console.error('Ошибка закрытия смены:', err);
    showToast('❌ Не удалось закрыть смену. Проверь сервер.', 'error');
  }
}
