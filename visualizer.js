import { bubbleSort } from "./algorithms/bubble.js";
import { insertionSort } from "./algorithms/insertion.js";
import { quickSort } from "./algorithms/quick.js";
import { mergeSort } from "./algorithms/merge.js";
import { heapSort } from "./algorithms/heap.js";

/* DOM references */
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

const menu = document.getElementById("menu");
const viz = document.getElementById("visualizer");

const algSelect = document.getElementById("algorithm-select");
const startBtn = document.getElementById("start-btn");

const playBtn = document.getElementById("play-pause-btn");
const resetBtn = document.getElementById("reset-btn");
const speedSlider = document.getElementById("speed-range");
const optimChk = document.getElementById("optimised-chk");
const soundChk = document.getElementById("sound-chk");

const langBtn = document.getElementById("lang-btn");
const themeBtn = document.getElementById("theme-btn");
const helpBtn = document.getElementById("help-btn");
const backBtn = document.getElementById("back-btn");

const helpModal = document.getElementById("help-modal");
const helpList = document.getElementById("help-list");
const closeHelpBtn = document.getElementById("close-help-btn");

const runtimeLbl = document.getElementById("runtime");

/* Sounds */
const swapS = new Audio("./assets/sounds/swap.wav");
const doneS = new Audio("./assets/sounds/done.wav");
swapS.volume = 0.6;
doneS.volume = 0.8;

/* i18n dictionaries */
const dict = {
  en: {
    title: "Sorting Algorithm Visualizer",
    choose: "Choose an algorithm:",
    bubble: "Bubble Sort",
    insertion: "Insertion Sort",
    quick: "Quick Sort",
    merge: "Merge Sort",
    heap: "Heap Sort",
    startMenu: "Start Visualizer",
    play: "▶️ Start",
    pause: "⏸️ Pause",
    reset: "🔄 Reset",
    speedLbl: "Speed:",
    optimised: "Optimised",
    sound: "Sound",
    help: "❓ Help",
    menu: "⬅️ Menu",
    helpTitle: "Help Guide",
    close: "Close",
    helpItems: [
      "Start / Pause: play‑pause animation.",
      "Reset: randomise array.",
      "Speed: drag 1 (slow) → 10 (fast).",
      "Optimised: early‑exit version.",
      "Sound: swap/done effects.",
      "Menu: pick a different algorithm."
    ]
  },
  ru: {
    title: "Визуализатор алгоритмов сортировки",
    choose: "Выберите алгоритм:",
    bubble: "Сортировка пузырьком",
    insertion: "Сортировка вставками",
    quick: "Быстрая сортировка",
    merge: "Сортировка слиянием",
    heap: "Пирамидальная сортировка",
    startMenu: "Запуск визуализатора",
    play: "▶️ Старт",
    pause: "⏸️ Пауза",
    reset: "🔄 Сброс",
    speedLbl: "Скорость:",
    optimised: "Оптимизация",
    sound: "Звук",
    help: "❓ Справка",
    menu: "⬅️ Меню",
    helpTitle: "Справка",
    close: "Закрыть",
    helpItems: [
      "Старт/Пауза: запустить/остановить анимацию.",
      "Сброс: случайный массив.",
      "Скорость: 1 (медленно) → 10 (быстро).",
      "Оптимизация: ранний выход.",
      "Звук: эффекты обмена/завершения.",
      "Меню: выбрать алгоритм."
    ]
  }
};

/* Language helper */
function applyLang(lang) {
  document.body.dataset.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (dict[lang][key]) el.textContent = dict[lang][key];
  });
  ["bubble","insertion","quick","merge","heap"].forEach(v => {
    const o = document.querySelector(`option[value='${v}']`);
    if (o) o.textContent = dict[lang][v];
  });
  playBtn.textContent = isRunning && !isPaused ? dict[lang].pause : dict[lang].play;
  helpList.innerHTML = "";
  dict[lang].helpItems.forEach(txt => {
    const li = document.createElement("li");
    li.textContent = txt;
    helpList.appendChild(li);
  });
}

/* State */
let array = [], generator = null;
let isRunning = false, isPaused = true;
let speed = 300, startTime = 0, elapsed = 0;
let highlight = [], highlightColor = "#ff6b6b";
let quickPivot = -1;
let mergeAux = null, mergeRange = null;
let heapPositions = [], heapSortedArray = [];

