/**
 * BookmarkCard 组件的 Props 类型定义
 */

export interface BookmarkCardProps {
  /** 书签标题 */
  title: string;
  /** 书签 URL 地址 */
  url: string;
  /** 书签描述 */
  description: string;
  /** 书签标签列表 */
  tags: string[];
}
