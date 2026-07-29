// ============================================================
//  常量
// ============================================================
const GRID_SIZE = 20;
const COLS = 20;
const ROWS = 20;
const TICK_INTERVAL = 200;  // ms

// ============================================================
//  状态 & 数据
// ============================================================
let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let food = { x: 15, y: 10 };
let score = 0;
let state = 'idle';       // idle | playing | paused | gameover
let gameLoop = null;

let canvas, ctx;

// ============================================================
//  初始化
// ============================================================
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  document.addEventListener('keydown', handleKeydown);
  document.getElementById('btnStart').addEventListener('click', startGame);
  document.getElementById('btnStop').addEventListener('click', stopGame);

  resetData();
  render();
}

// ============================================================
//  数据重置
// ============================================================
function resetData() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  score = 0;
}

// ============================================================
//  绘制
// ============================================================
function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((seg, idx) => {
    const x = seg.x * GRID_SIZE;
    const y = seg.y * GRID_SIZE;
    if (idx === 0) {
      // 蛇头
      ctx.fillStyle = '#4ecdc4';
    } else {
      ctx.fillStyle = '#2ecc71';
    }
    ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
  });
}

function drawFood() {
  const x = food.x * GRID_SIZE;
  const y = food.y * GRID_SIZE;
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
}

function drawPausing() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('pausing', canvas.width / 2, canvas.height / 2);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e74c3c';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = '#eee';
  ctx.font = '20px sans-serif';
  ctx.fillText('得分: ' + score, canvas.width / 2, canvas.height / 2 + 24);
}

function drawScore() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('得分: ' + score, 8, 8);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawFood();
  drawSnake();
  drawScore();

  if (state === 'paused') {
    drawPausing();
  } else if (state === 'gameover') {
    drawGameOver();
  }
}

// ============================================================
//  食物生成（不与蛇身重叠）
// ============================================================
function spawnFood() {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
  const free = [];
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }
  if (free.length === 0) return; // 蛇占满整张画布（理论上要赢了）
  const idx = Math.floor(Math.random() * free.length);
  food = free[idx];
}

// ============================================================
//  移动 & 碰撞
// ============================================================
function moveSnake() {
  // 应用缓冲方向
  direction = nextDirection;

  const delta = {
    UP:    { dx: 0, dy: -1 },
    DOWN:  { dx: 0, dy: 1 },
    LEFT:  { dx: -1, dy: 0 },
    RIGHT: { dx: 1, dy: 0 },
  };
  const { dx, dy } = delta[direction];

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // 碰撞检测
  if (checkCollision(head)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    spawnFood();
  } else {
    snake.pop();
  }
}

function checkCollision(head) {
  // 撞墙
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    return true;
  }
  // 撞自身（跳过蛇头自己，因为 head 还没加入 snake）
  return snake.some(seg => seg.x === head.x && seg.y === head.y);
}

// ============================================================
//  状态切换
// ============================================================
function startGame() {
  if (state === 'playing') return;

  stopGameLoop();
  resetData();
  spawnFood();
  state = 'playing';
  startGameLoop();
  render();
}

function stopGame() {
  stopGameLoop();
  state = 'idle';
  resetData();
  render();
}

function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    render();
  } else if (state === 'paused') {
    state = 'playing';
    render();
  }
}

function gameOver() {
  stopGameLoop();
  state = 'gameover';
  render();
}

// ============================================================
//  游戏循环
// ============================================================
function startGameLoop() {
  gameLoop = setInterval(tick, TICK_INTERVAL);
}

function stopGameLoop() {
  if (gameLoop !== null) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
}

function tick() {
  if (state !== 'playing') return;
  moveSnake();
  render();
}

// ============================================================
//  键盘事件
// ============================================================
function handleKeydown(e) {
  const key = e.key;

  // 方向键
  const keyMap = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
  };

  if (key in keyMap) {
    e.preventDefault();
    if (state !== 'playing') return;
    const newDir = keyMap[key];
    // 防反向
    const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (newDir !== opposite[direction]) {
      nextDirection = newDir;
    }
    return;
  }

  // 空格：暂停 / 继续
  if (key === ' ') {
    e.preventDefault();
    togglePause();
    return;
  }
}

// ============================================================
//  启动
// ============================================================
document.addEventListener('DOMContentLoaded', init);
