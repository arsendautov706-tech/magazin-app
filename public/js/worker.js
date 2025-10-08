document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/session', { credentials: 'include' });
    const j = await res.json();

    if (!res.ok || !j?.success || (j.user.role !== 'worker' && j.user.role !== 'admin')) {
      window.location.href = '/login.html';
      return;
    }

    loadInventory();
  } catch {
    alert('Ошибка загрузки панели сотрудника');
  }
});

async function loadInventory() {
  try {
    const res = await fetch('/inventory/items', { credentials: 'include' });
    if (!res.ok) throw new Error('Ошибка загрузки склада');
    const data = await res.json();

    const tbody = document.querySelector('#inventoryTable tbody');
    if (!tbody) {
      const table = document.getElementById('inventoryTable');
      table.innerHTML = '<tbody></tbody>';
    }

    const finalTbody = document.querySelector('#inventoryTable tbody');
    finalTbody.innerHTML = '';

    data.items.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price}</td>
        <td>${item.sku ?? '-'}</td>
        <td>
          <input type="number" id="qty_${item.id}" placeholder="Δ кол-во" style="width:70px">
          <input type="number" id="price_${item.id}" placeholder="новая цена" style="width:90px">
          <button onclick="updateItem(${item.id})">Обновить</button>
        </td>
      `;
      finalTbody.appendChild(row);
    });
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
}

async function updateItem(productId) {
  const qty = parseInt(document.getElementById(`qty_${productId}`).value) || 0;
  const price = parseFloat(document.getElementById(`price_${productId}`).value);

  if (!qty && !price) {
    alert('Введите количество или цену');
    return;
  }

  try {
    const res = await fetch('/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ product_id: productId, delta: qty, price: price || undefined })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Ошибка обновления');
    alert('✅ Товар обновлён');
    loadInventory();
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
}

async function generateInventoryReport() {
  try {
    const res = await fetch('/inventory/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await res.json();
    const box = document.getElementById('reportResult');
    if (data.success) {
      box.innerHTML = `✅ Отчёт создан. Общая стоимость склада: ${data.totalValue}`;
    } else {
      box.innerHTML = `❌ Ошибка: ${data.message}`;
    }
  } catch (e) {
    alert('Ошибка отчёта: ' + e.message);
  }
}

async function closeInventoryShift() {
  try {
    const res = await fetch('/api/close-shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cashier: 'worker' })
    });

    const data = await res.json();
    const box = document.getElementById('reportResult');

    if (data.success && data.file) {
      box.innerHTML = `<a href="${data.file}" target="_blank">📑 Скачать отчёт</a>`;
    } else {
      box.innerText = '❌ Ошибка при формировании отчёта';
    }
  } catch (e) {
    document.getElementById('reportResult').innerText = '❌ Ошибка: ' + e.message;
  }
}

document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const qty = document.getElementById('qty').value;
  const price = document.getElementById('price').value;

  const res = await fetch('/api/inventory/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, qty, price })
  });

  const data = await res.json();
  alert(data.message);
});