// Initialize mergeStages as an empty array instead of null
let mergeStages = [];

/* Speed helper */
function updateSpeed() {
  speed = 600 - Number(speedSlider.value) * 50;
}
updateSpeed();

/* Resize canvas */
function resizeCanvas() {
  const w = Math.min(window.innerWidth - 40, 960);
  const h = window.innerWidth < 600 ? window.innerHeight * 0.5 : window.innerHeight * 0.45;
  cvs.width = w;
  cvs.height = h;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* Utilities */
function randArray(sz = 15, mn = 5, mx = 60) {
  return Array.from({ length: sz }, () => Math.floor(Math.random() * (mx - mn + 1)) + mn);
}

function chooseGenerator() {
  const data = [...array];
  const opt = optimChk.checked;
  switch (algSelect.value) {
    case "bubble": return bubbleSort(data, opt);
    case "insertion": return insertionSort(data, opt);
    case "quick": return quickSort(data, opt);
    case "merge": return mergeSort(data, opt);
    case "heap": return heapSort(data, opt);
    default: return bubbleSort(data, opt);
  }
}

/* Drawing */

function drawBubble() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  const n = array.length;
  const maxVal = Math.max(...array);
  const barW = Math.max(8, Math.floor(cvs.width / (n * 1.2)));
  const gap = Math.floor(barW * 0.15);
  const tot = barW + gap;
  const ofs = (cvs.width - (tot * n - gap)) / 2;
  const hLim = cvs.height * 0.85;

  array.forEach((v, i) => {
    const x = ofs + i * tot;
    const bh = (v / maxVal) * hLim;
    const col = highlight.includes(i) ? "#ff6b6b" : "#6ea8ff";

    ctx.fillStyle = col;
    ctx.fillRect(x, cvs.height - bh, barW, bh);

    ctx.fillStyle = document.body.dataset.theme === "dark" ? "#ddd" : "#444";
    ctx.font = "10px Inter";
    ctx.textAlign = "center";
    ctx.fillText(v, x + barW / 2, cvs.height - 5);
  });
}

function drawInsertion() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  const n = array.length;
  const maxVal = Math.max(...array);
  const gap = cvs.width / (n + 1);
  const yBase = cvs.height * 0.7;

  array.forEach((v, i) => {
    const x = gap * (i + 1);
    const radius = 6 + (v / maxVal) * 14;
    ctx.beginPath();
    ctx.arc(x, yBase, radius, 0, 2 * Math.PI);
    ctx.fillStyle = highlight.includes(i) ? "#ff8c42" : "#6ea8ff";
    ctx.fill();

    ctx.fillStyle = document.body.dataset.theme === "dark" ? "#ddd" : "#222";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(v, x, yBase);
  });
}

function drawQuick() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  const n = array.length;
  const maxVal = Math.max(...array);
  const barW = Math.max(8, Math.floor(cvs.width / (n * 1.2)));
  const gap = Math.floor(barW * 0.15);
  const tot = barW + gap;
  const ofs = (cvs.width - (tot * n - gap)) / 2;
  const hLim = cvs.height * 0.85;

  array.forEach((v, i) => {
    const x = ofs + i * tot;
    const bh = (v / maxVal) * hLim;

    let col = "#6ea8ff";
    if (i === quickPivot) col = "#ff6b6b";
    else if (highlight.includes(i)) col = "#69ff69";

    ctx.fillStyle = col;
    ctx.fillRect(x, cvs.height - bh, barW, bh);

    ctx.fillStyle = document.body.dataset.theme === "dark" ? "#ddd" : "#444";
    ctx.font = "10px Inter";
    ctx.textAlign = "center";
    ctx.fillText(v, x + barW / 2, cvs.height - 5);
  });
}

