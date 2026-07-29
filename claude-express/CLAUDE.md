# CLAUDE.md — claude-express

## 项目概述

基于 Node.js + Express 的 Hello World Web 服务。

## 技术栈

- **运行时**: Node.js v18+ (LTS)
- **框架**: Express ^4.21.x
- **包管理**: npm

## 目录结构

```
claude-express/
├── app.js           # 应用入口
├── package.json     # 依赖与脚本
├── CLAUDE.md        # 本文件
└── docs/
    ├── gaiyao.md    # 概要设计
    └── xiangxi.md   # 详细设计
```

## 常用命令

| 用途 | 命令 |
|------|------|
| 启动服务 | `npm start` |
| 开发模式（自动重启） | `npm run dev` |

## 端口

- 默认 **3000**，通过环境变量 `PORT` 覆盖

## 设计文档

- [概要设计](docs/gaiyao.md)
- [详细设计](docs/xiangxi.md)
