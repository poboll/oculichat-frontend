#!/bin/bash

# 文件路径
CONFIG_FILE="src/requestConfig.ts"

# 检查文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
  echo "提示：文件 $CONFIG_FILE 在此提交中不存在，跳过处理"
  exit 0  # 成功退出，不中断filter-branch流程
fi

# 显示文件当前状态
echo "当前配置："
grep -A 3 "baseURL" "$CONFIG_FILE" || echo "未找到baseURL配置"

# 使用更通用的模式来匹配和替换所有可能的开发环境 API 地址
# 这会替换任何 10.x.x.x 或特定的 IP 地址为 127.0.0.1
sed -i '' -E "s|(baseURL:.*production.*:.*)'http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:7529/'|\1'http://127.0.0.1:7529/'|g" "$CONFIG_FILE" || echo "替换失败或无匹配内容"

# 显示更新后的状态
echo -e "\n更新后："
grep -A 3 "baseURL" "$CONFIG_FILE" || echo "未找到baseURL配置"
