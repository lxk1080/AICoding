# claude-snake

浏览器贪吃蛇小游戏，前端原生 JS + HTML + CSS，后端 Node.js（Express），
通过 `localhost:3031` 访问。

## 技术栈

- **后端**: Node.js + Express，仅托管静态文件
- **前端**: 原生 JavaScript、HTML5 Canvas、CSS
- **通信**: 纯前端游戏逻辑，后端不参与实时状态，仅提供 HTTP 静态服务

## 项目结构

```
claude-snake/
├── server.js          # Express 服务入口，监听 3031 端口
├── package.json       # 项目依赖与启动脚本
├── CLAUDE.md          # 本文档
├── public/
│   ├── index.html     # 游戏主页面（结构 + 布局）
│   ├── style.css      # 页面样式
│   └── script.js      # 游戏核心逻辑（Canvas 渲染、状态机、键盘事件）
└── docs/
    ├── gaiyao.md      # 概要设计
    └── xiangxi.md     # 详细设计
```

## 启动方式

```bash
cd claude-snake
npm install
npm start        # 启动后访问 http://localhost:3031
```

## 关键约定

- 所有游戏逻辑在 `public/script.js` 中，不依赖额外前端框架
- 后端只提供静态文件服务，不做 WebSocket 或 API
- 游戏状态机：`idle` → `playing` ↔ `paused` → `idle`
- 画布尺寸固定，蛇和食物用网格坐标表示
- 右键操作面板固定宽度，左侧画布自适应剩余宽度
