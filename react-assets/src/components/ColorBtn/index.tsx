/**
 * ColorBtn 组件
 * 按钮组件：展示按钮文字，以默认颜色渲染；
 * 点击后背景色在多种颜色间闪烁，1 秒后自动停止并恢复默认颜色
 */

import { useEffect, useRef, useState } from 'react';
import { ColorBtnProps } from './types';

/** 闪烁使用的颜色序列 */
const FLASH_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];
const FLASH_INTERVAL_MS = 100;
const FLASH_DURATION_MS = 1000;

export function ColorBtn({ text, color }: ColorBtnProps) {
  const [bgColor, setBgColor] = useState(color);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    // 闪烁进行中忽略重复点击
    if (intervalRef.current) {
      return;
    }

    let index = 0;
    intervalRef.current = setInterval(() => {
      setBgColor(FLASH_COLORS[index % FLASH_COLORS.length]);
      index += 1;
    }, FLASH_INTERVAL_MS);

    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setBgColor(color);
    }, FLASH_DURATION_MS);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ backgroundColor: bgColor }}
      className="rounded-md px-6 py-2 font-medium text-white transition-colors duration-150 hover:opacity-90"
    >
      {text}
    </button>
  );
}
