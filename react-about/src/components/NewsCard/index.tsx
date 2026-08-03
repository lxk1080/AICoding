/**
 * NewsCard 组件
 * 展示新闻的卡片，显示标题、作者、时间和缩略内容
 */

import { NewsCardProps } from './types';

export function NewsCard({ title, author, time, excerpt }: NewsCardProps) {
  return (
    <article className="max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
        <span>{author}</span>
        <span aria-hidden="true">·</span>
        <time>{time}</time>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-gray-700">{excerpt}</p>
    </article>
  );
}
