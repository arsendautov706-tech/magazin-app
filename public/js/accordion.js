const accordions = document.querySelectorAll(".accordion");
accordions.forEach(btn => {
  btn.addEventListener("click", () => {
    accordions.forEach(b => {
      if (b !== btn) {
        b.classList.remove("active");
        b.nextElementSibling.style.display = "none";
      }
    });
    btn.classList.toggle("active");
    let panel = btn.nextElementSibling;
    panel.style.display = (panel.style.display === "block") ? "none" : "block";
  });
});
