document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addForm");
  const tableBody = document.querySelector("#inventoryTable tbody");
  let counter = 1;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const qty = parseInt(document.getElementById("qty").value);
    const price = parseFloat(document.getElementById("price").value);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${counter++}</td>
      <td>${name}</td>
      <td>${qty}</td>
      <td>${price.toFixed(2)}</td>
      <td>${(qty * price).toFixed(2)}</td>
      <td><button class="btn" onclick="removeRow(this)">Удалить</button></td>`;
    tableBody.appendChild(row);
    form.reset();
  });
});

function removeRow(btn) {
  btn.closest("tr").remove();
}

// Заглушки операций склада
function openReceiveForm() { alert("Окно приёмки товара (будет модальное)"); }
function openWriteOffForm() { alert("Окно списания товара (будет модальное)"); }
function openMoveForm() { alert("Окно перемещения товара (будет модальное)"); }

// Отчёты
function closeInventoryShift() {
  document.getElementById("reportResult").innerHTML =
    "<h3>Отчёт по завозу</h3><p>Функция в разработке 🔧</p>";
}
function generateInventoryReport() {
  const rows = document.querySelectorAll("#inventoryTable tbody tr");
  let total = 0;
  rows.forEach(r => total += parseFloat(r.children[4].textContent));
  document.getElementById("reportResult").innerHTML =
    `<h3>Общая стоимость склада</h3><p>${total.toFixed(2)} сом</p>`;
}
function generateStockReport() {
  const rows = document.querySelectorAll("#inventoryTable tbody tr");
  let report = "<h3>Остатки</h3><ul>";
  rows.forEach(r => {
    const name = r.children[1].textContent;
    const qty = r.children[2].textContent;
    report += `<li>${name}: ${qty} шт.</li>`;
  });
  report += "</ul>";
  document.getElementById("reportResult").innerHTML = report;
}
function generateAuditReport() {
  document.getElementById("reportResult").innerHTML =
    "<h3>Инвентаризация</h3><p>Функция в разработке 🔧</p>";
}
