const animals = document.querySelectorAll(".animal");
const zones = document.querySelectorAll(".zone");
const resetBtn = document.getElementById("resetBtn");
const container = document.querySelector(".animals");

let dragged = null;
let offsetX = 0;
let offsetY = 0;

/* ===== СЛУЧАЙНЫЕ ПОЗИЦИИ + СЛУЧАЙНЫЙ УГОЛ ===== */
function randomizePositions() {
  animals.forEach(item => {
    const x = Math.random() * 250;
    const y = Math.random() * 200;

    // стартовый угол ЛЮБОЙ
    const angle = Math.floor(Math.random() * 121) - 60;

    item.style.left = x + "px";
    item.style.top = y + "px";
    item.style.transform = `rotate(${angle}deg)`;
    item.dataset.rotate = angle;

    item.style.pointerEvents = "auto";
    item.style.zIndex = 1;
  });
}

randomizePositions();

/* ===== ПЕРЕТАСКИВАНИЕ ===== */
animals.forEach(item => {

  item.addEventListener("mousedown", e => {
    e.preventDefault(); // убираем выделение текста и caret

    dragged = item;

    const rect = item.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    item.style.zIndex = 1000;
  });

  /* ===== ПОВОРОТ ПКМ (С ВЫРАВНИВАНИЕМ) ===== */
  item.addEventListener("contextmenu", e => {
    e.preventDefault();

    let current = parseInt(item.dataset.rotate || 0);

    // выравниваем к ближайшим 90°
    let snapped = Math.round(current / 90) * 90;
    snapped += 90;
    snapped = snapped % 360;

    item.dataset.rotate = snapped;
    item.style.transform = `rotate(${snapped}deg)`;
  });
});

document.addEventListener("mousemove", e => {
  if (!dragged) return;

  const containerRect = container.getBoundingClientRect();

  dragged.style.left =
    e.clientX - containerRect.left - offsetX + "px";

  dragged.style.top =
    e.clientY - containerRect.top - offsetY + "px";
});

document.addEventListener("mouseup", () => {
  if (!dragged) return;

  const a = dragged.getBoundingClientRect();
  const centerX = a.left + a.width / 2;
  const centerY = a.top + a.height / 2;

  zones.forEach(zone => {
    const z = zone.getBoundingClientRect();

    const centerInside =
      centerX > z.left &&
      centerX < z.right &&
      centerY > z.top &&
      centerY < z.bottom;

    if (centerInside && dragged.dataset.type === zone.dataset.accept) {
      zone.classList.add("correct");

      setTimeout(() => {
        zone.classList.remove("correct");
      }, 600);

      dragged.style.pointerEvents = "none";
    }
  });

  dragged = null;
});

/* ===== КНОПКА "НАЧАТЬ ЗАНОВО" ===== */
resetBtn.addEventListener("click", () => {
  randomizePositions();
});
