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
    const x = Math.random() * (container.clientWidth - item.offsetWidth);
    const y = Math.random() * (container.clientHeight - item.offsetHeight);

    const angle = Math.floor(Math.random() * 121) - 60;

    item.style.left = x + "px";
    item.style.top = y + "px";

    item.dataset.rotate = angle;
    item.style.transform = `rotate(${angle}deg)`;

    item.style.pointerEvents = "auto";
    item.classList.remove("collected");
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

  let newX = e.clientX - containerRect.left - offsetX;
  let newY = e.clientY - containerRect.top - offsetY;

  const maxX = container.clientWidth - dragged.offsetWidth;
  const maxY = container.clientHeight - dragged.offsetHeight;

  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  dragged.style.left = newX + "px";
  dragged.style.top = newY + "px";
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

  checkGrouping(dragged);
  dragged = null;
});

/* ===== КНОПКА "НАЧАТЬ ЗАНОВО" ===== */
resetBtn.addEventListener("click", () => {
  randomizePositions();
});

/* ===== СЛИПАНИЯ ===== */
function checkGrouping(draggedItem) {
  animals.forEach(other => {
    if (other === draggedItem) return;
    if (other.dataset.type !== draggedItem.dataset.type) return;

    const a = draggedItem.getBoundingClientRect();
    const b = other.getBoundingClientRect();

    const distance = Math.hypot(
      (a.left + a.width / 2) - (b.left + b.width / 2),
      (a.top + a.height / 2) - (b.top + b.height / 2)
    );

    if (distance < 80) {
      stickTogether(draggedItem, other);
    }
  });
}

function stickTogether(a, b) {
  const x = a.offsetLeft;
  const y = a.offsetTop;

  b.style.left = x + 40 + "px";
  b.style.top = y + "px";

  a.classList.add("collected");
  b.classList.add("collected");

  a.style.pointerEvents = "none";
  b.style.pointerEvents = "none";
}
