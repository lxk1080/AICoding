# node-linker

Windows 下快速创建或删除用户目录中的 Junction（目录软链接）。不依赖第三方包。

## 全局安装

在本项目目录中执行：

```powershell
npm install -g .
```

安装后可在任意目录直接使用：

```powershell
linker add "D:\ManyConfigs\.others"
linker rm "D:\ManyConfigs\.others"
linker list
```

开发时也可用 `npm link` 注册本地项目为全局命令；执行 `npm unlink -g node-linker` 可移除该注册链接。

> 只有将本项目发布到 npm 且包名可用后，才能通过 `npm install -g node-linker` 从 npm 仓库安装；在本地开发阶段使用 `npm install -g .` 或 `npm link` 即可。

例如，给定源目录 `D:\ManyConfigs\.others`，脚本会取得最后一个目录名 `.others`，并操作：

```text
C:\Users\你的用户名\.others
```

## 建立链接

```powershell
cd node-linker
node linker add "D:\ManyConfigs\.others"
```

确认后执行：

```text
mklink /J "C:\Users\你的用户名\.others" "D:\ManyConfigs.others"
```

## 删除链接

```powershell
cd node-linker
node linker rm "D:\ManyConfigs\.others"
```

如果链接不存在，脚本会直接结束。若存在，会在确认后执行 `rmdir` 删除 Junction 本身，不会删除源目录。

删除前会确认目标确实为软链接/Junction；如果目标是普通目录，脚本会停止，避免误删真实文件夹。

## 查看链接列表

```powershell
cd node-linker
node linker list
```

脚本会列出当前用户目录中目标不在 `C:` 盘的软链接和 Junction，并显示各自的 NTFS 类型（`Junction` 或 `Symbolic Link`）及指向的目标。指向 `C:` 盘的系统兼容性链接会被自动隐藏。

> 系统创建的兼容性链接与用户创建的 Junction 在文件系统层面的类型可能相同；链接本身不记录创建者，因此不能只靠类型可靠地区分“系统创建”与“手动创建”。
