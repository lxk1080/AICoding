/**
 * NewsCard 组件测试
 * 覆盖：渲染测试、Props 传递测试
 */

import { render, screen } from '@testing-library/react';
import { NewsCard } from './index';

const props = {
  title: 'AI 技术迎来新突破',
  author: '张三',
  time: '2026-08-03 10:00',
  excerpt: '近日，人工智能领域取得重大进展，多家研究机构发布了最新的模型成果。',
};

describe('NewsCard', () => {
  it('渲染标题、作者、时间和缩略内容', () => {
    render(<NewsCard {...props} />);

    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(props.author)).toBeInTheDocument();
    expect(screen.getByText(props.time)).toBeInTheDocument();
    expect(screen.getByText(props.excerpt)).toBeInTheDocument();
  });

  it('时间使用 <time> 元素渲染', () => {
    render(<NewsCard {...props} />);

    const timeElement = screen.getByText(props.time);
    expect(timeElement.tagName).toBe('TIME');
  });

  it('使用 article 语义标签包裹新闻卡片', () => {
    const { container } = render(<NewsCard {...props} />);

    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
