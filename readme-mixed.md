
#### 1. 迁移 vscode 的配置目录

vscode 相关的目录主要有两个，但是都在 C 盘：

- 全局用户配置目录：`C:\Users\[用户名]\.vscode`，这里面主要就是安装的扩展，比较占空间
- 用户数据目录：`AppData/Roaming/Code`，包含用户配置、缓存、界面状态

有两种解决方式：

##### ① 修改环境变量

Windows 系统环境变量：

- `VSCODE_EXTENSIONS` → 指定扩展目录（对应 .vscode/extensions，这个只指定扩展目录，不能指定整个 .vscode 目录）
    - 例如将其设置成：`D:\ManyConfigs\.vscode\extensions`
- `VSCODE_USER_DATA` → 指定用户数据目录（AppData/Roaming/Code）
    - 例如将其设置成：`D:\ManyConfigs\.vscode\Code`

##### ② 符号链接（软链接，透明迁移）

将 `.vscode` 剪切到 D 盘 `D:\ManyConfigs\.vscode`

以管理员打开 CMD（只能用 CMD，用 powershell 不行），执行：

`mklink /J "C:\Users\你的用户名\.vscode" "D:\ManyConfigs\.vscode"`

执行后，会在 C 盘生成 `.vscode` 文件夹，图标上显示有快捷方式图案，但是点击属性，就和正常的文件夹一模一样

系统访问 C 盘路径时，自动重定向到 D 盘，vscode 无感知

`/J` 是目录联结，简单稳定
