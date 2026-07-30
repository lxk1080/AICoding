"""
工具函数模块：日期、月份、格式化等通用函数。
"""

from datetime import date, timedelta
from calendar import monthrange


def format_currency(value: float) -> str:
    """格式化为人民币金额字符串。"""
    return f"¥{value:,.2f}"


def get_current_month() -> str:
    """获取当前月份，格式 YYYY-MM。"""
    today = date.today()
    return f"{today.year:04d}-{today.month:02d}"


def get_month_start_end(month_str: str) -> tuple[date, date]:
    """根据 YYYY-MM 获取该月的第一天和最后一天。"""
    year, month = map(int, month_str.split("-"))
    first_day = date(year, month, 1)
    last_day_num = monthrange(year, month)[1]
    last_day = date(year, month, last_day_num)
    return first_day, last_day


def month_label(month_str: str) -> str:
    """将 YYYY-MM 转换为中文标签，如 2026-07 → 2026年7月。"""
    year, month = map(int, month_str.split("-"))
    return f"{year}年{month}月"


def generate_recent_months(count: int = 12) -> list[str]:
    """生成最近 count 个月份列表，格式 YYYY-MM，倒序。"""
    today = date.today()
    months = []
    for i in range(count):
        year = today.year
        month = today.month - i
        while month <= 0:
            year -= 1
            month += 12
        months.append(f"{year:04d}-{month:02d}")
    return months
