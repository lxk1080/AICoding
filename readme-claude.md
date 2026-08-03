## 稍微记录一些重要的命令

### 1. claude-code 安装

安装方法：

<img src="./pictures/01.jpeg" width="60%"><br/>

关键配置（settings.json）：

<img src="./pictures/02.jpeg" width="60%"><br/>

配置文件：

```json
// ~/.claude/settings.json
{
  "env": {
   "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
   "ANTHROPIC_AUTH_TOKEN": "<你的 DeepSeek API Key>",
   "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
   "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
   "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]",
   "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
   "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-v4-flash",
   "CLAUDE_CODE_EFFORT_LEVEL": "max"
  }
}
```

全局项目说明书 ~/.claude/CLAUDE.md 文件内容参考：

```
# 沟通方式
- 默认中文回复，代码、命令、变量名、文件路径保持英文
- 结论先行，简洁直接，不先铺垫背景
- 不谄媚，不夸"这是个很好的问题"，不以"当然可以"开头
- 给真实判断，方案有问题直接指出，发现更好做法主动说明

# Git
- 不自动 `git commit` 或 `git push`，除非我明确要求
- 提交前先展示将要提交的变更摘要
- commit message 使用简洁英文

# 红线操作
以下操作即使在 auto-accept 模式下也必须先问我：
- 删除文件、目录或 git 历史
- 修改 `.env`、密钥、token、证书、CI/CD 配置
- `git push`、`git rebase`、`git reset --hard`、强制推送
- 公开发布（`npm publish`、生产部署等）
```

#### 1.1 修改配置文件目录

claude-code 的配置文件，默认情况下在：`~/.claude`（Mac、Linux）或 `C:\Users\[用户名]\.claude`（Window）

在 Window 环境，如果担心各种文件占空间，想修改配置文件目录，可以通过环境变量 `CLAUDE_CONFIG_DIR` 控制

例如，把环境变量 `CLAUDE_CONFIG_DIR` 修改为 `D:\ManyConfigs\.claude`，重启 claude-code，这时它就会读取这个环境变量对应的配置文件目录了

注意，如果使用了 `cc-switch`，也需要同步更改，在 `设置=>高级=>配置文件目录` 下修改配置存储路径

### 2. 重要指令

<img src="./pictures/03.jpeg" width="60%"><br/>

### 3. 自定义斜杆命令

1. 在 .claude 内新建 commands 文件夹
2. 建立指令文件，例如：date.md
3. 在 date.md 文件内写入要执行的操作即可
4. 直接 /date 就可以使用

### 4. skills

Anthropic 官方 Skill 库：https://github.com/anthropics/skills
Vercel 官方 Skill 库：https://github.com/vercel-labs/agent-skills

这里用的 CLI 工具 `skills` 是 npm 包 skills 的命令，仓库地址：https://github.com/vercel-labs/skills ，也是 Vercel 出品的

安装方法：
```sh
# 安装 Anthropic 官方全部 Skill（ -g 代表安装到用户目录，不写的话则可以安装到项目目录）
# 即使 claude-code 的配置文件目录被修改了，也不用担心，skills 会自动找到的
$ npx skills add anthropics/skills -g

# 只安装指定 Skill（推荐按需安装）
$ npx skills add anthropics/skills@frontend-design -g
$ npx skills add anthropics/skills@mcp-builder -g
$ npx skills add anthropics/skills@skill-creator -g

# 安装整个 Vercel 官方技能库
npx skills add vercel-labs/agent-skills -g

# 只单独安装 React 最佳实践（推荐）
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -g

# 可以用 --list 查看支持的技能列表
npx skills add vercel-labs/agent-skills --list
```

注意：
默认情况下，只会安装到通用文件夹 `.agents/` 内，但是这样 claude-code 读取不了，
claude-code 只会识别 `.claude/skills` 里面的内容，有两种方式解决：

1、默认的安装过程中，会有选项可以选择 claude-code，这里要仔细看操作说明，
它是可以多选的，需要按 `空格` 键选中，最后按 `Enter` 键确认，直接按 Enter 相当于啥也没选。。

2、安装时添加参数 `--agent claude-code`，这样就只会安装成 claude-code 适用的方式，例如：

```sh
npx skills add anthropics/skills@frontend-design --agent claude-code -g
# --agent 可以缩写为 -a
npx skills add anthropics/skills@frontend-design -a claude-code -g
```

其它命令：

```sh
# 查看帮助，可以看到很多使用示例
npx skills --help

# 在项目里面安装 skills 时，会携带有一个 skills-lock.json 的文件
# 可以使用以下命令恢复 skills，类似 npm i 功能
# 但是这个是个实验性功能，做的不完善
# 使用这个命令只能恢复到 .agents/ 文件夹，无法恢复到 .claude/ 文件夹内
# 后续更新后，也许可以支持，先留个痕！
npx skills experimental_install
```

#### 4.1 commands 和 skills 的区别

`commands`：内容简单，纯 MD 文件，固定流程的快捷指令，手动调用
`skills`：内容复杂，可包含多个文件夹和文件，可复用的方法论，模型自动调用

最大的区别就是：`commands 只能自己手动调用，而 skills 是可以自动被调用的`

通过 `/xxx` 方式是 skill 的调用方式，但 Claude Code 把两者统一暴露为可调用的 skill 项了，所以也能通过 skill 工具调用 command

#### 4.2 Superpowers 的使用

Superpowers 本质是一套工作方法论集合

安装前后对比：

| 没装 Superpowers                      | 装了 Superpowers                                             |
| ------------------------------------- | ------------------------------------------------------------ |
| 你：“加个批量导出功能”                | 你：“加个批量导出功能”                                       |
| AI：“好的，我来实现...”（直接写代码） | AI：“在开始前我需要确认：1.导出格式？2.数据量多大？3.需要异步吗？”→给出 2-3 个方案，确认后再动手 |

核心 Skills 一览：

| Skill                      | 功能                              | 触发时机            |
| -------------------------- | --------------------------------- | ------------------- |
| 头脑风暴 (brainstorming)   | 需求分析→设计规格，先想清楚再动手 | 新需求/新功能开始时 |
| 编写计划 (writing-plans)   | 把规格拆成可执行的实施步骤        | 确认设计后          |
| 执行计划 (executing-plans) | 按计划逐步实施，每步验证          | 开发过程中          |
| 测试驱动开发 (TDD)         | 严格 TDD：先写测试，再写代码      | 开发核心逻辑时      |
| 系统化调试 (debugging)     | 四阶段调试法：定位→分析→假设→修复 | 遇到 Bug 时         |
| 代码审查 (code-review)     | 派遣审查 agent 检查代码质量       | 功能完成后          |
| 完成前验证 (verification)  | 声称完成前必须跑验证              | 任务结束前          |

安装方法：

```sh
# 英文版（原版）
npx superpowers

# 中文增强版（推荐安装这个，包含 6 个中国特色 Skill）
npx superpowers-zh
```

安装成功图示（增加若干 skills 并且在 CLAUDE.md 增加内容）：

<img src="./pictures/05.jpeg" width="50%"><br/>
