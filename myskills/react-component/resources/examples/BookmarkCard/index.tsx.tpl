/**
 * BookmarkCard 组件
 * 展示单个书签的卡片，显示标题、URL、描述和标签列表
 */

import { BookmarkCardProps } from './types';

export function BookmarkCard({ title, url, description, tags }: BookmarkCardProps) {
  return (
    <div className="max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
      >
        {title}
      </a>
      <p className="mt-1 truncate text-sm text-gray-500">{url}</p>
      <p className="mt-2 text-sm text-gray-700">{description}</p>
      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <li
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