// Merge sort: bars + top aux array (circles) for merging visualization
function drawMerge() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  if (!mergeStages || mergeStages.length === 0) return;

  const boxSize = 36;
  const spacing = 4;
  const rowHeight = 60;
  const topY = 20;
  const n = array.length;
  const startX = (cvs.width - n * (boxSize + spacing)) / 2;

  // Draw initial array on top
  for (let i = 0; i < n; i++) {
    const x = startX + i * (boxSize + spacing);
    ctx.fillStyle = "#6ea8ff";
    ctx.fillRect(x, topY, boxSize, boxSize);
    ctx.fillStyle = "#000";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(array[i], x + boxSize / 2, topY + boxSize / 2);
  }

  mergeStages.forEach(stage => {
    const { left, right, depth, values, type } = stage;
    const y = topY + (depth + 1) * rowHeight;
    const xStart = startX + left * (boxSize + spacing);
    const groupWidth = (values.length * (boxSize + spacing)) - spacing;
    const groupMidX = xStart + groupWidth / 2;
    const midIndex = Math.floor(values.length / 2);

    // Draw bounding block around the full group
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    ctx.strokeRect(xStart - 4, y - 4, groupWidth + 8, boxSize + 8);

    // Draw boxes inside group
    for (let i = 0; i < values.length; i++) {
      const x = xStart + i * (boxSize + spacing);
      let fillColor;

      if (type === "split") {
        fillColor = i < midIndex ? "#cce5ff" : "#99ccff";
      } else {
        fillColor = i < midIndex ? "#fff4b2" : "#ffe680";
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, boxSize, boxSize);

      ctx.fillStyle = "#000";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(values[i], x + boxSize / 2, y + boxSize / 2);
    }

    // Draw lines from parent block to current boxes
    const parentY = y - rowHeight + boxSize;
    for (let i = 0; i < values.length; i++) {
      const x = xStart + i * (boxSize + spacing) + boxSize / 2;
      ctx.beginPath();
      ctx.moveTo(groupMidX, parentY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = type === "split" ? "#0000cc" : "#008800";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // Draw final result array at the very bottom
  const finalY = topY + (getMaxDepth(mergeStages) + 2) * rowHeight;
  for (let i = 0; i < array.length; i++) {
    const x = startX + i * (boxSize + spacing);
    ctx.fillStyle = "#ffcc99";
    ctx.fillRect(x, finalY, boxSize, boxSize);

    ctx.fillStyle = "#222";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(array[i], x + boxSize / 2, finalY + boxSize / 2);
  }
}

// Helper to compute max depth
function getMaxDepth(stages) {
  return stages.reduce((max, s) => Math.max(max, s.depth), 0);
}

// Heap sort: Draw heap tree + sorted array squares below
function drawHeap() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const n = array.length;
  const levels = Math.floor(Math.log2(n)) + 1;
  heapPositions = [];

  const vertGap = cvs.height * 0.11;
  const topMargin = 40;
  const radius = 18;

  // Calculate node positions
  for (let lvl = 0; lvl < levels; lvl++) {
    const nodesInLevel = Math.min(2 ** lvl, n - (2 ** lvl - 1));
    const gap = cvs.width / (nodesInLevel + 1);
    const y = topMargin + vertGap * lvl;
    for (let j = 0; j < nodesInLevel; j++) {
      const idx = 2 ** lvl - 1 + j;
      const x = gap * (j + 1);
      heapPositions[idx] = { x, y };
    }
  }

  // Draw edges
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) {
    const p = heapPositions[i];
    const left = heapPositions[2 * i + 1];
    const right = heapPositions[2 * i + 2];
    if (left) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(left.x, left.y);
      ctx.stroke();
    }
    if (right) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
    }
  }

  // Draw nodes as circles
  array.forEach((v, i) => {
    const pos = heapPositions[i];
    const col = highlight.includes(i) ? "#ff6b6b" : "#6ea8ff";

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = col;
    ctx.fill();

    ctx.fillStyle = document.body.dataset.theme === "dark" ? "#ddd" : "#222";
    ctx.font = "14px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(v, pos.x, pos.y);
  });

  // Draw sorted array squares below the tree
  if (heapSortedArray.length > 0) {
    const squareSize = 28;
    const gap = 8;
    const totalWidth = heapSortedArray.length * (squareSize + gap) - gap;
    const startX = (cvs.width - totalWidth) / 2;
    const y = heapPositions[heapPositions.length - 1].y + 50;

    heapSortedArray.forEach((val, i) => {
      const x = startX + i * (squareSize + gap);
      ctx.fillStyle = "#ff9900";
      ctx.fillRect(x, y, squareSize, squareSize);

      ctx.fillStyle = document.body.dataset.theme === "dark" ? "#222" : "#222";
      ctx.font = "14px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(val, x + squareSize / 2, y + squareSize / 2);
    });
  }
}

