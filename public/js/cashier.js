let cart = [];
let returnCart = [];
let shiftOpen = false;

document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/session');
  const data = await res.json();
  if (!data.success || data.user.role !== 'cashier') {
    return (window.location.href = '/login.html');
  }

  const burgerBtn = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  burgerBtn.addEventListener('click', () => nav.classList.toggle('active'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('active'));

  document.querySelectorAll('nav .btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  document.getElementById('searchBox').addEventListener('input', liveSearch);
  document.getElementById('barcodeBox').addEventListener('input', liveSearch);
  document.getElementById('categoryFilter').addEventListener('change', liveSearch);
  document.getElementById('printReceipt').addEventListener('click', submitReceipt);
  document.getElementById('openShift').addEventListener('click', openShift);
  document.getElementById('closeShift').addEventListener('click', closeShift);
  document.getElementById('loadReceipt').addEventListener('click', loadReceiptForReturn);
  document.getElementById('submitReturn').addEventListener('click', submitReturn);
});

async function liveSearch() {
  const query = document.getElementById('searchBox').value.trim();
  const barcode = document.getElementById('barcodeBox').value.trim();
  const category = document.getElementById('categoryFilter').value;
  const tbody = document.getElementById('searchResults');

  if (!query && !barcode && !category) {
    tbody.innerHTML = '';
    return;
  }

  const res = await fetch(`/inventory/search?q=${encodeURIComponent(query)}&barcode=${barcode}&cat=${category}`);
  const data = await res.json();
  if (!data.success || !data.products) return;

  tbody.innerHTML = '';
  data.products.forEach(p => {
    const row = document.createElement('tr');
    const lowStock = p.quantity < 5 ? 'style="color:#ff5e62;font-weight:bold;"' : '';
    row.innerHTML = `
      <td ${lowStock}>${p.name}</td>
      <td>${p.quantity}</td>
      <td>${p.price}</td>
      <td><button class="btn" onclick="addToCart(${p.id}, '${p.name}', ${p.price}, ${p.quantity})">➕</button></td>`;
    tbody.appendChild(row);
  });
}

function addToCart(id, name, price, stock) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    if (existing.qty < stock) existing.qty++;
    else return showToast('Недостаточно товара', 'error');
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
      <td><input type="number" min="1" max="${item
              <td><input type="number" min="1" max="${item.stock}" value="${item.qty}" onchange="updateQty(${index}, this.value)"></td>
      <td>${item.price}</td>
      <td>${sum.toFixed(2)}</td>
      <td><button class="btn" onclick="removeItem(${index})">❌</button></td>`;
    tbody.appendChild(row);
  });

  const discount = parseFloat(document.getElementById('discount').value) || 0;
  if (discount > 0) total = total * (1 - discount / 100);
  document.getElementById('cartTotal').innerText = total.toFixed(2);
}

function updateQty(index, newQty) {
  newQty = parseInt(newQty);
  if (newQty > 0 && newQty <= cart[index].stock) {
    cart[index].qty = newQty;
    renderCart();
  } else {
    showToast('Неверное количество', 'error');
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

function openShift() {
  if (shiftOpen) return showToast('Смена уже открыта');
  shiftOpen = true;
  showToast('Смена открыта');
}

async function closeShift() {
  if (!shiftOpen) return showToast('Смена не открыта', 'error');
  const res = await fetch('/reports/close-shift', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const data = await res.json();
  if (data.success) {
    shiftOpen = false;
    showToast(`Смена закрыта. Чеков: ${data.count}, сумма: ${data.total} сом`);
    if (data.fileUrl) window.open(data.fileUrl, '_blank');
  } else {
    showToast('Ошибка: ' + data.message, 'error');
  }
}

async function submitReceipt() {
  if (!shiftOpen) return showToast('Смена не открыта', 'error');
  if (cart.length === 0) return showToast('Чек пуст', 'error');
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const paymentMethod = document.getElementById('paymentMethod').value;

  const res = await fetch('/sales/receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart, discount, paymentMethod })
  });
  const data = await res.json();
  if (data.success) {
    showToast(`Чек пробит. Сумма: ${data.total}`);
    if (data.fileUrl) window.open(data.fileUrl, '_blank');
    cart = [];
    renderCart();
  } else {
    showToast('Ошибка: ' + data.message, 'error');
  }
}

async function loadReceiptForReturn() {
  const number = document.getElementById('receiptNumber').value.trim();
  if (!number) return showToast('Введите номер чека', 'error');

  const res = await fetch(`/sales/receipt/${encodeURIComponent(number)}`);
  const data = await res.json();
  if (!data.success) return showToast('Чек не найден', 'error');

  returnCart = data.items.map(i => ({
    id: i.id,
    name: i.name,
    price: i.price,
    qty: i.qty,
    maxQty: i.qty
  }));
  renderReturnCart();
}

function renderReturnCart() {
  const tbody = document.getElementById('returnItems');
  tbody.innerHTML = '';
  let total = 0;
  returnCart.forEach((item, index) => {
    const sum = item.qty * item.price;
    total += sum;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.maxQty}</td>
      <td><input type="number" min="0" max="${item.maxQty}" value="${item.qty}" onchange="updateReturnQty(${index}, this.value)"></td>
      <td>${item.price}</td>
      <td>${sum.toFixed(2)}</td>
      <td><button class="btn" onclick="removeReturnItem(${index})">❌</button></td>`;
    tbody.appendChild(row);
  });
  document.getElementById('returnTotal').innerText = total.toFixed(2);
}

function updateReturnQty(index, value) {
  const qty = parseInt(value);
  if (qty >= 0 && qty <= returnCart[index].maxQty) {
    returnCart[index].qty = qty;
    renderReturnCart();
  }
}

function removeReturnItem(index) {
  returnCart.splice(index, 1);
  renderReturnCart();
}

async function submitReturn() {
  if (returnCart.length === 0) return showToast('Нет товаров к возврату', 'error');

  const res = await fetch('/sales/return', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: returnCart })
  });

  const data = await res.json();
  if (data.success) {
    showToast(`Возврат проведён. Сумма: ${data.total}`);
    if (data.fileUrl) window.open(data.fileUrl, '_blank');
    returnCart = [];
    renderReturnCart();
  } else {
    showToast('Ошибка: ' + data.message, 'error');
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.innerHTML = message;
  toast.style.cssText = `
    background:${type==='success'?'#4caf50':type==='error'?'#f44336':'#2196f3'};
    color:#fff;padding:12px 20px;margin-top:10px;border-radius:6px;
    box-shadow:0 2px 6px rgba(0,0,0,0.2);font-size:14px;animation:fadeInOut 4s forwards;`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

const style = document.createElement('style');
style.innerHTML = `@keyframes fadeInOut {0%{opacity:0;transform:translateY(-10px)}10%{opacity:1;transform:translateY(0)}90%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}`;
document.head.appendChild(style);
