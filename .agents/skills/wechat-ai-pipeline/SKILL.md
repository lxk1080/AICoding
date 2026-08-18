---
name: wechat-ai-pipeline
description: 一键编排 AI 微信公众号生产流水线。每当用户想用一个主题/事件/动态直接生成公众号文章、配图并保存到公众号草稿箱时使用本技能；尤其是用户输入 “/wechat-ai-pipeline 主题”、“用 wechat-ai-pipeline 写一篇……”、“生成公众号文章并发草稿”、“围绕某 AI/科技主题写稿配图发布” 等表达时，务必使用本技能。本技能会依次调用 ai-wechat-article、baoyu-image-gen、baoyu-post-to-wechat，把联网查证、中文 Markdown 成稿、封面/配图生成、插图和 API 发布串成一个默认工作流。
---

# WeChat AI Pipeline

把这项工作视为“公众号文章生产编排器”，而不是新的写作、绘图或发布引擎。你要复用现有技能：

1. `ai-wechat-article`：联网查证并生成可靠的中文 Markdown 文章。
2. `baoyu-image-gen`：生成封面图和正文配图。
3. `baoyu-post-to-wechat`：把最终 Markdown 通过 API 保存到微信公众号草稿箱。

本技能的价值是少问问题、稳定执行默认流程，并在失败点给出清楚的恢复方式。

## 输入识别

从用户消息中提取文章主题。常见输入包括：

- `/wechat-ai-pipeline 人形机器人应用验证`
- `用 wechat-ai-pipeline 写一篇：AI Hangzhou 2026`
- `围绕“小米 MiMo 最新动态”，生成公众号文章并发草稿`
- `只生成不发布：某某模型发布`

如果用户使用 `/wechat-ai-pipeline`，把斜杠命令后的剩余文本视为主题。若客户端把 slash command 拦截，告诉用户可改用自然语言：`调用 wechat-ai-pipeline：主题`。

默认假设：

- 文章类型：面向中文读者的 AI/科技行业公众号资讯解读。
- 输出目录：`wechat-articles/<slug>/`，其中 `<slug>` 使用简短英文 kebab-case。
- 图片：生成 2 张，`images/cover.png` 和 `images/inline-1.png`。
- 发布方式：API 保存到公众号草稿箱。
- 公众号主题、颜色、作者、评论设置：沿用 `baoyu-post-to-wechat` 的 EXTEND.md 配置；若需要显式传参，优先使用已配置的 `default_theme` 和 `default_color`。

## 工作流

### 1. 准备主题和目录

根据主题生成安全、可读的英文 slug。例如：

- `人形机器人应用验证` -> `humanoid-robots-application-validation`
- `AI Hangzhou 2026 杭州人工智能大会` -> `ai-hangzhou-2026`

创建：

```text
wechat-articles/<slug>/
wechat-articles/<slug>/images/
```

### 2. 生成文章

使用 `ai-wechat-article` 的方法联网检索并写作。遵循其来源分级：

- P0：官方来源优先确认关键事实。
- P1：权威媒体和机构用于背景补足与交叉验证。
- P2：仅作有限补充，不单独支撑重大结论。

文章保存为：

```text
wechat-articles/<slug>/article.md
```

文章应包含 frontmatter，至少包括：

```md
---
title: "<文章标题>"
description: "<120 字以内摘要>"
author: "<作者，优先使用 baoyu-post-to-wechat 配置>"
cover: "images/cover.png"
---
```

正文结构沿用 `ai-wechat-article`：标题、导语、核心信息、背景补充、影响分析、总结、参考来源、必要的信息说明。

### 3. 生成图片

使用 `baoyu-image-gen`，先读取它的 EXTEND.md 配置。默认按顺序生成：

1. `images/cover.png`：公众号封面，16:9，适合科技资讯文章。提示词强调“无可读文字、无 logo、无水印、风格可信”。
2. `images/inline-1.png`：正文配图，16:9，用来解释文章里的产业链、流程、场景或影响分析。

如果用户指定图像供应商、模型、风格或数量，按用户要求覆盖默认值。若用户说“只用 Codex 内置图像生成”，使用当前配置中的 `codex-cli` 或当前运行时原生图像工具。

生成后检查图片是否明显包含：

- 水印或 logo。
- 可读但不可靠的文字。
- 与主题严重不符的主体。
- 明显低质、玩具感或风格不适合公众号。

如有严重问题，重新生成一次；若仍失败，说明问题并继续使用可接受素材或请求用户选择。

### 4. 插图

把封面图插在导语之后：

```md
![<封面说明>](images/cover.png)
```

把正文配图插在最适合解释的段落之前，通常是“影响分析”或“为什么值得关注”前后：

```md
![<正文配图说明>](images/inline-1.png)
```

不要把图片全部堆在文章开头或结尾。

### 5. 发布到公众号草稿箱

除非用户明确说“只生成不发布”“先别发布”“本地预览”，否则调用 `baoyu-post-to-wechat` 的 API 方法保存草稿。

使用 Markdown 原文作为输入，不要预先转换为 HTML。命令形态应等价于：

```bash
wechat-api.ts wechat-articles/<slug>/article.md --theme <theme> --color <color> --cover wechat-articles/<slug>/images/cover.png
```

主题和颜色来自 `baoyu-post-to-wechat` 配置；如果配置缺失，使用 `default` 主题并省略颜色。

发布成功后报告：

- 文章文件路径。
- 图片文件路径。
- 发布方法：API。
- 草稿 `media_id`。
- 提醒用户去公众号后台草稿箱预览和微调。

## 失败处理

### 资料不足

如果公开资料不足，仍可生成审慎版文章，但要缩小结论范围，并在“信息说明”里写明资料边界。不要为了成文而编造数据、采访或现场信息。

### 图片失败

如果图片生成失败，先重试一次。仍失败时，保留文章文件，告诉用户图片失败原因和可重试命令，不要继续发布缺少封面的 API 草稿。

### 微信 API 失败

常见问题：

- `40164 invalid ip`：当前出口 IP 不在微信公众号 API 白名单。告诉用户需要添加报错中的 IP，然后可重试同一发布命令。
- 缺少 `WECHAT_APP_ID` 或 `WECHAT_APP_SECRET`：按 `baoyu-post-to-wechat` 的 API 设置流程补充配置。
- 封面缺失或图片过大：确认 `cover.png` 存在，发布脚本通常会自动压缩；若仍失败，重新生成或压缩图片。

发布失败时，不要丢弃已生成文件。明确告诉用户本地文章和图片已经在哪里，下一次可以从发布步骤继续。

## 用户可选参数

识别这些自然语言控制项：

- `只生成不发布`：停止在 Markdown + 图片，不调用发布。
- `不要配图`：只写文章，不生成图片和发布；如用户仍要求发布，说明 API 文章需要封面。
- `生成 N 张配图`：除封面外生成 N 张正文图，并分散插入正文。
- `用 <provider/model> 生图`：传给 `baoyu-image-gen` 的 provider/model。
- `主题 <theme> 颜色 <color>`：发布时覆盖 EXTEND.md。
- `不发草稿，只给文件`：与只生成不发布相同。

## 完成前检查

交付前快速确认：

1. `article.md` 存在且含 frontmatter、参考来源和图片引用。
2. `cover.png` 存在，正文至少有一张配图，除非用户禁用图片。
3. 关键事实有可靠来源，未把推测写成事实。
4. 若发布成功，报告 `media_id`；若失败，报告失败点和可恢复步骤。
