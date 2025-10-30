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

  const clientSearch = document.getElementById("clientSearch")
  const segmentFilter = document.getElementById("segmentFilter")

  function openModal() { clientModal.style.display = "flex" }
  function closeModal() { clientModal.style.display = "none" }

  if (addClientBtn) addClientBtn.addEventListener("click", openModal)
  if (closeClientModal) closeClientModal.addEventListener("click", closeModal)

  async function renderClients(clients) {
    clientsTable.innerHTML = ""
    clients.forEach(c => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${c.full_name}</td>
        <td>${c.phone}</td>
        <td>${c.email}</td>
        <td>${c.segment || ""}</td>
        <td>${c.bonus_points || 0}</td>
        <td>${c.total_purchases || 0}</td>
        <td>
          <button class="btn edit" data-id="${c.client_id}">✏️</button>
          <button class="btn delete" data-id="${c.client_id}">❌</button>
        </td>
      `
      clientsTable.appendChild(row)
    })

    document.querySelectorAll(".delete").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id
        if (confirm("Удалить клиента?")) {
          await fetch("/clients/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
          })
          await loadClients()
        }
      })
    })

    document.querySelectorAll(".edit").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id
        const full_name = prompt("Введите новое ФИО:")
        if (full_name) {
          await fetch("/clients/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, full_name })
          })
          await loadClients()
        }
      })
    })
  }

  async function loadClients() {
    try {
      const res = await fetch("/clients")
      if (res.ok) {
        const data = await res.json()
        renderClients(data.success ? data.clients : [])
      }
    } catch (e) {
      console.error("Ошибка загрузки клиентов", e)
    }
  }

  if (saveClient) {
    saveClient.addEventListener("click", async () => {
      const full_name = document.getElementById("cName").value.trim()
      const phone = document.getElementById("cPhone").value.trim()
      const email = document.getElementById("cEmail").value.trim()
      const segment = document.getElementById("cSegment").value

      if (!full_name || !phone || !email) {
        alert("ФИО, телефон и email обязательны")
        return
      }

      try {
        const res = await fetch("/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name, phone, email, segment })
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

  if (clientSearch || segmentFilter) {
    ;[clientSearch, segmentFilter].forEach(el => {
      if (el) el.addEventListener("input", async () => {
        const params = new URLSearchParams()
        if (clientSearch.value.trim()) params.append("full_name", clientSearch.value.trim())
        if (segmentFilter.value.trim()) params.append("segment", segmentFilter.value.trim())

        try {
          const res = await fetch(`/clients/search?${params.toString()}`)
          if (res.ok) {
            const data = await res.json()
            renderClients(data.success ? data.clients : [])
          }
        } catch (e) {
          console.error("Ошибка поиска клиентов", e)
        }
      })
    })
  }
})
