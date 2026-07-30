# 记账本详细设计文档

## 1. 模块划分

| 文件 | 职责 |
|---|---|
| `app.py` | Streamlit 应用入口，负责页面布局组合与整体渲染流程 |
| `components.py` | 所有 Streamlit UI 组件，包括表单、统计卡片、图表、明细列表 |
| `database.py` | sqlite3 数据库初始化与所有数据操作（增删改查、统计） |
| `models.py` | 数据模型、枚举与常量定义（记账类型、分类列表等） |
| `utils.py` | 工具函数：日期格式化、月份计算、人民币格式化等 |
| `requirements.txt` | 项目依赖清单 |

### 1.1 依赖清单

```
streamlit>=1.38.0
pandas>=2.0.0
```

- **streamlit**：Web 界面框架。
- **pandas**：用于将统计数据转换为 `st.bar_chart` / `st.line_chart` 所需的 DataFrame 格式。
- **sqlite3**：Python 内置，无需额外安装。

---

## 2. 数据模型

### 2.1 数据库表结构

**表名：`records`**

| 字段名 | 类型 | 说明 |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | 自增主键 |
| `type` | TEXT NOT NULL | 记录类型：`income`（收入）/ `expense`（支出） |
| `amount` | REAL NOT NULL | 金额，保留两位小数 |
| `category` | TEXT NOT NULL | 分类名称 |
| `date` | TEXT NOT NULL | 日期，格式 `YYYY-MM-DD` |
| `note` | TEXT | 备注，可为空 |
| `created_at` | TEXT | 创建时间，格式 `YYYY-MM-DD HH:MM:SS` |

### 2.2 Python 数据表示

```python
# models.py
from dataclasses import dataclass
from datetime import date
from enum import Enum

class RecordType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"

EXPENSE_CATEGORIES = ["餐饮", "交通", "购物", "娱乐", "居住", "医疗", "教育", "其他"]
INCOME_CATEGORIES = ["工资", "奖金", "投资", "兼职", "红包", "其他"]

@dataclass
class Record:
    id: int | None
    type: RecordType
    amount: float
    category: str
    date: date
    note: str
```

---

## 3. 数据库操作设计

### 3.1 初始化数据库

```python
def init_db(db_path: str = "data/accounting.db") -> sqlite3.Connection
```

- 创建 `data` 目录（如果不存在）
- 创建 `records` 表（如果不存在）
- 返回数据库连接

### 3.2 新增记录

```python
def add_record(record: Record) -> int
```

- 插入一条记录
- 返回新记录的主键 ID

### 3.3 查询记录

```python
def get_records(month: str | None = None) -> list[Record]
```

- `month` 格式为 `YYYY-MM`
- 返回符合月份条件的记录列表，按日期倒序
- 不传 `month` 时返回全部记录

### 3.4 删除记录

```python
def delete_record(record_id: int) -> bool
```

- 根据 ID 删除记录
- 返回是否删除成功

### 3.5 统计查询

```python
def get_monthly_summary(year_month: str) -> dict
def get_category_summary(year_month: str) -> list[dict]
def get_trend_summary(months: int = 6) -> list[dict]
```

- `get_monthly_summary`：查询指定月份的收入、支出、结余
- `get_category_summary`：查询指定月份支出分类占比
- `get_trend_summary`：查询最近 N 个月收支趋势

---

## 4. 页面设计

### 4.1 页面结构

```python
# app.py 主函数结构
def main():
    st.set_page_config(...)
    init_db()
    render_header()

    left_col, right_col = st.columns([1, 2])
    with left_col:
        render_add_form()
    with right_col:
        selected_month = render_month_selector()
        render_summary(selected_month)
        render_category_chart(selected_month)
        render_trend_chart()
        render_records_list(selected_month)
```

主要组件位于 `components.py`：

| 函数 | 文件 | 职责 |
|---|---|---|
| `render_header` | `components.py` | 渲染页面标题和副标题 |
| `render_add_form` | `components.py` | 渲染快速记账表单 |
| `render_month_selector` | `components.py` | 渲染月份筛选器 |
| `render_summary` | `components.py` | 渲染月度统计卡片 |
| `render_category_chart` | `components.py` | 渲染分类支出图表 |
| `render_trend_chart` | `components.py` | 渲染收支趋势图 |
| `render_records_list` | `components.py` | 渲染明细列表与删除功能 |

