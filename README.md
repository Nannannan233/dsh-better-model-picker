# dsh-model-picker

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

### 方式一：动态加载，立即试用

这是当前源码已经验证过的方式，零构建、零配置，适合试用和开发：

1. 在 DSH Web 会话中定义一个动态 Cordis 插件。
2. 将 `src/host.js` 中 `createModelPickerHost()` 返回对象的 `apply(ctx) { ... }` 作为 Host 半。
3. 将 `src/client.js` 中 `createModelPickerClient()` 返回对象的 `apply(ctx) { ... }` 作为 Client 半。
4. 运行插件，并在首次运行的授权提示中点击“允许”。

使用动态插件工具时，对应流程是：

```text
cordis_define -> cordis_run
```

动态插件只对当前 Harness 进程有效。Harness 重启后，需要再次加载。

### 方式二：从本地源码加载

适合修改代码后反复试用。先克隆或复制仓库：

```bash
git clone https://github.com/Nannannan233/dsh-better-model-picker.git
cd dsh-model-picker
```

然后按“方式一”把 `src/host.js` 和 `src/client.js` 加载为动态插件。修改源码后，需要重新定义一个新 Package，再运行更新后的 Package。

### 方式三：作为正式 DSH Web 插件安装

面向其他用户发布时，建议把 Client 半编译成 DSH Web 客户端插件 bundle，再通过 DSH profile 插件机制安装：

```bash
# 从 npm 安装
dsh plugin --profile web add dsh-model-picker

# 或从 GitHub 直接安装
dsh plugin --profile web add github:Nannannan233/dsh-better-model-picker

# 或从本地路径安装
dsh plugin --profile web add file:../dsh-model-picker
```

> 当前仓库中的 `src/host.js` 和 `src/client.js` 是**动态插件形式的源码**。正式安装前，Client 半需要按 DSH Web 客户端插件规范编译成 `window.__ModuleLoader__.load({ id, factory })` 形式的 `lib/client.js`；`package.json` 中的 `dsh.client` 字段用于声明 Web 客户端插件。

## 使用

1. 点击对话框右下角发送按钮左侧的模型控件。
2. 弹层打开后直接输入模型名、模型 ID 或提供商名。
3. 从“最近使用”区快速切回常用模型。
4. 点击 provider 标题折叠或展开分组。
5. 当前模型支持推理强度时，在弹层底部直接选择档位。

## 工作原理

```text
Client                                      Host
------                                      ----
替换 conversation.input.model slot
渲染搜索、分组、最近使用 UI
        | host.call('models'|'select')  ---> harness.handle('models')
                                          ---> llm.listProviders()
                                          ---> llm.listModels(provider)
                                          ---> llm.resolveModelInfo(...)
        | <--- { current, groups, recents }  harness.handle('select')
                                          ---> llm.resolveCallConfig() 校验
                                          ---> 更新 per-agent 选择
                                          ---> 保存默认模型
```

模型切换监听器使用 `agent.ctx.on(..., { prepend: true })` 注册到 api-proxy 监听器之前，使选择结果覆盖下一次请求实际使用的 provider、model 和 reasoning effort。

## 目录结构

```text
model-picker/
├── README.md
├── LICENSE
├── .gitignore
├── package.json
└── src/
    ├── host.js       # Host 半：模型目录、选择 RPC、最近使用记录
    └── client.js     # Client 半：选择器 UI 与 slot 注册
```

## 开发与发布

### 本地检查

```bash
git status
node --check src/host.js
node --check src/client.js
```

> `node --check` 只能检查普通 JavaScript 语法；动态插件实际运行仍需要 DSH Cordis 运行时。

### 发布到 GitHub

```bash
git init
git add .
git commit -m "feat: add searchable model picker"
git branch -M main
git remote add origin https://github.com/Nannannan233/dsh-better-model-picker.git
git push -u origin main
```

把 `YOUR_ACCOUNT` 替换成实际 GitHub 用户名，并先在 GitHub 创建一个同名仓库。公开仓库建议选择 Public，方便其他人安装和查看源码。

### 构建为正式客户端包

正式分发时，需要使用 DSH 项目采用的客户端构建链，将 Client 半输出为 Web Module Loader bundle，并保留 `package.json` 中的 `dsh.client` 声明。构建后再发布到 npm，或把构建产物提交到 GitHub 后通过 git 地址安装。

## 限制

- “最近使用”目前保存在 Host 进程内存中，重启 Harness 后会清空。正式插件可以改用 `localStorage` 或 settings / storage 服务持久化。
- 本插件替换的是 `conversation.input.model` 座位；内置 `/model` 命令弹层仍走内置目录，极端情况下两处显示可能短暂不一致。
- 子代理（subagent）会话未做专门的模型选择处理；普通会话不受影响。

## License

[MIT](LICENSE)
