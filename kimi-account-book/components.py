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


def render_month_selector() -> str:
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
    """渲染明细列表。"""
    st.subheader("📝 明细")

    records = get_records(month=month)
    if not records:
        st.info("本月暂无记录")
        return

    # 转换为 DataFrame 展示
    data = []
    for r in records:
        data.append({
            "id": r.id,
            "日期": r.date.isoformat(),
            "类型": TYPE_LABEL_MAP[r.type],
            "分类": r.category,
            "金额": r.amount,
            "备注": r.note,
        })

    df = pd.DataFrame(data)

    # 使用 data_editor 显示，但不允许编辑
    st.dataframe(
        df[["日期", "类型", "分类", "金额", "备注"]],
        use_container_width=True,
        hide_index=True,
    )

    # 删除功能
    with st.expander("🗑️ 删除记录"):
        record_options = {f"{r.date} {TYPE_LABEL_MAP[r.type]} {r.category} ¥{r.amount:.2f}": r.id for r in records}
        selected_label = st.selectbox("选择要删除的记录", options=list(record_options.keys()))
        if st.button("确认删除", type="primary"):
            record_id = record_options[selected_label]
            if delete_record(record_id):
                st.success("删除成功！")
                st.rerun()
            else:
                st.error("删除失败，请重试")
