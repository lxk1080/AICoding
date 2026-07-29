# 概要设计文档 — claude-express

## 1. 项目概述

使用 Node.js 和 Express 框架搭建一个最简单的 Web 服务，在浏览器中访问 `http://localhost:3000` 时显示 "Hello World"。

## 2. 技术栈

| 层面 | 技术 |
|------|------|
| 运行时 | Node.js（v18+ LTS） |
| Web 框架 | Express ^4.21.x |
| 包管理器 | npm |
| 版本管理 | Git |

## 3. 系统架构

```
┌─────────┐     HTTP      ┌──────────────┐
│  Browser │ ──────────→  │  Express App │
│ (Client) │ ←──────────  │  :3000       │
└─────────┘     HTML      └──────────────┘
```

- 浏览器向 `localhost:3000` 发起 GET 请求
- Express 应用监听 3000 端口，返回 "Hello World" 文本

## 4. 模块划分

```
claude-express/
├── package.json          # 项目元数据与依赖声明
├── app.js                # 应用入口，服务启动与路由注册
├── CLAUDE.md             # AI 辅助配置文件
└── docs/
    ├── gaiyao.md         # 本文件 — 概要设计
    └── xiangxi.md        # 详细设计
```

### 模块职责

| 文件 | 职责 |
|------|------|
| `package.json` | 声明项目名称、版本、启动脚本、依赖（express） |
| `app.js` | 创建 Express 实例，注册根路由，监听 3000 端口 |
| `CLAUDE.md` | 记录项目上下文、技术栈、目录结构，方便 AI 协作 |

## 5. 路由设计

| 方法 | 路径 | 响应 |
|------|------|------|
| GET | `/` | 返回字符串 `Hello World`，状态码 200 |

仅一个根路由，无需其他接口。

## 6. 端口说明

- 默认端口：**3000**
- 如需修改，通过环境变量 `PORT` 覆盖

## 7. 非功能性要求

- 服务启动后在控制台打印启动日志
- 优雅处理未匹配路由（返回 404）
- 代码风格使用 StandardJS / Prettier 规则
