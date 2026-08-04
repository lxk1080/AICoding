"""
数据库模块：负责 sqlite3 数据库初始化与所有数据操作。
"""

import os
import sqlite3
from datetime import datetime, date
from typing import Optional

from models import Record, RecordType, EXPENSE_CATEGORIES, INCOME_CATEGORIES

DEFAULT_DB_PATH = "data/accounting.db"


def get_connection(db_path: str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    """获取数据库连接，并确保数据库目录存在。"""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    """初始化数据库：创建表和索引。"""
    conn = get_connection(db_path)
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                note TEXT,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_records_date ON records(date)
        """)
        # 分类表
        conn.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                name TEXT NOT NULL,
                is_default INTEGER NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                UNIQUE(type, name)
            )
        """)
        # 如果分类表为空，插入默认分类
        count = conn.execute("SELECT COUNT(*) as cnt FROM categories").fetchone()["cnt"]
        if count == 0:
            for i, cat in enumerate(EXPENSE_CATEGORIES):
                conn.execute(
                    "INSERT INTO categories (type, name, is_default, sort_order) VALUES (?, ?, 1, ?)",
                    (RecordType.EXPENSE.value, cat, i),
                )
            for i, cat in enumerate(INCOME_CATEGORIES):
                conn.execute(
                    "INSERT INTO categories (type, name, is_default, sort_order) VALUES (?, ?, 1, ?)",
                    (RecordType.INCOME.value, cat, i),
                )
    return conn


