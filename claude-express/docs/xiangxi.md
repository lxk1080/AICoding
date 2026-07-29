# 详细设计文档 — claude-express

## 1. 文件职责与实现细节

### 1.1 `package.json`

**字段说明：**

| 字段 | 值 | 说明 |
|------|-----|------|
| `name` | `"claude-express"` | 项目标识 |
| `version` | `"1.0.0"` | 初始版本 |
| `private` | `true` | 防止误发布到 npm |
| `main` | `"app.js"` | 入口文件 |
| `scripts.start` | `"node app.js"` | 启动命令 |
| `scripts.dev` | `"node --watch app.js"` | 开发模式（Node v18+ 原生 watch） |
| `dependencies.express` | `"^4.21.0"` | Express 框架 |

**依赖安装命令：**

```bash
npm init -y              # 生成 package.json
npm install express      # 安装 Express
```

### 1.2 `app.js`

#### 伪代码 / 逻辑流程

```
1. 导入 express 模块
2. 创建 express 应用实例 (app)
3. 读取 PORT 环境变量，默认 3000
4. 定义根路由 GET "/"
   → 响应: res.send('Hello World')
5. 定义 404 兜底中间件（所有未匹配路由）
   → 响应: res.status(404).send('Not Found')
6. 调用 app.listen(PORT, callback)
   → 回调: 控制台输出 `Server running at http://localhost:${PORT}`
```

#### 关键实现要点

- `res.send()` 自动设置 `Content-Type: text/html; charset=utf-8`
- 路由注册顺序：精确路由（`/`）在前，兜底（`*`）在后
- 默认监听 `0.0.0.0`，允许局域网访问

#### 启动日志示例

```
Server running at http://localhost:3000
```

### 1.3 `CLAUDE.md`

记录项目元数据如下：

- 项目名称与根目录
- 技术栈（Node.js + Express）
- 目录结构摘要
- 启动命令（`npm start`）
- 端口说明
- 设计文档索引

## 2. 运行流程

```
Terminal                          Browser
───────                           ──────
$ npm start
    │
    ├─→ 读取 package.json
    ├─→ 加载 express 模块
    ├─→ 创建 app 实例
    ├─→ 注册路由
    ├─→ 监听 3000 端口
    │
    │   打开 http://localhost:3000 ─────────→ GET /
    │                                        │
    │    ←──── "Hello World" (200) ──────────┘
    │
    │   访问 http://localhost:3000/xxx ────→ (未匹配)
    │                                        │
    │    ←──── "Not Found" (404) ─────────────┘
```

## 3. 端口配置

通过环境变量 `PORT` 覆盖默认端口：

```bash
# Windows CMD
set PORT=5000 && npm start

# PowerShell
$env:PORT=5000; npm start

# Git Bash / Linux / macOS
PORT=5000 npm start
```

## 4. 错误处理策略

| 场景 | 处理方式 | HTTP 状态码 |
|------|---------|-------------|
| 正常访问 `/` | 返回 Hello World | 200 |
| 访问未知路径 | 返回 Not Found | 404 |
| 端口被占用 | Node.js 抛出 `EADDRINUSE` 错误，进程退出 | — |

## 5. 开发与调试

| 命令 | 用途 |
|------|------|
| `npm start` | 生产启动 |
| `npm run dev` | 开发模式（文件修改自动重启） |
| `npx nodemon app.js` | 使用 nodemon 热重载（可选，非必须） |

## 6. 验证方式

1. 启动服务：`npm start`
2. 浏览器访问 `http://localhost:3000`
3. 页面显示 `Hello World`
4. 控制台应无报错日志

## 7. 扩展备忘（后续可做）

- 增加 `public/` 静态资源目录
- 引入模板引擎（EJS / Pug）
- 添加 `routes/` 拆分路由模块
- 添加单元测试（Jest + supertest）