### 4.2 各组件说明

#### 4.2.1 页面标题

- 使用 `st.title("🧾 记账本")`

#### 4.2.2 快速记账表单

使用 `st.form("add_record_form")` 包裹以下组件：

| 组件 | Streamlit API | 说明 |
|---|---|---|
| 类型选择 | `st.radio` | 收入 / 支出 |
| 金额输入 | `st.number_input` | min=0.01, step=0.01, format="%.2f" |
| 分类选择 | `st.selectbox` | 根据类型动态切换分类列表 |
| 日期选择 | `st.date_input` | 默认当天 |
| 备注输入 | `st.text_input` | 可选 |
| 保存按钮 | `st.form_submit_button` | 提交表单 |

提交后调用 `add_record()`，并使用 `st.success()` 提示，再调用 `st.rerun()` 刷新页面。

#### 4.2.3 统计卡片

使用 `st.columns(3)` 展示：

- 本月收入：`st.metric("本月收入", f"¥{income:.2f")`
- 本月支出：`st.metric("本月支出", f"¥{expense:.2f")`
- 本月结余：`st.metric("本月结余", f"¥{balance:.2f")`

#### 4.2.4 分类支出图表

使用 `st.bar_chart` 展示本月支出分类数据。

#### 4.2.5 收支趋势图

使用 `st.line_chart` 展示近 6 个月收支趋势。

#### 4.2.6 月份筛选

使用 `st.selectbox` 展示可选月份列表，默认当前月。

#### 4.2.7 明细列表

- 使用 `st.dataframe` 展示当月记录。
- 删除功能放在 `st.expander` 中：选择记录后点击确认删除，避免每行一个按钮导致界面拥挤。

---

## 5. 交互流程

### 5.1 新增记录

```
用户填写表单 → 点击保存 → Streamlit 提交表单 →
校验数据 → 调用 add_record() → 写入 sqlite3 →
显示成功提示 → 页面重跑 → 更新统计和列表
```

### 5.2 删除记录

```
用户点击删除按钮 → 调用 delete_record() →
从 sqlite3 删除 → 页面重跑 → 列表移除该记录
```

### 5.3 切换月份

```
用户选择月份 → Streamlit 重跑 →
重新查询当月数据 → 更新统计、图表、列表
```

---

## 6. 错误处理

| 场景 | 处理方式 |
|---|---|
| 金额为空或小于等于 0 | 表单提交前校验，提示用户 |
| 数据库连接失败 | 页面顶部显示 `st.error()` 错误信息 |
| 删除记录失败 | 显示错误提示，不刷新页面 |
| 数据库文件损坏 | 尝试备份并重建数据库 |

---

## 7. 性能考虑

- 数据库查询使用索引：在 `date` 字段上建立索引以加速月份查询。
- 当前数据量较小，未使用 Streamlit 缓存；后续记录增多时，可对统计查询使用 `@st.cache_data` 减少重复计算。
- 分页加载：记录数量较大时，明细列表可考虑限制返回条数。

---

## 8. 安全考虑

- 本应用为本地单用户使用，不实现登录认证。
- 金额输入在服务端做类型和范围校验。
- 用户输入的备注字段使用参数化查询防止 SQL 注入。

---

## 9. 后续扩展接口

| 功能 | 实现思路 |
|---|---|
| 导入 CSV | 上传 CSV 文件，解析后批量插入数据库 |
| 导出 CSV | 查询全部记录，生成 CSV 文件下载 |
| 预算提醒 | 新增 `budgets` 表，按分类/月份设置预算 |
| 多账本 | 新增 `books` 表，记录关联到不同账本 |
| 用户登录 | 引入密码哈希和会话管理 |

---

## 10. 测试计划

| 测试项 | 预期结果 |
|---|---|
| 新增一笔支出 | 数据库新增记录，页面列表和统计更新 |
| 新增一笔收入 | 本月收入金额增加，结余正确 |
| 删除一条记录 | 数据库记录删除，页面同步移除 |
| 切换月份筛选 | 只显示该月份记录 |
| 输入非法金额 | 表单校验失败，不写入数据库 |
| 重启应用 | 历史记录仍然保留 |
