from enum import Enum
from dataclasses import dataclass
from datetime import date


class RecordType(str, Enum):
    """记账类型"""
    EXPENSE = "expense"
    INCOME = "income"


EXPENSE_CATEGORIES = ["餐饮", "交通", "购物", "娱乐", "居住", "医疗", "教育", "其他"]
INCOME_CATEGORIES = ["工资", "奖金", "投资", "兼职", "红包", "其他"]

CATEGORY_MAP = {
    RecordType.EXPENSE: EXPENSE_CATEGORIES,
    RecordType.INCOME: INCOME_CATEGORIES,
}

TYPE_LABEL_MAP = {
    RecordType.EXPENSE: "支出",
    RecordType.INCOME: "收入",
}


@dataclass
class Record:
    """记账记录数据类"""
    type: RecordType
    amount: float
    category: str
    date: date
    note: str
    id: int | None = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type.value,
            "amount": self.amount,
            "category": self.category,
            "date": self.date.isoformat(),
            "note": self.note,
        }
