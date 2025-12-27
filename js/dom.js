// ====== МАССИВЫ ФРАЗ ======
const latin = [
    "Consuetudo est altera natura",
    "Nota bene",
    "Nulla calamitas sola",
    "Per aspera ad astra"
  ];
  
  const russian = [
    "Привычка - вторая натура",
    "Заметьте хорошо!",
    "Беда не приходит одна",
    "Через тернии к звёздам"
  ];
  
  // ====== ПЕРЕМЕННЫЕ ======
  let usedIndexes = [];
  let clickCount = 0;
  
  // ====== ЭЛЕМЕНТЫ ======
  const createBtn = document.getElementById("createBtn");
  const recolorBtn = document.getElementById("recolorBtn");
  const resetBtn = document.getElementById("resetBtn");
  const list = document.getElementById("phraseList");
  
  // ====== СЛУЧАЙНЫЙ ИНДЕКС БЕЗ ПОВТОРОВ ======
  function getRandomIndex() {
    if (usedIndexes.length === latin.length) {
      alert("Фразы закончились");
      return null;
    }
  
    let index;
    do {
      index = Math.floor(Math.random() * latin.length);
    } while (usedIndexes.includes(index));
  
    usedIndexes.push(index);
    return index;
  }
  
  // ====== СОЗДАНИЕ ФРАЗЫ ======
  createBtn.addEventListener("click", () => {
    const i = getRandomIndex();
    if (i === null) return;
  
    clickCount++;
    const className = clickCount % 2 === 0 ? "class1" : "class2";
  
    const li = document.createElement("li");
    li.textContent = latin[i];
    li.className = className;
  
    const subList = document.createElement("ol");
    const subItem = document.createElement("li");
    subItem.textContent = russian[i];
  
    subList.appendChild(subItem);
    li.appendChild(subList);
    list.appendChild(li);
  });
  
  // ====== ПЕРЕКРАСКА ЧЁТНЫХ ======
  recolorBtn.addEventListener("click", () => {
    const items = list.children;
    for (let i = 0; i < items.length; i++) {
      if ((i + 1) % 2 === 0) {
        items[i].style.fontWeight = "bold";
      }
    }
  });
  
  // ====== ОЧИСТКА ======
  resetBtn.addEventListener("click", () => {
    list.innerHTML = "";
    usedIndexes = [];
    clickCount = 0;
  });
  