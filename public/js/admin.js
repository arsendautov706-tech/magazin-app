document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-content")
  const navBtns = document.querySelectorAll("#mainNav .btn")
  const burgerBtn = document.getElementById("burgerBtn")
  const mainNav = document.getElementById("mainNav")

  function showTab(id) {
    tabs.forEach(tab => tab.classList.remove("active"))
    const target = document.getElementById(id)
    if (target) target.classList.add("active")
    navBtns.forEach(btn => btn.classList.remove("active"))
    const activeBtn = document.querySelector(`#mainNav .btn[data-tab="${id}"]`)
    if (activeBtn) activeBtn.classList.add("active")
    if (id === "crm") loadClients()
  }

  navBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault()
      const id = btn.dataset.tab
      if (id) showTab(id)
    })
  })

  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      mainNav.classList.toggle("open")
    })
  }

  const addClientBtn = document.getElementById("addClientBtn")
  const clientModal = document.getElementById("clientModal")
  const closeClientModal = document.getElementById("closeClientModal")
  const saveClient = document.getElementById("saveClient")
  const clientsTable = document.getElementById("clientsTable")

  function openModal() {
    clientModal.style.display = "flex"
  }
  function closeModal() {
    clientModal.style.display = "none"
  }

  if (addClientBtn) addClientBtn.addEventListener("click", openModal)
  if (closeClientModal) closeClientModal.addEventListener("click", closeModal)

  async function loadClients() {
    try {
      const res = await fetch("/clients")
      if (res.ok) {
        const data = await res.json()
        clientsTable.innerHTML = ""
        data.forEach(c => {
          const row = document.createElement("tr")
          row.innerHTML = `
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.email}</td>
            <td>${c.segment || ""}</td>
            <td>${c.bonuses || 0}</td>
            <td>${c.purchases || 0}</td>
            <td></td>
          `
          clientsTable.appendChild(row)
        })
      }
    } catch (e) {
      console.error("Ошибка загрузки клиентов", e)
    }
  }

  if (saveClient) {
    saveClient.addEventListener("click", async () => {
      const name = document.getElementById("cName").value.trim()
      const phone = document.getElementById("cPhone").value.trim()
      const email = document.getElementById("cEmail").value.trim()
      const segment = document.getElementById("cSegment").value

      if (!name || !phone || !email) {
        alert("Имя, телефон и email обязательны")
        return
      }

      try {
        const res = await fetch("/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, segment })
        })
        if (res.ok) {
          await loadClients()
          closeModal()
        } else {
          alert("Ошибка при сохранении клиента")
        }
      } catch (e) {
        console.error("Ошибка запроса", e)
      }
    })
  }
})
