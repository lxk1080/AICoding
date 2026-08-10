## Codex 使用说明

### 1. 关于 codex 接其它模型的发展历程

为了便于后面安装使用过程的理解，有必要说下 Codex 关于接模型的发展，如下：

- 2026 年 2 月之前：
    - 原生双协议兼容，对接 OpenAI 自家 GPT：默认走新的 Responses API
    - 对接第三方模型、私有代理、本地模型：配置 wire_api = "chat"，即可使用通用 chat/completions 标准接口
    - 题外话：早期开放 chat 兼容的原因？
        - Codex 刚诞生时，Responses 协议尚未成熟，OpenAI 自己都没全面铺开，为吸引开发者入局，兼容通用 Chat 接口可以对接任意模型，快速扩大 Codex 用户基数
- 2026 年 2 月之后：
    - 彻底砍掉老式 chat/completions 兼容模式，只允许自家专属 /v1/responses 接口，市面上所有第三方模型（DeepSeek、Claude）全都没有这套协议
    - config.toml 不存在 model_providers 配置段，没有任何正规方式替换底层模型
    - 只能靠 Moon‑Bridge 做逆向协议劫持、强行翻译接口，属于社区破解玩法（邪修），官方并不认可
        - 当时 Moon‑Bridge 是全网唯一可实现 Codex + DeepSeek 完整 Agent 闭环的方案
    - 题外话：为啥删掉 chat 兼容？
        - 商业捆绑，一旦只剩 Responses 协议可用，只有 OpenAI 自家 GPT 最先完整适配这套协议，国产模型、开源模型全都没有 Responses 接口，
        自然绝大部分用户只能继续使用 OpenAI 的模型，可以锁住 API 营收
        - Agent 架构统一，Responses 天生为多轮工具调用、长任务 Agent 设计，
        chat/completions 架构老旧，很难实现 Codex 后来的自主排错、多分支任务、沙箱深度联动等高级能力，
        OpenAI 为了做强 Codex 独家的编程 Agent 体验，决定砍掉旧协议包袱，
        倒逼生态跟进 Responses 标准，试图把 Responses 做成编程 Agent 行业通用协议
- 2026 年 3 月：
    - 初代 CC‑Switch 上线，仅配置管理功能，无桥接，只能搭配 Moon‑Bridge 使用（这时候还没 CC‑Switch 什么事）
- 2026 年 5 月 29 日：
    - CC‑Switch v3.16 新增内置路由协议转换，可以单独替代 Moon‑Bridge（一体化 GUI 工具，CC-Switch 已经强无敌了）
- 2026 年 6 月：
    - Codex 新增了 model_providers 自定义模型架构，但是硬性要求：外部后端必须实现 Responses 协议
    - 支持外接模型了，但是老旧 chat 协议还是不兼容的，第三方模型要想接入，就必须要实现 Responses API
    - 题外话：为啥又支持第三方模型了？
        - Claude Code、Cursor、国内各类编程 Agent 纷纷崛起，全都支持自由切换模型，再不支持就 out 了
        - OpenAI 放弃绑定 GPT 卖算力的思路，改成：
        把 Codex 做成通用编程 Agent 外壳（拥有成熟沙箱、终端操控、MCP 插件、自主调试整套工作流），做成行业通用标准，
        只要开发者习惯 Codex 生态，未来依然有大量场景会回流使用更强的 GPT 旗舰模型
- 2026 年 7 月：
    - DeepSeek 主动上线 deepseek-V4‑Flash 原生 Responses API
        - Codex 对接 DeepSeek V4‑Flash：不用桥接、不用 Moon‑Bridge/CC‑Switch，原生直连
        - Codex 对接 DeepSeek V4‑Pro：无 Responses 的模型，依旧需要 CC‑Switch / Moon‑Bridge 中转
- 2026 年 8 月：
    - deepseek 官方：我们将于 2026 年 8 月初增加对 deepseek-v4-pro 模型 Responses API 的支持
    - 这个文档的编写时间是 2026 年 8 月 7 日，目前 deepseek-v4-pro 仍未支持 Responses API
    - 另外，其它的国产大模型也开始陆续支持 Responses API
    - 期待后续的更新吧。。

### 2. Codex 安装

#### 2.1 安装 Codex CLI：

```sh
# 安装
npm install -g @openai/codex
# 版本
codex --version
# 终端输入，直接使用
codex
```

也可以直接使用 VS Code 插件，扩展名：`Codex – OpenAI’s coding agent`

#### 2.2 如何登录：

有 3 种方式：chatGPT账号登录、设备码登录、API-KEY登录，前两种方式都需要添写手机号验证，但是众所周知，chatGPT 不支持国内账号。。

要用前两种方式必须要借助一些 SMS 服务，比较麻烦，最简单的就是用 API-KEY 登录，
需要去 openAI-API 平台设置 Key 并复制，平台链接：https://platform.openai.com/api-keys

#### 2.3 迁移 `~/.codex` 目录