def add_record(record: Record, db_path: str = DEFAULT_DB_PATH) -> int:
    """新增一条记录，返回记录 ID。"""
    conn = get_connection(db_path)
    with conn:
        cursor = conn.execute(
            """
            INSERT INTO records (type, amount, category, date, note, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                record.type.value,
                record.amount,
                record.category,
                record.date.isoformat(),
                record.note,
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            ),
        )
    return cursor.lastrowid


def delete_record(record_id: int, db_path: str = DEFAULT_DB_PATH) -> bool:
    """根据 ID 删除记录。"""
    conn = get_connection(db_path)
    with conn:
        cursor = conn.execute("DELETE FROM records WHERE id = ?", (record_id,))
    return cursor.rowcount > 0


def _row_to_record(row: sqlite3.Row) -> Record:
    """将数据库行转换为 Record 对象。"""
    return Record(
        id=row["id"],
        type=RecordType(row["type"]),
        amount=row["amount"],
        category=row["category"],
        date=date.fromisoformat(row["date"]),
        note=row["note"] or "",
    )


def get_records(month: Optional[str] = None, db_path: str = DEFAULT_DB_PATH) -> list[Record]:
    """
    查询记录。
    :param month: 格式为 YYYY-MM，为空则返回全部记录
    """
    conn = get_connection(db_path)
    if month:
        rows = conn.execute(
            "SELECT * FROM records WHERE strftime('%Y-%m', date) = ? ORDER BY date DESC, id DESC",
            (month,),
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM records ORDER BY date DESC, id DESC").fetchall()
    return [_row_to_record(row) for row in rows]


def get_all_months(db_path: str = DEFAULT_DB_PATH) -> list[str]:
    """获取所有有记录的月份，格式 YYYY-MM，按降序排列。"""
    conn = get_connection(db_path)
    rows = conn.execute(
        "SELECT DISTINCT strftime('%Y-%m', date) as month FROM records ORDER BY month DESC"
    ).fetchall()
    return [row["month"] for row in rows]


def get_monthly_summary(month: str, db_path: str = DEFAULT_DB_PATH) -> dict:
    """获取指定月份的收入、支出、结余。"""
    conn = get_connection(db_path)
    rows = conn.execute(
        """
        SELECT type, SUM(amount) as total
        FROM records
        WHERE strftime('%Y-%m', date) = ?
        GROUP BY type
        """,
        (month,),
    ).fetchall()

    income = 0.0
    expense = 0.0
    for row in rows:
        if row["type"] == RecordType.INCOME.value:
            income = row["total"] or 0.0
        elif row["type"] == RecordType.EXPENSE.value:
            expense = row["total"] or 0.0

    return {
        "income": income,
        "expense": expense,
        "balance": income - expense,
    }


def get_category_summary(month: str, db_path: str = DEFAULT_DB_PATH) -> dict[str, float]:
    """获取指定月份支出分类汇总。"""
    conn = get_connection(db_path)
    rows = conn.execute(
        """
        SELECT category, SUM(amount) as total
        FROM records
        WHERE type = ? AND strftime('%Y-%m', date) = ?
        GROUP BY category
        ORDER BY total DESC
        """,
        (RecordType.EXPENSE.value, month),
    ).fetchall()
    return {row["category"]: row["total"] for row in rows}


def get_trend_summary(months: int = 6, db_path: str = DEFAULT_DB_PATH) -> dict:
    """
    获取最近 N 个月的收支趋势。
    返回 {"months": [...], "income": [...], "expense": [...]}
    """
    conn = get_connection(db_path)
    rows = conn.execute(
        """
        SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total
        FROM records
        WHERE date >= date('now', '-{} months', 'start of month')
        GROUP BY month, type
        ORDER BY month ASC
        """.format(months)
    ).fetchall()

    # 生成连续月份列表
    today = date.today()
    month_list = []
    for i in range(months - 1, -1, -1):
        d = date(today.year, today.month, 1)
        # 计算往前推 i 个月
        year = d.year
        month = d.month - i
        while month <= 0:
            year -= 1
            month += 12
        month_list.append(f"{year:04d}-{month:02d}")

    income_map = {m: 0.0 for m in month_list}
    expense_map = {m: 0.0 for m in month_list}

    for row in rows:
        m = row["month"]
        if m in income_map:
            if row["type"] == RecordType.INCOME.value:
                income_map[m] = row["total"] or 0.0
            elif row["type"] == RecordType.EXPENSE.value:
                expense_map[m] = row["total"] or 0.0

    return {
        "months": month_list,
        "income": [income_map[m] for m in month_list],
        "expense": [expense_map[m] for m in month_list],
    }


# ========== 分类管理 ==========


def get_categories(record_type: RecordType, db_path: str = DEFAULT_DB_PATH) -> list[dict]:
    """获取指定类型的所有分类，按 sort_order 排序。"""
    conn = get_connection(db_path)
    rows = conn.execute(
        "SELECT id, name, is_default FROM categories WHERE type = ? ORDER BY sort_order",
        (record_type.value,),
    ).fetchall()
    return [{"id": row["id"], "name": row["name"], "is_default": row["is_default"]} for row in rows]


def add_category(record_type: RecordType, name: str, db_path: str = DEFAULT_DB_PATH) -> bool:
    """添加自定义分类，成功返回 True，重名返回 False。"""
    conn = get_connection(db_path)
    # 获取当前最大 sort_order
    row = conn.execute(
        "SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM categories WHERE type = ?",
        (record_type.value,),
    ).fetchone()
    next_order = row["next_order"]
    try:
        with conn:
            conn.execute(
                "INSERT INTO categories (type, name, is_default, sort_order) VALUES (?, ?, 0, ?)",
                (record_type.value, name, next_order),
            )
        return True
    except sqlite3.IntegrityError:
        return False


def delete_category(category_id: int, db_path: str = DEFAULT_DB_PATH) -> bool:
    """删除分类（仅允许删除自定义分类）。"""
    conn = get_connection(db_path)
    with conn:
        cursor = conn.execute(
            "DELETE FROM categories WHERE id = ? AND is_default = 0",
            (category_id,),
        )
    return cursor.rowcount > 0


def rename_category(category_id: int, new_name: str, db_path: str = DEFAULT_DB_PATH) -> bool:
    """重命名分类。"""
    conn = get_connection(db_path)
    try:
        with conn:
            cursor = conn.execute(
                "UPDATE categories SET name = ? WHERE id = ?",
                (new_name, category_id),
            )
        return cursor.rowcount > 0
    except sqlite3.IntegrityError:
        return False
