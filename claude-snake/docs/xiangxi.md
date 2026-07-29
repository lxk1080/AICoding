# 详细设计

## 1. 文件清单与职责

| 文件 | 职责 |
|------|------|
| `package.json` | 项目元数据、npm scripts、依赖声明（express） |
| `server.js` | Express 服务：监听 3031 端口，`express.static('public')` |
| `public/index.html` | HTML 骨架：标题栏、左右两栏容器、引入 CSS/JS |
| `public/style.css` | 布局、颜色、字体、按钮样式、响应式 |
| `public/script.js` | 游戏引擎：状态管理、Canvas 绘制、键盘事件、游戏循环 |

## 2. 后端设计

**server.js**

- 使用 Express 框架
- `express.static('public')` 托管静态文件
- `app.listen(3031)` 启动
- 无路由自定义，无 API 端点

**package.json**

```json
{
  "name": "claude-snake",
  "scripts": { "start": "node server.js" },
  "dependencies": { "express": "^4" }
}
```

## 3. 前端设计

### 3.1 HTML 结构（index.html）

```
<div id="container">
  <h1>🐍 贪吃蛇</h1>
  <div id="game-wrapper">
    <div id="canvas-area">
      <canvas id="gameCanvas" width="400" height="400"></canvas>
    </div>
    <div id="panel">
      <button id="btnStart">开始游戏</button>
      <button id="btnStop">结束游戏</button>
      <hr>
      <div class="instructions">
        <h3>操作说明</h3>
        <p>↑ 上</p>
        <p>↓ 下</p>
        <p>← 左</p>
        <p>→ 右</p>
        <p>空格 暂停/继续</p>
      </div>
    </div>
  </div>
</div>
```

### 3.2 布局与样式（style.css）

- `#container`：`max-width: 820px; margin: 0 auto; text-align: center`
- `#game-wrapper`：`display: flex; justify-content: center; gap: 20px`
- `#gameCanvas`：`border: 2px solid #333; background: #111`
- `#panel`：`width: 200px; display: flex; flex-direction: column; align-items: center`
- 按钮：统一宽 140px，间距 10px，hover 反馈
- 操作说明区域：左对齐，间隔 6px

### 3.3 游戏引擎（script.js）

#### 常量

```js
const GRID_SIZE = 20;       // 每格像素
const COLS = 20;            // 列数
const ROWS = 20;            // 行数
const TICK_INTERVAL = 200;  // 毫秒（5帧/秒）
const DIRECTIONS = { UP, DOWN, LEFT, RIGHT };
const OPPOSITE = { UP: DOWN, DOWN: UP, LEFT: RIGHT, RIGHT: LEFT };
```

#### 核心数据结构

```js
// 蛇身：坐标数组，索引 0 为蛇头
let snake = [{x: 10, y: 10}];
// 当前方向
let direction = 'RIGHT';
// 下一帧方向（用于缓冲，防止同帧内反向）
let nextDirection = 'RIGHT';
// 食物位置
let food = {x: 15, y: 10};
// 分数
let score = 0;
// 状态
let state = 'idle';  // 'idle' | 'playing' | 'paused' | 'gameover'
// 定时器 ID
let gameLoop = null;
```

#### 函数清单

| 函数 | 说明 |
|------|------|
| `init()` | 页面加载完成时调用，绑定事件、绘制初始画布 |
| `drawGrid()` | 绘制 20×20 网格线（暗灰色半透明） |
| `drawSnake()` | 绘制蛇身：蛇头用稍亮颜色区分，蛇身用绿色方块 |
| `drawFood()` | 在 food 坐标绘制红色方块 |
| `drawPausing()` | state=paused 时在画布中央绘制半透明遮罩 + "pausing" 文字 |
| `drawScore()` | 在画布右上角或标题区显示当前分数 |
| `render()` | 清空画布 → drawGrid → drawFood → drawSnake → (paused时)drawPausing |
| `spawnFood()` | 在蛇身未占用的随机空位生成食物 |
| `moveSnake()` | 根据 direction 移动蛇头 → 检查是否吃到食物（增长/不删尾）→ 检查碰撞 |
| `checkCollision()` | 蛇头超出边界或与蛇身重叠 → 返回 true |
| `gameOver()` | 停止循环 → state='gameover' → render → 显示结束信息 |
| `startGame()` | 重置蛇/方向/分数 → state='playing' → 生成食物 → 启动 tick |
| `stopGame()` | 清除定时器 → state='idle' → render |
| `togglePause()` | playing → paused / paused → playing |
| `tick()` | setInterval 回调：moveSnake → render |
| `handleKeydown(e)` | 键盘事件：↑↓←→ 更新方向（防反向），空格切换暂停 |
| `bindButtons()` | 绑定"开始游戏""结束游戏"按钮的 click 事件 |

#### 关键逻辑细节

**移动与增长**
```
snakeHead = {x: snake[0].x + dx, y: snake[0].y + dy}
snake.unshift(snakeHead)
if (snakeHead equals food) {
  score++; spawnFood()   // 不 pop，蛇身+1
} else {
  snake.pop()            // 移除尾，保持长度
}
```

**防反向**
在 handleKeydown 中：如果新方向与当前 direction 相反则忽略。
使用 `nextDirection` 缓冲变量，在 tick 的 moveSnake 开头将 direction 更新为 nextDirection，
避免同一帧内多次按键导致穿身。

**暂停遮罩**
`drawPausing()` 在画布上绘制黑色半透明矩形覆盖层，中央白色 "pausing" 文字，
字体大小 36px，加粗。

**碰撞判定**
- 边界碰撞：`head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS`
- 自碰：`snake.slice(1).some(seg => seg.x === head.x && seg.y === head.y)`

**游戏结束展示**
state='gameover' 时，画布上显示 "游戏结束" + 最终分数，用户可点击"开始游戏"重新开始。

### 3.4 事件绑定

- `DOMContentLoaded` → `init()`
- `keydown` → `handleKeydown(e)`（监听 document）
- 按钮 click → `startGame()` / `stopGame()`

防止页面滚动：方向键和空格键事件中调用 `e.preventDefault()`。

## 4. 与其他项目的差异点

本项目专注于：
1. 最简架构 —— 后端仅静态托管
2. 纯原生前端，无框架依赖
3. Canvas 网格渲染，非 DOM 元素定位
4. 清晰的状态机控制游戏生命周期
