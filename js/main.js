const burger = document.getElementById("burger");
const menu = document.getElementById("menu");

burger.addEventListener("click", () => {
  menu.classList.toggle("open");
  const isOpen = menu.classList.contains("open");
  burger.setAttribute("aria-expanded", String(isOpen));
});
