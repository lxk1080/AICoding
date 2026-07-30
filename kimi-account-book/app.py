"""
记账本主程序：Streamlit 应用入口。
"""

import streamlit as st

from database import init_db
from components import (
    render_header,
    render_add_form,
    render_month_selector,
    render_summary,
    render_category_chart,
    render_trend_chart,
    render_records_list,
)


def main():
    # 页面配置
    st.set_page_config(
        page_title="记账本",
        page_icon="🧾",
        layout="wide",
        initial_sidebar_state="collapsed",
    )

    # 初始化数据库
    init_db()

    # 渲染页面
    render_header()

    # 两栏布局：左侧表单，右侧统计和图表
    left_col, right_col = st.columns([1, 2])

    with left_col:
        render_add_form()

    with right_col:
        selected_month = render_month_selector()
        render_summary(selected_month)

        chart_col1, chart_col2 = st.columns(2)
        with chart_col1:
            render_category_chart(selected_month)
        with chart_col2:
            render_trend_chart()

        render_records_list(selected_month)


if __name__ == "__main__":
    main()
