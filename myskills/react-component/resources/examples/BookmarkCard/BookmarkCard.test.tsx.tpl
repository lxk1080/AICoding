/**
 * BookmarkCard 组件测试
 * 覆盖：渲染测试、Props 传递测试
 */

import { render, screen } from '@testing-library/react';
import { BookmarkCard } from './index';

const props = {
  title: 'React 官方文档',
  url: 'https://react.dev',
  description: 'React 框架的官方文档与教程',
  tags: ['react', 'javascript', 'frontend'],
};

describe('BookmarkCard', () => {
  it('渲染标题、URL、描述和标签列表', () => {
    render(<BookmarkCard {...props} />);

    // 标题
    expect(screen.getByRole('link', { name: props.title })).toBeInTheDocument();
    // URL
    expect(screen.getByText(props.url)).toBeInTheDocument();
    // 描述
    expect(screen.getByText(props.description)).toBeInTheDocument();
    // 标签
    props.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('链接的 href 指向正确的 URL', () => {
    render(<BookmarkCard {...props} />);

    const link = screen.getByRole('link', { name: props.title });
    expect(link).toHaveAttribute('href', props.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('tags 为空数组时不渲染标签列表', () => {
    render(<BookmarkCard {...props} tags={[]} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
