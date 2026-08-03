/**
 * ColorBtn 组件测试
 * 覆盖：渲染测试、Props 传递测试、点击闪烁与自动恢复
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { ColorBtn } from './index';

const props = {
  text: '点我闪烁',
  color: '#3b82f6',
};

describe('ColorBtn', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('渲染按钮文字', () => {
    render(<ColorBtn {...props} />);

    expect(screen.getByRole('button', { name: props.text })).toBeInTheDocument();
  });

  it('默认使用传入的 color 作为背景色', () => {
    render(<ColorBtn {...props} />);

    expect(screen.getByRole('button', { name: props.text })).toHaveStyle({
      backgroundColor: props.color,
    });
  });

  it('点击后颜色开始闪烁，1 秒后停止并恢复默认颜色', () => {
    render(<ColorBtn {...props} />);
    const button = screen.getByRole('button', { name: props.text });

    fireEvent.click(button);

    // 100ms 后颜色应已切换为闪烁序列中的颜色
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(button.style.backgroundColor).not.toBe(props.color);

    // 1 秒后停止闪烁，恢复默认颜色
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(button).toHaveStyle({ backgroundColor: props.color });

    // 停止后不再变化
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(button).toHaveStyle({ backgroundColor: props.color });
  });
});
