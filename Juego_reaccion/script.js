const target = document.getElementById('target');
const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const startBtn = document.getElementById('start-btn');

let score = 0;
let time = 30;
let gameInterval;
let countdownInterval;

// Función para mover el cuadro a una posición aleatoria
function moveTarget() {
  const x = Math.random() * (gameArea.clientWidth - target.clientWidth);
  const y = Math.random() * (gameArea.clientHeight - target.clientHeight);
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.style.display = 'block';
}

// Al hacer clic en el cuadro
target.addEventListener('click', () => {
  score++;
  scoreEl.textContent = score;
  moveTarget();
});

// Contador de tiempo
function countdown() {
  time--;
  timeEl.textContent = time;
  if (time <= 0) {
    clearInterval(gameInterval);
    clearInterval(countdownInterval);
    target.style.display = 'none';
    alert(`¡Tiempo terminado! Tu puntuación final es: ${score}`);
  }
}

// Comenzar juego
startBtn.addEventListener('click', () => {
  score = 0;
  time = 30;
  scoreEl.textContent = score;
  timeEl.textContent = time;
  moveTarget();
  clearInterval(gameInterval);
  clearInterval(countdownInterval);
  gameInterval = setInterval(moveTarget, 1000); // cambia posición cada 1s
  countdownInterval = setInterval(countdown, 1000);
});