#!/bin/bash
# Hook 脚本：记录文件编辑日志（时间戳、操作类型、文件路径）

# 从 stdin 读取 JSON
INPUT=$(cat)

# 使用 Python 提取工具名称和文件路径
TOOL=$(echo "$INPUT" | python -c "import sys,json; d=json.load(sys.stdin); print(d['tool_name'])")
FILE_PATH=$(echo "$INPUT" | python -c "import sys,json; d=json.load(sys.stdin); print(d['tool_input']['file_path'])")

# 如果 logs 目录不存在则创建
mkdir -p logs

# 获取当前日期用于日志文件名
DATE=$(date '+%Y%m%d')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 追加到日志文件
echo "[$TIMESTAMP] [$TOOL] $FILE_PATH" >> "logs/claude-print-$DATE.log"
