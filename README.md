# dsh-better-model-picker

> 一个用于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web 的模型选择器改进插件。

把对话框右下角发送按钮左侧那个“模型 / 推理强度”选择框，替换成一个**搜索 + 按提供商分组 + 最近使用**的高效选择器。

## 功能特性

| 能力 | 说明 |
| --- | --- |
| 搜索过滤 | 打开即聚焦，按模型名、模型 ID 或提供商名过滤；在搜索框按 `Enter` 选择第一个匹配项 |
| 按提供商分组 | 模型按 provider 分组，分组标题可以折叠或展开 |
| 最近使用 | 最近切换过的模型置顶展示，最多保留 8 条 |
| 推理强度 | 当前模型支持的推理强度以 chips 形式保留，可直接切换 |
| 主题一致 | 使用 DSH 主题 CSS 变量，自动适配明暗主题 |

## 安装方式

# 从 GitHub 直接安装
```
dsh plugin --profile web add github:Nannannan233/dsh-better-model-picker
```

## 使用

1. 点击对话框右下角发送按钮左侧的模型控件。
2. 弹层打开后直接输入模型名、模型 ID 或提供商名。
3. 从“最近使用”区快速切回常用模型。
4. 点击 provider 标题折叠或展开分组。
5. 当前模型支持推理强度时，在弹层底部直接选择档位。

## License

[MIT](LICENSE)
