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
    get_categories,
    add_category,
    delete_category,
)
from utils import format_currency, get_current_month, month_label


def render_header():
    """渲染页面标题。"""
    st.title("🧾 记账本")
    st.caption("简单、轻量的个人记账工具")


def render_add_form():
    """渲染快速记账表单。"""
    st.subheader("✏️ 记一笔")

    # 类型选择放在 form 外面，以便切换时实时更新分类选项
    record_type = st.radio(
        "类型",
        options=[RecordType.EXPENSE, RecordType.INCOME],
        format_func=lambda x: TYPE_LABEL_MAP[x],
        horizontal=True,
    )

    # 从数据库获取分类列表
    categories = get_categories(record_type)
    category_names = [c["name"] for c in categories]

    with st.form("add_record_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        with col1:
            amount = st.number_input(
                "金额",
                min_value=0.01,
                value=10.0,
                step=1.0,
                format="%.2f",
            )

        # 分类选择 + 编辑按钮
        cat_col, edit_col = st.columns([4, 1], vertical_alignment="bottom")
        with cat_col:
            category = st.selectbox(
                "分类",
                options=category_names,
            )
        with edit_col:
            if st.form_submit_button("✏️ 编辑", use_container_width=True):
                st.session_state["edit_category_type"] = record_type
                st.session_state["show_category_modal"] = True
                st.rerun()

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

    # 渲染分类管理模态框
    if st.session_state.get("show_category_modal"):
        if st.session_state.get("keep_modal_open"):
            # 按钮触发的 rerun，保持弹窗打开
            st.session_state["keep_modal_open"] = False
            st.session_state["modal_was_open"] = True
            render_category_modal()
        elif st.session_state.get("modal_was_open"):
            # 弹窗已打开过但没有按钮触发 rerun，说明用户点了 X 或遮罩层
            st.session_state["show_category_modal"] = False
            st.session_state["modal_was_open"] = False
        else:
            # 首次打开弹窗
            st.session_state["modal_was_open"] = True
            render_category_modal()
    else:
        st.session_state["modal_was_open"] = False


@st.dialog("📂 管理分类", width="medium")
def render_category_modal():
    """渲染分类管理弹窗。"""
    record_type = st.session_state.get("edit_category_type", RecordType.EXPENSE)
    type_label = TYPE_LABEL_MAP[record_type]
    st.caption(f"当前类型：{type_label}")

    # 获取当前分类列表
    categories = get_categories(record_type)

    # 显示现有分类，带删除按钮
    for cat in categories:
        col_name, col_type, col_btn = st.columns([3, 1, 1])
        with col_name:
            st.write(cat["name"])
        with col_type:
            st.caption("内置" if cat["is_default"] else "")
        with col_btn:
            if not cat["is_default"]:
                if st.button("🗑️", key=f"del_{cat['id']}"):
                    delete_category(cat["id"])
                    st.session_state["keep_modal_open"] = True
                    st.rerun()

    st.divider()

    # 添加新分类
    new_cat = st.text_input("新分类名称")
    if st.button("➕ 添加", use_container_width=True):
        if new_cat.strip():
            if add_category(record_type, new_cat.strip()):
                st.session_state["keep_modal_open"] = True
                st.rerun()
            else:
                st.error("该分类已存在")
        else:
            st.warning("请输入分类名称")


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
        # 支出金额红色，收入金额绿色
        color = "#E53935" if r.type == RecordType.EXPENSE else "#43A047"
        c4.markdown(f'<span style="color:{color};font-weight:500">¥{r.amount:.2f}</span>', unsafe_allow_html=True)
        c5.write(r.note or "")
        c6.button("删除", key=f"d_{r.id}", on_click=lambda rid=r.id: delete_record(rid))
