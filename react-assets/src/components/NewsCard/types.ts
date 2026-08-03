/**
 * NewsCard 组件的 Props 类型定义
 */

export interface NewsCardProps {
  /** 新闻标题 */
  title: string;
  /** 新闻作者 */
  author: string;
  /** 新闻发布时间 */
  time: string;
  /** 新闻缩略内容 */
  excerpt: string;
}
