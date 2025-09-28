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
let timerSec = 60;
let timerInterval = null;
let bestTime = localStorage.getItem("sentient-best") || null;

// Puzzle images
const puzzleImages = [
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

    // Drag & Drop Events
    tile.setAttribute('draggable', true);
    tile.addEventListener('dragstart', onDragStart);
    tile.addEventListener('dragover', onDragOver);
    tile.addEventListener('drop', onDrop);

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

// Drag & Drop logic
let draggedTile = null;

function onDragStart(e) {
  draggedTile = e.currentTarget;
}

function onDragOver(e) {
  e.preventDefault(); // allow drop
}

function onDrop(e) {
  e.preventDefault();
  const targetTile = e.currentTarget;
  if (!draggedTile || draggedTile === targetTile) return;

  // Swap dataset.place and style.order
  const tempPlace = draggedTile.dataset.place;
  draggedTile.dataset.place = targetTile.dataset.place;
  targetTile.dataset.place = tempPlace;

  draggedTile.style.order = draggedTile.dataset.place;
  targetTile.style.order = targetTile.dataset.place;

  draggedTile = null;

  if (checkSolved()) win();
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