function draw() {
  switch (algSelect.value) {
    case "bubble": drawBubble(); break;
    case "insertion": drawInsertion(); break;
    case "quick": drawQuick(); break;
    case "merge": drawMerge(); break;
    case "heap": drawHeap(); break;
  }
}

/* State resets */
function resetState() {
  highlight = [];
  quickPivot = -1;
  mergeAux = null;
  mergeRange = null;
  heapSortedArray = [];
}

/* Update animation state from generator */
function updateState(action, i, j, arr, extra) {
  array = arr;
  resetState();

  if (action === "compare") highlight = [i, j];
  else if (action === "swap") highlight = [i, j];
  else if (action === "pivot") quickPivot = i;
  else if (action === "merge") {
  mergeStages = extra.stages || [];
  }else if (action === "done") {
  highlight = [];
  quickPivot = -1;
  mergeAux = null;
  mergeRange = null;
  if (algSelect.value !== "merge") mergeStages = null; // ✅ Only clear if not merge
  heapSortedArray = [];
}



  // For heap, capture sorted part to show squares below tree
  if (algSelect.value === "heap" && extra && "sortedArray" in extra) {
    heapSortedArray = extra.sortedArray.slice().reverse(); // Reverse so sorted on right side
  }
}

/* Animation step */
function step() {
  if (isPaused) return;

  const { value, done } = generator.next();

  if (done) {
    doneS.play();
    isPaused = false;
    isRunning = false;
    elapsed = performance.now() - startTime;
    runtimeLbl.textContent = `Runtime: ${elapsed.toFixed(0)} ms`;
    playBtn.textContent = dict[document.body.dataset.lang].play;
    draw();
    return;
  }

  const [action, i, j, snap, extra] = value;
  updateState(action, i, j, snap, extra);

  if (action === "swap" && soundChk.checked) swapS.play();

  elapsed = performance.now() - startTime;
  runtimeLbl.textContent = `Runtime: ${elapsed.toFixed(0)} ms`;

  draw();

  setTimeout(step, speed);
}

/* Control handlers */

function start() {
  resetState();
  array = randArray();
  generator = chooseGenerator();

  isRunning = true;
  isPaused = false;
  startTime = performance.now();
  elapsed = 0;

  playBtn.textContent = dict[document.body.dataset.lang].pause;

  menu.classList.remove("active");
  viz.classList.add("active");

  step();
}

startBtn.addEventListener("click", start);

playBtn.addEventListener("click", () => {
  if (!isRunning) return start();
  isPaused = !isPaused;
  playBtn.textContent = isPaused ? dict[document.body.dataset.lang].play : dict[document.body.dataset.lang].pause;
  if (!isPaused) {
    startTime = performance.now() - elapsed;
    step();
  }
});

resetBtn.addEventListener("click", () => {
  if (isRunning) isPaused = true;
  array = randArray();
  generator = chooseGenerator();
  resetState();
  draw();
  runtimeLbl.textContent = `Runtime: 0 ms`;
});

speedSlider.addEventListener("input", () => {
  updateSpeed();
});

optimChk.addEventListener("change", () => {
  if (!isRunning) {
    array = randArray();
    generator = chooseGenerator();
    draw();
  }
});

soundChk.addEventListener("change", () => {
  // no action needed here but placeholder for future
});

themeBtn.addEventListener("click", () => {
  document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
  draw();
});

langBtn.addEventListener("click", () => {
  applyLang(document.body.dataset.lang === "en" ? "ru" : "en");
});

helpBtn.addEventListener("click", () => {
  helpModal.classList.remove("hidden");
});

closeHelpBtn.addEventListener("click", () => {
  helpModal.classList.add("hidden");
});

backBtn.addEventListener("click", () => {
  isPaused = false;
  isRunning = false;
  menu.classList.add("active");
  viz.classList.remove("active");
});

applyLang("en");
resetBtn.click();
