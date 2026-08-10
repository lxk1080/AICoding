import { AudioManager } from './audio-manager.js';

const C = {
  width: 800, height: 600, maxDelta: 0.05,
  paddle: { width: 120, height: 16, speed: 520, bottom: 24 },
  ball: { radius: 8, speed: 350, maxSpeed: 550, minVerticalRatio: .35 },
  brick: { cols: 10, width: 68, height: 24, gap: 8, top: 74 },
  left: 24, lives: 3, maxLives: 5, dropChance: .6,
  power: { width: 38, height: 18, fallSpeed: 155, extend: 15, slow: 10, pierce: 8 },
};

const TYPES = {
  1: { name: '普通砖', hp: 1, score: 100, color: '#55d8ff', breakable: true },
  2: { name: '坚固砖', hp: 2, score: 100, color: '#ffbd59', breakable: true },
  3: { name: '金属砖', hp: Infinity, score: 0, color: '#8b93ad', breakable: false },
  4: { name: '道具砖', hp: 1, score: 100, color: '#b889ff', breakable: true },
};

const LEVELS = [
  { name: '热身脉冲', speed: 1, layout: [
    [1,1,1,4,1,1,4,1,1,1], [1,1,4,1,1,1,1,4,1,1], [1,4,1,1,4,4,1,1,4,1], [1,1,1,1,1,1,1,1,1,1],
  ] },
  { name: '折射回廊', speed: 1.1, layout: [
    [0,2,2,4,2,2,2,4,2,0], [1,1,2,1,1,1,1,2,1,1], [1,4,1,2,0,0,2,1,4,1], [1,1,1,1,4,4,1,1,1,1], [0,1,1,1,1,1,1,1,1,0],
  ] },
  { name: '钢铁星阵', speed: 1.2, layout: [
    [2,1,3,1,4,4,1,3,1,2], [1,3,1,2,1,1,2,1,3,1], [4,1,2,1,3,3,1,2,1,4], [1,2,1,4,1,1,4,1,2,1], [0,1,1,3,1,1,3,1,1,0],
  ] },
];

const STATUS = { START: 'START', READY: 'READY', PLAYING: 'PLAYING', PAUSED: 'PAUSED', LEVEL_CLEAR: 'LEVEL_CLEAR', GAME_OVER: 'GAME_OVER', VICTORY: 'VICTORY' };
const POWER_TYPES = ['extend', 'multi', 'slow', 'pierce', 'life'];
const POWER_LABELS = { extend: '扩展', multi: '多球', slow: '减速', pierce: '穿透', life: '+生命' };
const POWER_COLORS = { extend: '#61edb6', multi: '#72d6ff', slow: '#ffcc66', pierce: '#fb87ef', life: '#ff778d' };

const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const ui = {
  level: document.querySelector('#level-value'), score: document.querySelector('#score-value'), lives: document.querySelector('#lives-value'),
  overlay: document.querySelector('#overlay'), kicker: document.querySelector('#overlay-kicker'), title: document.querySelector('#overlay-title'), text: document.querySelector('#overlay-text'), button: document.querySelector('#overlay-button'), hint: document.querySelector('#hint'), audioToggle: document.querySelector('#audio-toggle'),
};

const audio = new AudioManager((muted) => {
  ui.audioToggle.textContent = muted ? '已静音' : '音乐开';
  ui.audioToggle.setAttribute('aria-pressed', String(muted));
  ui.audioToggle.setAttribute('aria-label', muted ? '取消静音' : '静音');
});

