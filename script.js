const ROWS = 3, COLS = 3;
const TOTAL = ROWS * COLS;
const puzzleEl = document.getElementById('puzzle');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modal-title');
const modalSub = document.getElementById('modal-sub');
const playAgainBtn = document.getElementById('play-again');
const timerEl = document.getElementById('timer');
let tiles = [];
let order = [];
let selectedIndex = null;
let timerSec = 60;
let timerInterval = null;
let bestTime = localStorage.getItem("sentient-best") || null;

// Puzzle images
const puzzleImages = [
  "assets/sentient-logo.png",
  "assets/puzzle1.jpg",
  "assets/puzzle2.jpg",
  "assets/puzzle3.jpg",
  "assets/puzzle4.jpg"
];

// Pick random puzzle image
function getRandomImage() {
  const pick = Math.floor(Math.random() * puzzleImages.length);
  return `url("${puzzleImages[pick]}")`;
}

// Initialize puzzle
function init() {
  order = Array.from({ length: TOTAL }, (_, i) => i);
  shuffle(order);
  puzzleEl.innerHTML = '';
  tiles = [];
  const bgUrl = getRandomImage();

  for (let idx = 0; idx < TOTAL; idx++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = idx;
    tile.dataset.place = idx; // initial visual place
    tile.style.backgroundImage = bgUrl;
    tile.style.order = idx;
    const row = Math.floor(idx / COLS);
    const col = idx % COLS;
    const xPercent = (col / (COLS - 1)) * 100;
    const yPercent = (row / (ROWS - 1)) * 100;
    tile.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    tile.addEventListener('click', onTileClick);
    puzzleEl.appendChild(tile);
    tiles.push(tile);
  }

  // Shuffle visual positions
  order.forEach((tileIdx, placeIdx) => {
    const t = tiles[tileIdx];
    t.dataset.place = placeIdx;
    t.style.order = placeIdx;
  });

  hideOverlay();
  startTimer();
  updateBestUI();
}

// Shuffle array
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.every((v, i) => v === i)) [arr[0], arr[1]] = [arr[1], arr[0]];
}

// Tile click
function onTileClick(e) {
  const tile = e.currentTarget;
  const place = Number(tile.dataset.place);

  if (selectedIndex === null) {
    selectedIndex = place;
    tile.classList.add('selected');
    return;
  }

  if (selectedIndex === place) {
    tile.classList.remove('selected');
    selectedIndex = null;
    return;
  }

  swapPlaces(selectedIndex, place);
  selectedIndex = null;

  if (checkSolved()) win();
}

// Swap tiles by updating their `order` and `dataset.place`
function swapPlaces(aPlace, bPlace) {
  const a = tiles.find(t => Number(t.dataset.place) === aPlace);
  const b = tiles.find(t => Number(t.dataset.place) === bPlace);
  if (!a || !b) return;

  [a.dataset.place, b.dataset.place] = [b.dataset.place, a.dataset.place];
  [a.style.order, b.style.order] = [b.style.order, a.style.order];

  a.classList.remove('selected');
  b.classList.remove('selected');
}

// Check if puzzle is solved
function checkSolved() {
  return tiles.every(tile => Number(tile.dataset.index) === Number(tile.dataset.place));
}

// Win logic
function win() {
  stopTimer();
  const timeTaken = 60 - timerSec;
  if (!bestTime || timeTaken < bestTime) {
    bestTime = timeTaken;
    localStorage.setItem("sentient-best", bestTime);
  }
  updateBestUI();
  showOverlay('You won', `Completed in ${formatTime(timeTaken)}`);
}

// Timer
function startTimer() {
  stopTimer();
  timerSec = 60;
  updateTimerUI();
  timerInterval = setInterval(() => {
    timerSec--;
    updateTimerUI();
    if (timerSec <= 0) {
      stopTimer();
      showOverlay('Time up', 'Play again');
    }
  }, 1000);
}

function stopTimer() { if (timerInterval) clearInterval(timerInterval); }
function updateTimerUI() { timerEl.textContent = formatTime(timerSec); }

// Best time UI
function updateBestUI() {
  const bestEl = document.getElementById('best');
  if (bestTime) bestEl.textContent = `Best: ${formatTime(bestTime)}`;
  else bestEl.textContent = "Best: --";
}

// Format time mm:ss
function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// Overlay modal
function showOverlay(title, sub) {
  modalTitle.textContent = title;
  modalSub.textContent = sub;
  overlay.classList.remove('hidden');
}
function hideOverlay() { overlay.classList.add('hidden'); }

// Play again button
playAgainBtn.addEventListener('click', () => init());
window.addEventListener('load', () => init());
