## 稍微记录一些重要的命令

#### 1. claude-code 安装

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

##### 1.1 修改配置文件目录

claude-code 的配置文件，默认情况下在：`~/.claude`（Mac、Linux）或 `C:\Users\<username>\.claude`（Window）

在 Window 环境，如果担心各种文件占空间，想修改配置文件目录，可以通过环境变量 `CLAUDE_CONFIG_DIR` 控制

例如，把环境变量 `CLAUDE_CONFIG_DIR` 修改为 `D:\ManyConfigs\.claude`，重启 claude-code，这时它就会读取这个环境变量对应的配置文件目录了

注意，如果使用了 `cc-switch`，也需要同步更改，在 `设置=>高级=>配置文件目录` 下修改配置存储路径

#### 2. 重要指令

<img src="./pictures/03.jpeg" width="60%"><br/>

#### 3. 自定义斜杆命令

1. 在 .claude 内新建 commands 文件夹
2. 建立指令文件，例如：date.md
3. 在 date.md 文件内写入要执行的操作即可
4. 直接 /date 就可以使用

#### 4. skills

Anthropic 官方 Skill 库：https://github.com/anthropics/skills
Vercel 官方 Skill 库：https://github.com/vercel-labs/agent-skills

这里用的 CLI 工具 `skills` 是 npm 包 skills 的命令，仓库地址：https://github.com/vercel-labs/skills ，也是 Vercel 出品的

安装方法：
```sh
# 安装 Anthropic 官方全部 Skill（全局安装到用户目录）
$ npx skills add anthropics/skills -g

# 只安装指定 Skill（推荐按需安装，安装到项目目录）
$ npx skills add anthropics/skills@frontend-design
$ npx skills add anthropics/skills@mcp-builder
$ npx skills add anthropics/skills@skill-creator

# 安装整个 Vercel 官方技能库
npx skills add vercel-labs/agent-skills

# 只单独安装 React 最佳实践（推荐）
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
```

注意：
默认情况下，只会安装到通用文件夹 `.agents/` 内，但是这样 claude-code 读取不了，
claude-code 只会识别 `./claude/skills` 里面的内容，有两种方式解决：

1、默认的安装过程中，会有选项可以选择 claude-code，这里要仔细看操作说明，
它是可以多选的，需要按 `空格` 键选中，最后按 `Enter` 键确认，直接按 Enter 相当于啥也没选。。

2、安装时添加参数 `--agent claude-code`，这样就只会安装成 claude-code 适用的方式，例如：

```sh
npx skills add anthropics/skills@frontend-design --agent claude-code
# --agent 可以缩写为 -a
npx skills add anthropics/skills@frontend-design -a claude-code
```