const game = {
  status: STATUS.START, resumeStatus: STATUS.PLAYING, levelIndex: 0, score: 0, lives: C.lives,
  paddle: null, balls: [], bricks: [], powerUps: [], effects: new Map(), keys: { left: false, right: false }, lastTime: 0, particles: [], flash: 0,
};

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function rectsOverlap(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
function ballSpeed(ball) { return Math.hypot(ball.vx, ball.vy); }
function createPaddle() { return { width: C.paddle.width, baseWidth: C.paddle.width, height: C.paddle.height, speed: C.paddle.speed, x: (C.width - C.paddle.width) / 2, y: C.height - C.paddle.bottom - C.paddle.height }; }
function createBall(x, y, vx = 0, vy = 0, launched = false) { return { x, y, radius: C.ball.radius, vx, vy, launched, trail: [] }; }

function buildBricks(index) {
  const level = LEVELS[index];
  const totalWidth = C.brick.cols * C.brick.width + (C.brick.cols - 1) * C.brick.gap;
  const left = (C.width - totalWidth) / 2;
  return level.layout.flatMap((row, rowIndex) => row.flatMap((value, colIndex) => {
    if (!value) return [];
    const type = TYPES[value];
    return [{ id: `${rowIndex}-${colIndex}`, x: left + colIndex * (C.brick.width + C.brick.gap), y: C.brick.top + rowIndex * (C.brick.height + C.brick.gap), width: C.brick.width, height: C.brick.height, type: value, hp: type.hp, maxHp: type.hp, score: type.score, breakable: type.breakable, destroyed: false, hit: 0 }];
  }));
}

function resetEffects() { game.effects.clear(); game.powerUps = []; game.paddle.width = game.paddle.baseWidth; }
function prepareBall() {
  resetEffects();
  game.balls = [createBall(game.paddle.x + game.paddle.width / 2, game.paddle.y - C.ball.radius - 1)];
  game.status = STATUS.READY;
  updateUI();
}
function loadLevel(index) { game.levelIndex = index; game.paddle = createPaddle(); game.bricks = buildBricks(index); game.particles = []; prepareBall(); }
function startGame() { audio.ensureStarted(); game.score = 0; game.lives = C.lives; loadLevel(0); hideOverlay(); }
function launch() {
  if (game.status !== STATUS.READY) return;
  audio.ensureStarted();
  const ball = game.balls[0]; const speed = C.ball.speed * LEVELS[game.levelIndex].speed;
  ball.vx = speed * .35; ball.vy = -Math.sqrt(speed ** 2 - ball.vx ** 2); ball.launched = true;
  game.status = STATUS.PLAYING; hideOverlay(); updateUI();
}
function togglePause() {
  if (game.status !== STATUS.READY && game.status !== STATUS.PLAYING && game.status !== STATUS.PAUSED) return;
  if (game.status === STATUS.PAUSED) { game.status = game.resumeStatus; hideOverlay(); audio.resumeMusic(); }
  else { game.resumeStatus = game.status; game.status = STATUS.PAUSED; audio.pauseMusic(); showOverlay('游戏暂停', '按 Space 或 Escape 继续游戏。', '继续', 'PAUSED'); }
  updateUI();
}
function showOverlay(title, text, buttonText, mode, kicker = '霓虹打砖块') { ui.overlay.hidden = false; ui.title.textContent = title; ui.text.textContent = text; ui.button.textContent = buttonText; ui.overlay.dataset.mode = mode; ui.kicker.textContent = kicker; }
function hideOverlay() { ui.overlay.hidden = true; }
function updateUI() {
  ui.level.textContent = String(game.levelIndex + 1).padStart(2, '0'); ui.score.textContent = String(game.score).padStart(6, '0');
  ui.lives.textContent = Array.from({ length: game.lives }, () => '●').join(' ') || '—';
  ui.hint.textContent = game.status === STATUS.READY ? '准备完毕 · 按 Enter 发射能量球' : '左右方向键 / A D 移动 · Enter 发球 · Space / Esc 暂停';
}

function updatePaddle(dt) {
  const direction = Number(game.keys.right) - Number(game.keys.left);
  game.paddle.x = clamp(game.paddle.x + direction * game.paddle.speed * dt, 0, C.width - game.paddle.width);
  if (game.status === STATUS.READY) { const ball = game.balls[0]; ball.x = game.paddle.x + game.paddle.width / 2; ball.y = game.paddle.y - ball.radius - 1; }
}
function updateEffects(now) {
  for (const [type, effect] of game.effects) if (now >= effect.expiresAt) {
    if (type === 'extend') { const center = game.paddle.x + game.paddle.width / 2; game.paddle.width = game.paddle.baseWidth; game.paddle.x = clamp(center - game.paddle.width / 2, 0, C.width - game.paddle.width); }
    if (type === 'slow') for (const ball of game.balls) { ball.vx /= .75; ball.vy /= .75; }
    game.effects.delete(type);
  }
}
function circleRectCollision(ball, rect) {
  const closestX = clamp(ball.x, rect.x, rect.x + rect.width), closestY = clamp(ball.y, rect.y, rect.y + rect.height);
  const dx = ball.x - closestX, dy = ball.y - closestY;
  const distanceSquared = dx * dx + dy * dy;
  if (distanceSquared > ball.radius * ball.radius) return null;

  if (distanceSquared > 0) {
    const distance = Math.sqrt(distanceSquared);
    return { normalX: dx / distance, normalY: dy / distance, depth: ball.radius - distance };
  }

  // 球心已进入矩形内部时，选择最近的边作为推出方向。
  const distances = [
    { normalX: -1, normalY: 0, distance: ball.x - rect.x },
    { normalX: 1, normalY: 0, distance: rect.x + rect.width - ball.x },
    { normalX: 0, normalY: -1, distance: ball.y - rect.y },
    { normalX: 0, normalY: 1, distance: rect.y + rect.height - ball.y },
  ];
  const nearest = distances.reduce((result, side) => side.distance < result.distance ? side : result);
  return { normalX: nearest.normalX, normalY: nearest.normalY, depth: ball.radius + nearest.distance };
}
function bounceOffPaddle(ball) {
  if (ball.vy <= 0 || !circleRectCollision(ball, game.paddle) || ball.y < game.paddle.y) return false;
  ball.y = game.paddle.y - ball.radius - .1;
  const offset = clamp((ball.x - (game.paddle.x + game.paddle.width / 2)) / (game.paddle.width / 2), -1, 1);
  const angle = offset * Math.PI / 3; const speed = clamp(ballSpeed(ball) * 1.012, C.ball.speed, C.ball.maxSpeed);
  ball.vx = speed * Math.sin(angle); ball.vy = -Math.max(speed * Math.cos(angle), speed * C.ball.minVerticalRatio);
  normalizeBall(ball, speed); burst(ball.x, ball.y, '#a3f7ff', 7); audio.playSfx('paddle'); return true;
}
function normalizeBall(ball, speed = ballSpeed(ball)) {
  const current = ballSpeed(ball) || speed; ball.vx = ball.vx / current * speed; ball.vy = ball.vy / current * speed;
  const minY = speed * C.ball.minVerticalRatio;
  if (Math.abs(ball.vy) < minY) { ball.vy = Math.sign(ball.vy || -1) * minY; ball.vx = Math.sign(ball.vx || 1) * Math.sqrt(Math.max(0, speed ** 2 - ball.vy ** 2)); }
}
function damageBrick(brick, ball) {
  brick.hit = .14; if (!brick.breakable) { burst(ball.x, ball.y, '#b6c0d9', 4); audio.playSfx('metal'); return; }
  brick.hp -= 1; game.score += brick.score; burst(ball.x, ball.y, TYPES[brick.type].color, 8);
  audio.playSfx(brick.type === 2 ? 'strong' : 'brick');
  if (brick.hp <= 0) { brick.destroyed = true; if (brick.type === 4 && Math.random() < C.dropChance) spawnPowerUp(brick); }
}
function updateBall(ball, dt) {
  const distance = ballSpeed(ball) * dt; const steps = clamp(Math.ceil(distance / ball.radius), 1, 8); const step = dt / steps;
  for (let i = 0; i < steps; i += 1) {
    ball.trail.push({ x: ball.x, y: ball.y, life: .18 }); if (ball.trail.length > 7) ball.trail.shift();
    ball.x += ball.vx * step; ball.y += ball.vy * step;
    if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx = Math.abs(ball.vx); audio.playSfx('wall'); }
    if (ball.x + ball.radius > C.width) { ball.x = C.width - ball.radius; ball.vx = -Math.abs(ball.vx); audio.playSfx('wall'); }
    if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy = Math.abs(ball.vy); audio.playSfx('wall'); }
    bounceOffPaddle(ball);
    const hitIds = new Set();
    for (const brick of game.bricks) {
      if (brick.destroyed || hitIds.has(brick.id)) continue;
      const collision = circleRectCollision(ball, brick); if (!collision) continue;
      hitIds.add(brick.id); damageBrick(brick, ball);
      if (!game.effects.has('pierce')) {
        // 先沿碰撞法线将球完全推出砖块，再按法线反射速度，防止下一帧重复命中同一位置。
        ball.x += collision.normalX * (collision.depth + .1);
        ball.y += collision.normalY * (collision.depth + .1);
        const velocityAlongNormal = ball.vx * collision.normalX + ball.vy * collision.normalY;
        if (velocityAlongNormal < 0) {
          ball.vx -= 2 * velocityAlongNormal * collision.normalX;
          ball.vy -= 2 * velocityAlongNormal * collision.normalY;
        }
        break;
      }
    }
  }
  ball.trail.forEach((point) => { point.life -= dt; }); ball.trail = ball.trail.filter((point) => point.life > 0);
  return ball.y - ball.radius <= C.height;
}
function spawnPowerUp(brick) { const type = POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)]; game.powerUps.push({ type, x: brick.x + (brick.width - C.power.width) / 2, y: brick.y, width: C.power.width, height: C.power.height, fallSpeed: C.power.fallSpeed }); }
function applyPowerUp(power, now) {
  game.score += 50;
  if (power.type === 'life') { if (game.lives < C.maxLives) game.lives += 1; else game.score += 250; }
  if (power.type === 'multi') {
    const source = game.balls[0]; if (source) for (const sign of [-1, 1]) { const speed = ballSpeed(source); const angle = Math.atan2(source.vy, source.vx) + sign * .34; game.balls.push(createBall(source.x, source.y, Math.cos(angle) * speed, Math.sin(angle) * speed, true)); }
  }
  if (power.type === 'extend') { const center = game.paddle.x + game.paddle.width / 2; game.paddle.width = game.paddle.baseWidth * 1.5; game.paddle.x = clamp(center - game.paddle.width / 2, 0, C.width - game.paddle.width); game.effects.set('extend', { expiresAt: now + C.power.extend * 1000 }); }
  if (power.type === 'slow') { if (!game.effects.has('slow')) for (const ball of game.balls) { ball.vx *= .75; ball.vy *= .75; } game.effects.set('slow', { expiresAt: now + C.power.slow * 1000 }); }
  if (power.type === 'pierce') game.effects.set('pierce', { expiresAt: now + C.power.pierce * 1000 });
  burst(power.x + power.width / 2, power.y, POWER_COLORS[power.type], 13); game.flash = .25; audio.playSfx('power'); updateUI();
}
function updatePowerUps(dt, now) { game.powerUps = game.powerUps.filter((power) => { power.y += power.fallSpeed * dt; if (rectsOverlap(power, game.paddle)) { applyPowerUp(power, now); return false; } return power.y <= C.height; }); }
function burst(x, y, color, count) { for (let i = 0; i < count; i += 1) { const angle = Math.random() * Math.PI * 2, speed = 35 + Math.random() * 100; game.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .32 + Math.random() * .18, maxLife: .5, color }); } }
function loseBall() { game.lives -= 1; resetEffects(); audio.playSfx('lost'); if (game.lives > 0) prepareBall(); else { game.status = STATUS.GAME_OVER; audio.stopMusic(); showOverlay('能量耗尽', `本局得分 ${game.score}，再来一局？`, '重新开始', 'GAME_OVER', 'GAME OVER'); } updateUI(); }
function clearLevel() { game.score += game.lives * 500; game.status = STATUS.LEVEL_CLEAR; const last = game.levelIndex === LEVELS.length - 1; audio.playSfx(last ? 'victory' : 'clear'); if (last) audio.stopMusic(); showOverlay(last ? '最后一关已清除' : `关卡 ${game.levelIndex + 1} 完成`, `奖励 ${game.lives * 500} 分 · ${last ? '准备迎接最终结算。' : '点击进入下一关。'}`, last ? '查看结算' : '下一关', 'LEVEL_CLEAR', 'LEVEL CLEAR'); updateUI(); }
function update(dt, now) {
  if (game.status !== STATUS.PLAYING) return;
  updatePaddle(dt); updateEffects(now);
  game.balls = game.balls.filter((ball) => updateBall(ball, dt));
  updatePowerUps(dt, now);
  if (game.bricks.every((brick) => !brick.breakable || brick.destroyed)) { clearLevel(); return; }
  if (game.balls.length === 0) loseBall();
}

