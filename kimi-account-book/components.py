"""
UI 组件模块：所有 Streamlit 界面组件。
"""

import streamlit as st
import pandas as pd

from models import Record, RecordType, CATEGORY_MAP, TYPE_LABEL_MAP
from database import (
    add_record,
    delete_record,
    get_records,
    get_all_months,
    get_monthly_summary,
    get_category_summary,
    get_trend_summary,
)
from utils import format_currency, get_current_month, month_label


def render_header():
    """渲染页面标题。"""
    st.title("🧾 记账本")
    st.caption("简单、轻量的个人记账工具")


def render_add_form():
    """渲染快速记账表单。"""
    st.subheader("✏️ 记一笔")

    with st.form("add_record_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        with col1:
            record_type = st.radio(
                "类型",
                options=[RecordType.EXPENSE, RecordType.INCOME],
                format_func=lambda x: TYPE_LABEL_MAP[x],
                horizontal=True,
            )
        with col2:
            amount = st.number_input(
                "金额",
                min_value=0.01,
                step=0.01,
                format="%.2f",
            )

        category = st.selectbox(
            "分类",
            options=CATEGORY_MAP[record_type],
        )

        col3, col4 = st.columns(2)
        with col3:
            record_date = st.date_input("日期", value="today")
        with col4:
            note = st.text_input("备注", placeholder="可选")

        submitted = st.form_submit_button("💾 保存", use_container_width=True)

        if submitted:
            if amount <= 0:
                st.error("金额必须大于 0")
                return

            record = Record(
                type=record_type,
                amount=amount,
                category=category,
                date=record_date,
                note=note,
            )
            add_record(record)
            st.success("保存成功！")
            st.rerun()


def render_month_selector(key: str = "month_selector") -> str:
    """渲染月份筛选器，返回选中的月份 YYYY-MM。"""
    months = get_all_months()
    current_month = get_current_month()

    # 如果没有任何记录，至少显示当前月
    if not months:
        months = [current_month]

    # 如果当前月不在列表中，插入到最前面
    if current_month not in months:
        months = [current_month] + months

    default_index = months.index(current_month) if current_month in months else 0

    selected = st.selectbox(
        "选择月份",
        options=months,
        index=default_index,
        format_func=month_label,
        key=key,
    )
    return selected


def render_summary(month: str):
    """渲染月度统计卡片。"""
    summary = get_monthly_summary(month)

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("本月收入", format_currency(summary["income"]))
    with col2:
        st.metric("本月支出", format_currency(summary["expense"]))
    with col3:
        st.metric("本月结余", format_currency(summary["balance"]))


def render_category_chart(month: str):
    """渲染分类支出图表。"""
    category_data = get_category_summary(month)
    if not category_data:
        st.info("本月暂无支出记录")
        return

    df = pd.DataFrame({
        "分类": list(category_data.keys()),
        "金额": list(category_data.values()),
    })
    df = df.sort_values("金额", ascending=False)

    st.subheader("📊 支出分类")
    st.bar_chart(data=df.set_index("分类"), use_container_width=True)


def render_trend_chart():
    """渲染收支趋势图。"""
    trend = get_trend_summary(months=6)

    df = pd.DataFrame({
        "月份": trend["months"],
        "收入": trend["income"],
        "支出": trend["expense"],
    }).set_index("月份")

    st.subheader("📈 近 6 个月收支趋势")
    st.line_chart(data=df, use_container_width=True)


def render_records_list(month: str):
    """渲染明细列表，每行附带删除按钮。"""
    st.subheader("📝 明细")

    records = get_records(month=month)
    if not records:
        st.info("本月暂无记录")
        return

    # 每行一条记录
    for r in records:
        c1, c2, c3, c4, c5, c6 = st.columns([1, 0.6, 0.8, 0.8, 1.5, 0.6])
        c1.write(r.date.isoformat())
        c2.write(TYPE_LABEL_MAP[r.type])
        c3.write(r.category)
        c4.write(f"¥{r.amount:.2f}")
        c5.write(r.note or "")
        c6.button("删除", key=f"d_{r.id}", on_click=lambda rid=r.id: delete_record(rid))
