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

#### 2. 重要指令

<img src="./pictures/03.jpeg" width="60%"><br/>