function roundRect(x, y, width, height, radius) { ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); }
function draw() {
  ctx.clearRect(0, 0, C.width, C.height);
  const bg = ctx.createLinearGradient(0, 0, 0, C.height); bg.addColorStop(0, '#171c42'); bg.addColorStop(1, '#090d24'); ctx.fillStyle = bg; ctx.fillRect(0, 0, C.width, C.height);
  ctx.strokeStyle = 'rgba(153, 179, 255, .08)'; ctx.lineWidth = 1;
  for (let x = 0; x <= C.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, C.height); ctx.stroke(); }
  for (let y = 0; y <= C.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(C.width, y); ctx.stroke(); }
  for (const brick of game.bricks) if (!brick.destroyed) {
    const info = TYPES[brick.type]; const alpha = brick.hit > 0 ? .55 : 1; brick.hit = Math.max(0, brick.hit - 1 / 60);
    ctx.save(); ctx.globalAlpha = alpha; ctx.shadowBlur = 14; ctx.shadowColor = info.color; roundRect(brick.x, brick.y, brick.width, brick.height, 6); ctx.fillStyle = info.color; ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = brick.type === 3 ? '#5f6881' : 'rgba(255,255,255,.22)'; roundRect(brick.x + 2, brick.y + 2, brick.width - 4, 5, 3); ctx.fill();
    if (brick.type === 2) { ctx.fillStyle = '#202846'; ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(brick.hp), brick.x + brick.width / 2, brick.y + 17); }
    if (brick.type === 4) { ctx.fillStyle = '#291d4d'; ctx.font = '800 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('◆', brick.x + brick.width / 2, brick.y + 17); } ctx.restore();
  }
  for (const power of game.powerUps) { ctx.save(); ctx.shadowBlur = 13; ctx.shadowColor = POWER_COLORS[power.type]; roundRect(power.x, power.y, power.width, power.height, 5); ctx.fillStyle = POWER_COLORS[power.type]; ctx.fill(); ctx.fillStyle = '#16213c'; ctx.font = '800 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(POWER_LABELS[power.type], power.x + power.width / 2, power.y + 12); ctx.restore(); }
  if (game.paddle) { ctx.save(); ctx.shadowBlur = 18; ctx.shadowColor = '#92f7ff'; const gradient = ctx.createLinearGradient(game.paddle.x, 0, game.paddle.x + game.paddle.width, 0); gradient.addColorStop(0, '#65d9ff'); gradient.addColorStop(1, '#e0a1ff'); roundRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height, 8); ctx.fillStyle = gradient; ctx.fill(); ctx.restore(); }
  for (const ball of game.balls) { for (const point of ball.trail) { ctx.globalAlpha = point.life / .18 * .3; ctx.beginPath(); ctx.arc(point.x, point.y, ball.radius * .75, 0, Math.PI * 2); ctx.fillStyle = '#87f6ff'; ctx.fill(); } ctx.globalAlpha = 1; ctx.save(); ctx.shadowBlur = 19; ctx.shadowColor = '#b9ffff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fillStyle = '#efffff'; ctx.fill(); ctx.restore(); }
  for (const p of game.particles) { ctx.globalAlpha = Math.max(0, p.life / p.maxLife); ctx.fillStyle = p.color; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); } ctx.globalAlpha = 1;
  if (game.status === STATUS.READY) { ctx.fillStyle = 'rgba(239, 247, 255, .78)'; ctx.font = '700 15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('按 Enter 发射能量球', C.width / 2, C.height - 70); }
  if (game.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${game.flash * .28})`; ctx.fillRect(0, 0, C.width, C.height); game.flash = Math.max(0, game.flash - 1 / 60); }
}
function updateParticles(dt) { game.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 140 * dt; p.life -= dt; }); game.particles = game.particles.filter((p) => p.life > 0); }
function frame(time) { const dt = Math.min((time - game.lastTime) / 1000 || 0, C.maxDelta); game.lastTime = time; update(dt, time); updateParticles(dt); draw(); requestAnimationFrame(frame); }

function handleOverlayAction() {
  const mode = ui.overlay.dataset.mode;
  audio.ensureStarted();
  if (mode === 'START' || mode === 'GAME_OVER' || mode === 'VICTORY') startGame();
  else if (mode === 'PAUSED') togglePause();
  else if (mode === 'LEVEL_CLEAR') { if (game.levelIndex === LEVELS.length - 1) { game.status = STATUS.VICTORY; showOverlay('全部关卡完成', `最终得分 ${game.score}。你已掌握霓虹球场！`, '再玩一次', 'VICTORY', 'VICTORY'); } else { loadLevel(game.levelIndex + 1); hideOverlay(); } }
}
function keyDown(event) {
  const key = event.code; if (['ArrowLeft', 'ArrowRight', 'Space', 'Enter'].includes(key)) event.preventDefault();
  audio.ensureStarted();
  if (event.repeat && ['Enter', 'Space', 'Escape'].includes(key)) return;
  if (key === 'ArrowLeft' || key === 'KeyA') game.keys.left = true;
  if (key === 'ArrowRight' || key === 'KeyD') game.keys.right = true;
  if (key === 'Enter') { if (game.status === STATUS.READY) launch(); else if ([STATUS.START, STATUS.GAME_OVER, STATUS.LEVEL_CLEAR, STATUS.VICTORY].includes(game.status)) handleOverlayAction(); }
  if (key === 'Space' || key === 'Escape') togglePause();
}
function keyUp(event) { if (event.code === 'ArrowLeft' || event.code === 'KeyA') game.keys.left = false; if (event.code === 'ArrowRight' || event.code === 'KeyD') game.keys.right = false; }
window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp); window.addEventListener('blur', () => { game.keys.left = false; game.keys.right = false; if (game.status === STATUS.PLAYING || game.status === STATUS.READY) togglePause(); });
ui.button.addEventListener('click', handleOverlayAction); ui.audioToggle.addEventListener('click', async () => {
  await audio.toggleMuted();
  if (!audio.muted && [STATUS.PAUSED, STATUS.LEVEL_CLEAR, STATUS.GAME_OVER, STATUS.VICTORY].includes(game.status)) await audio.pauseMusic();
});

game.paddle = createPaddle(); game.balls = [createBall(C.width / 2, game.paddle.y - C.ball.radius - 1)];
showOverlay('霓虹打砖块', '左右方向键或 A / D 移动挡板，Enter 发球 \n击碎所有砖块，完成三道挑战', '开始游戏', 'START', 'READY PLAYER ONE'); updateUI(); audio.initialize(); requestAnimationFrame(frame);
