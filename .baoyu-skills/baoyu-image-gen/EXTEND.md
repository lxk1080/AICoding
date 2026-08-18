---
version: 1
default_provider: codex-cli
default_quality: 2k
default_aspect_ratio: "16:9"

default_model:
  # 这是逻辑标识，Codex 内置图像能力无需手动选择实际模型
  codex-cli: "codex-image-gen"

# Codex 图像生成建议顺序执行，避免并发触发限额或认证问题
batch:
  max_workers: 1
  provider_limits:
    codex-cli:
      concurrency: 1
      start_interval_ms: 2000
---