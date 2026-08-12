## openClaw 使用说明

### 1. 安装方法

#### 1.1 安装 openClaw 包

> 其实各大模型供应商都有提供安装方法，照着做就行了，
> 例如 Mimo 的：https://mimo.mi.com/docs/zh-CN/tokenplan/integration/openclaw

```sh
# Mac、Linux
curl -fsSL https://openclaw.ai/install.sh | bash

# Window
iwr -useb https://openclaw.ai/install.ps1 | iex

# nodejs（推荐！）
# 事实上，上面两种方法也是通过 npm 安装的，只是方便电脑上没有 nodejs（npm） 的小白使用
# 我们直接用 npm 安装就好了，还方便控制版本呢
npm install -g openclaw@latest

# 如果安装有权限问题，使用：
npm install -g openclaw@latest --allow-scripts openclaw

# 看下安装的版本
openClaw --version
```

#### 1.2 运行初始化向导 + 安装后台服务

```sh
# 完整配置向导 + 安装系统服务（用这个就行了！）
openclaw onboard --install-daemon

# 仅运行配置向导（不会额外安装或注册 Gateway 的 Windows 后台启动任务）
openclaw onboard
```

遇到提示：`I understand this is personal-by-default and shared/multi-user use requires lock-down. Continue?` 选择 Yes
遇到提示：`Setup mode` 推荐选择 QuickStart
遇到提示：`Model/auth provider` 选择一个模型，没显示的话选择 More..
遇到提示：`Enter DeepSeek API key` 填入你的 API Key
遇到提示：`Default model` 将光标指向 Enter model，填写模型名称
后续的其余配置（消息频道、Skill 等）可根据需求配置，新手可以先选择 Skip for now

#### 1.3 开始使用

```sh
# 打开 Web UI，在 Chat 页面进行交互：
openclaw dashboard

# 在终端中打开 TUI：
openclaw tui

# 一次性发送问题：
openclaw agent --message "帮我整理今天的待办"
```

#### 1.4 常用命令

```sh
# 查看可用模型、当前默认模型和认证状态
openclaw models list
openclaw models status
openclaw models auth list

# 设置默认模型
openclaw models set xiaomi/mimo-v2-pro
openclaw models set deepseek/deepseek-v4-flash

# 修改配置：模型、插件、skill、添加/移除渠道（钉钉、飞书、Telegram 。。）等等
openclaw configure

# Gateway 后台服务：查看状态、启动、停止、重启、启用自动启动
openclaw gateway status
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
openclaw gateway install

# 查看渠道状态
openclaw channels status
openclaw channels list

# 诊断与日志
openclaw doctor
openclaw gateway status
openclaw models status

# 查看底层错误日志
openclaw logs --follow

# 更新
openclaw update
openclaw doctor
openclaw gateway restart
```

#### 1.5 卸载

```sh
# --service：Gateway 后台服务
# --state：OpenClaw 配置与状态
# --workspace：工作区（包括会话、日志、你放进工作区的文件等）
# --app：macOS App（Windows 上此项无影响）

# --service、--state、--workspace、--app 用于选择各个作用范围
# --all 用于选择全部四个作用范围

# 预览将要移除的内容（安全，不会真的删除）
# --dry-run：显示将执行哪些删除操作
# --all：选择全部四个作用范围
openclaw uninstall --dry-run --all

# 真卸载，执行下面两句即可
openclaw uninstall --all --yes
npm uninstall -g openclaw

# 只想移除后台自启动、保留配置和工作区
openclaw gateway stop
openclaw gateway uninstall
```
