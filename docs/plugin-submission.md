# 插件提交材料与验收映射

第一张截图是要求，第二张截图是提交表单的材料位置。本地仓库已经准备以下可复核内容：

| 提交项 | 本地内容 | 验证方式 |
|---|---|---|
| 03 插件截图 | `output/playwright/image-downloader-real-popup.png` | 真实加载 Manifest V3 扩展后弹窗展示扫描到的 3 张图片、全选与下载按钮 |
| 04 推送 GitHub 截图 | 当前分支提交前工作区 | 本仓库规则禁止 push，需用户在 GitHub 操作后补截图 |
| 05 域名地址 | `http://127.0.0.1:4173/plugin/index.html`（本地验证地址） | 不是公网域名，需部署方填写真实地址 |
| 06 GitHub Pages 截图 | `public/plugin/index.html` 对应的静态页 | 本地页面已通过浏览器检查，发布后再补 GitHub Pages 截图 |

## 本地插件

- 源码：`extensions/image-downloader/`
- 下载包：`public/downloads/ci-buddy-image-downloader.zip`
- 演示页：`http://127.0.0.1:4173/plugin/demo.html`
- 下载页：`http://127.0.0.1:4173/plugin/index.html`

下载页按钮会实际触发 ZIP 下载；扩展解压后可在 Chrome 的 `chrome://extensions` 中加载。插件使用 `chrome.downloads.download` 保存用户勾选的图片，不上传图片。

## GitHub MCP

已改为 GitHub 官方远程 MCP 配置：`https://api.githubcopilot.com/mcp/`，配置位于 `.codex/config.toml`。首次使用需要在 Codex 客户端完成 GitHub OAuth；本地仓库不保存 PAT，也不执行 push 或部署。连接状态需要重载客户端后由用户登录验证。


扩展行为证据：output/playwright/image-downloader-smoke.json 记录了真实未打包扩展扫描演示页 4 张图片并生成弹窗截图。课程与提交要求分析见 [docs/course-homework.md](course-homework.md)。

