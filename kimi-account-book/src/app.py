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

WARM_CSS = """
<style>
    /* 隐藏 Streamlit 默认 header 和工具栏 */
    header { display: none !important; }
    #MainMenu { display: none !important; }
    .stAppDeployButton { display: none !important; }
    [data-testid="stToolbar"] { display: none !important; }
    [data-testid="stStatusWidget"] { display: none !important; }

    /* 整体背景 */
    html, body, #root, .stApp {
        background-color: #FFF8F0;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* 整体容器：垂直水平居中 */
    section.stMain {
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        min-height: 100vh !important;
    }
    .stMainBlockContainer {
        height: 93vh !important;
    }

    /* Tab 内容区域 */
    [data-testid="stTab"] {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
    }
    .block-container {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 1.5rem 2.5rem 2rem !important;
        background-color: #FFFDF9;
        border-radius: 1.25rem;
        box-shadow: 0 2px 12px rgba(180, 120, 60, 0.08);
    }

    /* 标题 */
    h1, h2, h3, h4, h5, h6 {
        color: #5D4037 !important;
    }
    .stCaption {
        color: #8D6E63 !important;
    }

    /* 表单标签 */
    .stRadio label, .stSelectbox label, .stNumberInput label, .stDateInput label, .stTextInput label {
        color: #6D4C41 !important;
        font-weight: 500;
    }

    /* 输入框 */
    .stTextInput input, .stNumberInput input, .stDateInput input, .stSelectbox > div > div {
        border-color: #D7CCC8 !important;
        border-radius: 0.5rem !important;
    }
    .stTextInput input:focus, .stNumberInput input:focus, .stDateInput input:focus {
        border-color: #FF8A65 !important;
        box-shadow: 0 0 0 1px #FF8A65 !important;
    }

    /* 按钮 */
    .stButton button {
        background: linear-gradient(135deg, #FF8A65, #FF7043) !important;
        color: white !important;
        border: none !important;
        border-radius: 0.5rem !important;
        font-weight: 600 !important;
        padding: 0.4rem 1.2rem !important;
        transition: all 0.2s ease !important;
    }
    .stButton button:hover {
        background: linear-gradient(135deg, #FF7043, #F4511E) !important;
        box-shadow: 0 4px 12px rgba(255, 138, 101, 0.35) !important;
        transform: translateY(-1px);
    }

    /* Metric 卡片 */
    [data-testid="stMetric"] {
        background: #FFF3E0;
        border-radius: 0.75rem;
        padding: 1rem 1.2rem;
        border: 1px solid #FFE0B2;
    }
    [data-testid="stMetric"] label {
        color: #8D6E63 !important;
    }
    [data-testid="stMetric"] [data-testid="stMetricValue"] {
        color: #4E342E !important;
        font-weight: 700;
    }

    /* Tab 标签 */
    .stTabs [data-baseweb="tab-list"] {
        gap: 0.5rem;
        background-color: #FFF3E0;
        padding: 0.4rem;
        border-radius: 0.75rem;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 0.5rem !important;
        padding: 0.5rem 1.2rem !important;
        color: #6D4C41 !important;
        font-weight: 500;
    }
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #FF8A65, #FF7043) !important;
        color: white !important;
    }

    /* Selectbox */
    .stSelectbox > div > div {
        background: #FFF8F0;
    }

    /* DataFrame */
    [data-testid="stDataFrame"] {
        border: 1px solid #FFE0B2;
        border-radius: 0.5rem;
        overflow: hidden;
    }
    .stDataFrame [data-testid="StyledDataFrameColHeader"] {
        background: #FFF3E0;
        color: #5D4037;
    }

    /* Expander */
    .stExpander {
        border-color: #FFE0B2 !important;
        border-radius: 0.5rem !important;
    }
    .stExpander summary {
        color: #6D4C41 !important;
        font-weight: 500;
    }

    /* Alert */
    .stAlert {
        border-radius: 0.5rem;
    }
    .stInfo {
        background-color: #FFF3E0 !important;
        color: #6D4C41 !important;
    }
    .stSuccess {
        background-color: #E8F5E9 !important;
        color: #2E7D32 !important;
    }
</style>
"""


def main():
    # 页面配置
    st.set_page_config(
        page_title="记账本",
        page_icon="🧾",
        layout="wide",
        initial_sidebar_state="collapsed",
    )

    # 注入温馨色调 CSS
    st.markdown(WARM_CSS, unsafe_allow_html=True)

    # 初始化数据库
    init_db()

    # 渲染页面
    render_header()

    # 使用标签页切分功能模块
    tab1, tab2, tab3 = st.tabs(["✏️ 记一笔", "📊 统计报表", "📝 明细管理"])

    with tab1:
        render_add_form()

    with tab2:
        selected_month = render_month_selector(key="stat_month")
        render_summary(selected_month)

        chart_col1, chart_col2 = st.columns(2)
        with chart_col1:
            render_category_chart(selected_month)
        with chart_col2:
            render_trend_chart()

    with tab3:
        selected_month = render_month_selector(key="list_month")
        render_records_list(selected_month)


if __name__ == "__main__":
    main()
