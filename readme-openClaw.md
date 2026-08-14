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

初始化之前，可以考虑先迁移 `.openclaw` 文件夹：[点击这里](#16-迁移-openclaw-文件夹)

```sh
# 完整配置向导 + 安装系统服务
openclaw onboard --install-daemon
```

遇到提示：`I understand this is personal-by-default and shared/multi-user use requires lock-down. Continue?` 选择 Yes
遇到提示：`Setup mode` 推荐选择 QuickStart
遇到提示：`Model/auth provider` 选择一个模型，没显示的话选择 More..
遇到提示：`Enter API key` 填入你的 API Key
遇到提示：`Default model` 可以让其显示所有模型，然后选择一个
后续的其余配置（消息频道、Skill 等）可根据需求配置，新手可以先选择 Skip for now，后面可通过 `openclaw configure` 去修改配置

> 对于配置模型，有不清楚的地方，可以到各模型官网查看 openClaw 接入文档

#### 1.3 开始使用

```sh
# 打开 Web UI，在 Chat 页面进行交互：
openclaw dashboard

# 在终端中打开 TUI：
openclaw tui

# 一次性发送问题：
openclaw agent --message "帮我整理今天的待办"

# 打开交互页面，需要先打开网关，如果网关没开，先启动网关（电脑重启后）
openclaw gateway start
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

# 真卸载，执行下面两句即可（卸载软件包和安装包）
openclaw uninstall --all --yes
npm uninstall -g openclaw

# 只想移除后台自启动、保留配置和工作区
openclaw gateway stop
openclaw gateway uninstall
```

#### 1.6 迁移 `.openclaw` 文件夹

默认配置目录在：`~/.openclaw`（Mac、Linux）或 `C:\Users\[用户名]\.openclaw`（Window），
在 Window 中配置环境变量 `OPENCLAW_STATE_DIR` 指定目录即可，例如：`D:\ManyConfigs\.openclaw`，
当然，这个 `.openclaw` 目录，需要自己事先剪切粘贴过去，另外，最好在 openClaw 初始化之前就迁移，
否则的话，可能会有软链接目录无法剪切过去，还有几个注意事项：

① 如果使用了 CC-Switch 配置模型，在 CC-Switch 里面的配置目录也要同步修改

② 如果迁移之后，`gateway` 无法启动，卸载重新安装即可：

```sh
openclaw gateway uninstall
openclaw gateway install
openclaw gateway start
```

③ 要检查 `.openclaw/openclaw.json` 文件内有没有写死的绝对路径（一般是 agent 的工作空间路径），
如果有，也要改成迁移之后的，注意文件路径单斜杠 `\` 转义问题，要用 `\\`

④ 即使在初始化之前就已迁移，openclaw 仍可能将 npm、workspace 等文件夹安装到用户目录的 `.openclaw` 下，
这个属于 bug，此时需要自己将这些文件剪切过去，然后改正 `openclaw.json` 文件里的 workspace 路径

### 2. 各种配置

#### 2.1 接入 channels（频道）

```sh
# 进入配置，选择 channels，然后按流程走，不同的 channel 需要的东西不一样
openclaw configure
```

**接入飞书：**

打开 https://open.feishu.cn/ ，点击 “开发者后台”，点击 “创建企业自建应用”，
名称和描述自定义就行，进入应用主页面，点击 “添加应用能力”，点击 “添加” 机器人，
点击 “权限管理” => “开通权限” => “消息与群组” => 勾选所有 => “确认开通权限”，
点击 “事件与回调” => “订阅方式” => “长连接，保存” => “添加事件” => 搜索“接收消息” => 勾选并添加，
点击 “版本管理与发布” => 随便写 => “保存”，
点击 “凭证与基础信息”，里面有 AppID 和 App Secret，
填入 openclaw 配置流程，接着出现一个选项，选择 Open（开放，中间那一个），按流程走即可配置成功，如果有提问，均选择：No，
最后，在飞书输入 “你好” 试试，它会让你在命令行执行：`openclaw pairing approve telegram <PairingCode>`，
复制它给出的命令行，到终端执行，接入完毕！
参考视频链接（尚硅谷的课程）：https://www.bilibili.com/video/BV11VA7zEE7y/?p=4

**接入Telegram：**

比接入飞书简单，只需要在 `BotFather` 新建机器人（`/newbot`），按流程往下走，
当 bot 建好之后，在 openClaw 写入 bot 的 HTTP API `ID:Token`（接 Telegram 时会让你填写），
最后对话，它会让你在命令行执行：`openclaw pairing approve telegram <PairingCode>`，
复制执行好了，实在不会可以参考这个视频：https://www.bilibili.com/video/BV1TpAZzeEiZ/

#### 2.2 安装 skills

这里提供两个 skills 网站：

ClawHub（是OpenClaw官方的插件和Skills公共库）：https://clawhub.ai/
SkillHub（腾讯推出面向国内用户的，本土友好）：https://skillhub.cn/

安装如下：

```sh
# 安装一个审查 skill 安全性的 skill（因为有些恶意的 skill 不安全）
# 注：这种方式只能安装 ClawHub 的 skill
openclaw skills install @xocio/skill-vetter-zh

# 默认是安装到主 agent，可以指定 agent 安装
openclaw skills install @xocio/skill-vetter-zh --agent <agentName>
```

执行命令后，默认会安装到 `~/.openclaw/workspace/skills` 文件夹

对于 SkillHub 的 skill 安装，可以下载 zip 包，然后解压到上述目录即可，
或者直接用提示词让 AI 自己安装

另外，也可以使用 vercel 的 skill 安装工具 `npx skills add ...` 去安装 skill，
这个工具基本上兼容了市面上所有 AI 工具 skill 的安装方式，非常方便，推荐使用！

学会寻找、安装、并使用 skill，对于各种 AI 工具来说，都是一件非常重要的事，它可以帮你自动化很多流程，节省很多时间，
不仅仅是写代码和日常办公，在其它领域例如自媒体运营、游戏、金融，都是非常有价值的，这个一定要掌握！

#### 2.3 多 Agent 配置

默认情况下，只有一个工作区，主会话：main（default），
我们可以执行以下命令新建一个 Agent：

```sh
# 新建一个 agent，可指定一个新的工作空间
openclaw agents add <agentName>

# 查看 agents 列表
openclaw agents list
```

创建完成后，你就可以在 openClaw 操作界面的 “代理” 里面，编辑不同 agent 的配置，
在会话区，可以选择不同的 agent 进行会话，这将是一个全新的 agent，它会说它刚上线，
我们可以对它从头开始进行一整套的配置
