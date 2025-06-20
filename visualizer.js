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
const styleSelect = document.getElementById("style-select");

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
    styleLbl: "Style:",
    bars: "Bars",
    dots: "Dots",
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
      "Style: Bars or Dots.",
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
    styleLbl: "Стиль:",
    bars: "Столбцы",
    dots: "Точки",
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
      "Стиль: Столбцы или Точки.",
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

/* Speed helper */
function updateSpeed() {
  speed = 550 - Number(speedSlider.value) * 50;
}
updateSpeed();

/* Resize canvas */
function resizeCanvas() {
  const w = Math.min(window.innerWidth - 40, 960);
  const h = window.innerWidth < 600 ? window.innerHeight * 0.5 : window.innerHeight * 0.4;
  cvs.width = w;
  cvs.height = h;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* Utilities */
function randArray(sz = 12, mn = 5, mx = 60) {
  return Array.from({ length: sz }, () => Math.floor(Math.random() * (mx - mn + 1)) + mn);
}
function chooseGenerator() {
  const data = [...array], opt = optimChk.checked;
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
function draw() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  const n = array.length;
  const maxVal = Math.max(...array);
  const barW = Math.max(8, Math.floor(cvs.width / (n * 1.15)));
  const gap = Math.floor(barW * 0.15);
  const tot = barW + gap;
  const ofs = (cvs.width - (tot * n - gap)) / 2;
  const hLim = cvs.height * 0.85;

  array.forEach((v, i) => {
    const x = ofs + i * tot;
    const col = highlight.includes(i) ? highlightColor : "#6ea8ff";

    if (styleSelect.value === "bars") {
      const bh = (v / maxVal) * hLim;
      ctx.fillStyle = col;
      ctx.fillRect(x, cvs.height - bh, barW, bh);
    } else {
      const cy = cvs.height - (v / maxVal) * hLim;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x + barW / 2, cy, 6, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.fillStyle = document.body.dataset.theme === "dark" ? "#ddd" : "#444";
    ctx.font = "10px Inter";
    ctx.textAlign = "center";
    ctx.fillText(v, x + barW / 2, cvs.height - 5);
  });
}

/* Animate */
function step() {
  if (isPaused) return;
  const { value, done } = generator.next();
  if (done) {
    highlight = [];
    draw();
    if (soundChk.checked) doneS.play();
    isRunning = isPaused = false;
    elapsed = Date.now() - startTime;
    runtimeLbl.textContent = `Runtime: ${elapsed} ms`;
    playBtn.textContent = dict[document.body.dataset.lang].play;
    return;
  }
  const [act, i, j, snap] = value;
  array = snap;
  highlight = [i, j];
  highlightColor = act === "compare" ? "#ffbd69" : "#ff6b6b";
  if (act === "swap" && soundChk.checked) swapS.play();
  draw();
  elapsed = Date.now() - startTime;
  runtimeLbl.textContent = `Runtime: ${elapsed} ms`;
  setTimeout(step, speed);
}

/* Initialize visualizer */
function initViz() {
  array = randArray();
  generator = chooseGenerator();
  highlight = [];
  isRunning = false;
  isPaused = true;
  elapsed = 0;
  updateSpeed();
  draw();
  runtimeLbl.textContent = "Runtime: 0 ms";
  playBtn.textContent = dict[document.body.dataset.lang].play;
}

/* Event listeners */
startBtn.addEventListener("click", () => {
  menu.classList.remove("active");
  viz.classList.add("active");
  initViz();
});

playBtn.addEventListener("click", () => {
  if (!isRunning) {
    isRunning = true;
    isPaused = false;
    startTime = Date.now() - elapsed;
    playBtn.textContent = dict[document.body.dataset.lang].pause;
    step();
  } else {
    isPaused = !isPaused;
    playBtn.textContent = isPaused ? dict[document.body.dataset.lang].play : dict[document.body.dataset.lang].pause;
    if (!isPaused) {
      startTime = Date.now() - elapsed;
      step();
    }
  }
});

resetBtn.addEventListener("click", initViz);
speedSlider.addEventListener("input", updateSpeed);
optimChk.addEventListener("change", initViz);
styleSelect.addEventListener("change", draw);
themeBtn.addEventListener("click", () => {
  document.body.dataset.theme =
    document.body.dataset.theme === "light" ? "dark" : "light";
  draw();
});
langBtn.addEventListener("click", () => applyLang(document.body.dataset.lang === "en" ? "ru" : "en"));
helpBtn.addEventListener("click", () => helpModal.classList.remove("hidden"));
closeHelpBtn.addEventListener("click", () => helpModal.classList.add("hidden"));
backBtn.addEventListener("click", () => {
  viz.classList.remove("active");
  menu.classList.add("active");
});

/* Apply initial language */
applyLang("en");
