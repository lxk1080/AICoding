# 记账本（kimi-account-book）

## 项目简介

一个基于 Python + Streamlit + sqlite3 的轻量级网页记账工具，支持收入/支出记录、分类统计、月度趋势查看等功能。

## 技术栈

- **Python 3.10+**
- **Streamlit**：Web 界面框架，纯 Python 编写交互界面
- **sqlite3**：Python 内置数据库，零配置，单文件存储

## 项目结构

```
kimi-account-book/
├── claude.md              # 项目说明文档
├── docs/
│   ├── gaiyao.md          # 概要设计文档
│   └── xiangxi.md         # 详细设计文档
├── src/
│   ├── app.py             # Streamlit 应用入口，负责页面组合
│   ├── components.py      # Streamlit UI 组件（表单、统计、图表、列表）
│   ├── database.py        # sqlite3 数据库初始化与 CRUD 操作
│   ├── models.py          # 数据模型、枚举与常量定义
│   └── utils.py           # 日期、月份、格式化等工具函数
├── requirements.txt       # Python 依赖
└── data/
    └── accounting.db      # SQLite 数据库文件（运行时自动生成）
```

## 功能特性

- 快速记账：收入/支出、金额、分类、日期、备注
- 明细列表：按时间倒序展示，支持删除
- 月度统计：收入、支出、结余
- 分类占比：支出按分类汇总展示
- 趋势分析：近 6 个月收支趋势
- 月份筛选：按月份查看明细和统计

## 安装与运行

### 1. 创建虚拟环境

```bash
cd kimi-account-book
python -m venv venv
```

### 2. 激活虚拟环境

**Windows:**
```bash
venv\Scripts\activate
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 启动应用

```bash
streamlit run src/app.py
```

应用启动后会自动打开浏览器，访问 `http://localhost:8501`。

## 使用说明

1. 在左侧或顶部表单中填写记账信息。
2. 点击「保存」按钮添加记录。
3. 在明细列表中查看、删除记录。
4. 在统计区域查看本月收支和图表分析。

## 数据存储

所有数据保存在 `data/accounting.db` 文件中。建议定期备份该文件。

## 后续可扩展方向

- 导入/导出 CSV、Excel
- 多账本管理
- 预算提醒
- 用户登录与多设备同步