Codex 的默认配置目录在：`~/.codex`（Mac、Linux）或 `C:\Users\[用户名]\.codex`（Window）

不得不说，`.codex` 这个目录的体积还是很大的，小则几百 M，大则几个 G，比 `.claude` 目录可大多了，
没办法，毕竟它支持的东西更多，但是大，还是要换个位置的，有个环境变量：`CODEX_HOME`，
可以通过这个环境变量去指路 `.codex` 目录的文件夹路径，Codex 会去找这个环境变量，找不到，默认才在根目录，
注意，如果使用了 CC-Switch 工具，需要同步修改 “设置-高级-配置文件目录”，
否则 cc-switch 在切换模型的时候，又给你写到根目录了

#### 2.4 如何对接 Deepseek 模型？

可以看官方文档，里面有不同 agent 的接入教程，但是都比较麻烦，需要手动执行命令或编辑文件，
Codex 的配置文件是 `config.toml`，建议直接使用 CC-Switch 工具：

配置时，在 “高级选项-上游模式”，如果选择 Responses（原生），那就只能使用 deepseek-v4-flash 模型（截止20260807），
如果想使用 deepseek-v4-pro 模型，要选择 Chat Completions 格式，并且在 “设置-路由” 里面开启路由

配置完成后，打开 Codex 聊天界面，如果下方模型展示处显示 “自定义” 或 “deepseek”，代表配置成功，
但是目前，在 VSCode 或 Codex Desktop 中，显示“自定义”的位置，无法切换模型，
打开一个会话时，Codex 会加载默认的模型，但在之后无法切换，
即使修改了 `config.toml` 中的默认模型（model字段）后重启 Codex，这个会话的模型也不会改变，可以说，在打开会话时模型就定死了。。
这个时候想要使用切换后的模型，只能重启一个新的会话了

说到底，openAI 目前还是以支持自家的 GPT 为主，对于第三方模型的使用，显然是支持的不够，只能等后续的更新了

##### 2.4.1 如何在会话中切换模型？

但是话说回来，要在会话中切换模型，也不是完全没有办法，可以利用 Codex CLI 切换：

1. 关闭 Codex Desktop 或 VSCode（vscode可以reload窗口），会话是一个thread，它不能在可视化界面和 CLI 中共存
2. 执行 `codex resume`，打开历史会话列表，选中目标会话并进入
3. 输入 `/model` 指令，选择并切换模型
4. 关闭 CLI，重新打开 VSCode 或 Codex Desktop，模型已经被更改

##### 2.4.2 如何得知当前会话使用的模型？

因为可视化界面中不显示使用的模型版本，那怎么知道当前使用的模型是 flash 还是 pro 呢？

可以使用 cc-switch “设置” 中的 “使用统计”，里面有模型的 “请求日志”，随便和 Codex 说句话，
只要 Codex 回复，cc-switch 中就会生成一条模型的调用日志，在这条日志中，就能看到调用的 “计费模型”

### 3. Codex 使用

Codex 可以通过多种方式使用：Codex CLI、VSCode、ChatGPT-桌面应用、Codex web，额外还有个 ChatGPT 网页版（这个不包含 Codex 功能），
目前 ChatGPT 体系主要分为 3 种会话模式：聊天、工作、Codex，三种大致是：

- 聊天：重在讨论，不注重交付结果，哲学、询问、打发时间、日常聊天就选这个
- 工作：重在交付，输出工作成果，可以写代码，但写代码不是专项，建议用于处理一些除代码之外的办公事项，例如：生图、写PPT、日常重复性工作
    - 和 openClaw 的区别就是，ChatGPT 是你找他，他帮你完成任务，openClaw 是你交代一句，然后他长期自主执行任务，不需要每次找他
    - 其实，Codex 也是被包含在工作模式内的
- Codex：软/硬件开发工程师，专门写代码的，包含很多实用的指令、技能，专为写代码而生

Codex 的 5.6 模型有三个版本：Luna、Terra、Sol，可以简单理解为：

- Luna：轻量档，响应快、便宜，深度推理弱一些，适合简单问答、摘要、批量任务，对标 claude haiku
- Terra：中间档，能力和速度平衡，极复杂任务不如 Sol，适合日常工作、写文档、普通开发，对标 claude sonnet
- Sol：旗舰级，推理最强，复杂任务能力最高，更慢、更耗资源，适合高难代码、复杂分析、长期大项目，对标 claude opus

#### 3.1 归档与删除

目前只有 ChatGPT 网页版的会话，可以直接删除，其它使用方式的会话只能先归档后删除，
因为 Codex 可以使用的方式很多，这一块 openAI 做的还是挺乱的，你会发现有的会话归档后就找不着了，
这里长话短说，已归档的会话只会出现在两个地方：

- ChatGPT-桌面应用 => 设置 => 已归档的聊天（挺莫名其妙的一点是，云端 Codex 的归档无法删除）
- ChatGPT-网页版 => 设置 => 数据管理 => 已归档的聊天

反正聊天被归档了，想恢复或彻底删除，在这两个位置去找就对了
