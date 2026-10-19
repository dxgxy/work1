# Git、调试与浏览器插件课程作业分析

> 本文区分了课程录音和作业截图中的“提交要求”，以及本次用户要求的工作范围。录音里出现的车辆数据讨论属于课堂中的其他业务上下文，不属于本次插件作业。

## 课程内容总结

课程分成三条主线：

1. **Git 基础与协作**：Git 是本地版本管理工具，GitHub 是远程托管平台，两者不是同一个东西。基本流程是 `git init`、查看 `git status`、`git add`、`git commit`、关联远程仓库、首次 `git push -u`，之后用 `git pull` 更新。分支用于隔离功能开发，确认后再合并。每完成一个可用功能就提交，进行大改动前先留一个可回退版本，并写清楚提交信息。
2. **Bug 定位与调试**：先判断问题属于页面前端、接口/数据层还是后端；在浏览器开发者工具的 Network 中检查请求路径、方法、参数、状态码和响应，在 Console 查看前端错误，在后端终端查看服务日志。常见判断是 2xx 请求成功、4xx 多为客户端请求问题、5xx 多为服务端问题，但仍要结合响应内容。修复时使用控制变量、二分排查、重启环境和 Git 回退；修复后补单元测试或接口测试，防止引入回归。
3. **浏览器插件项目流程**：先写需求分析和提示词，再生成 Manifest V3 浏览器插件；插件完成后单独制作配套静态介绍页，确保下载按钮指向真实 ZIP 包。最后把代码、README 和下载包整理进仓库，并在 GitHub Pages 发布介绍页。

## 本次作业要求

根据录音最后的明确布置，需完成一个**浏览器插件**（不是普通网页版工具），再完成一个介绍它的静态网页。插件可以自选主题，老师示例是电商详情页图片下载器。提交表单截图显示的材料要求为：

| 编号 | 表单要求 | 可接受证据 |
|---|---|---|
| 03 | 插件截图 | 插件实际加载后的界面，能看到核心功能和可操作状态 |
| 04 | 项目推送到 GitHub 的截图 | GitHub 公开仓库页面，能看到项目文件和提交记录 |
| 05 | 域名地址 | GitHub Pages 发布后产生的公网 URL |
| 06 | GitHub Pages 官网截图 | 通过公网 URL 打开的静态介绍页截图，页面应能真实下载插件 ZIP |

插件本身至少要满足：能在浏览器加载、核心操作可用、介绍页说明安装方法，并提供真实可下载的压缩包。README 应写项目介绍、安装与使用流程。

## 已在本地完成

- 插件源码位于 `extensions/image-downloader/`，Manifest V3，可扫描当前页面的 `img` 与 CSS 背景图，勾选后调用浏览器下载 API。
- 介绍页位于 `public/plugin/index.html`，演示页位于 `public/plugin/demo.html`，下载按钮已经指向 `public/downloads/ci-buddy-image-downloader.zip`。
- 修复了插件扫描失败时的错误处理、下载失败的部分成功提示，以及 PNG/GIF/WebP/JPEG 后缀识别。
- 增加了带 `?demo=1` 的本地插件预览路径和 `scripts/extension-smoke.mjs`，用 Playwright 加载未打包扩展、扫描演示页的 4 张图片，并生成真实插件弹窗截图和 JSON 验证记录。
- 本地检查已执行：`npm.cmd test`、`npm.cmd run typecheck`、`npm.cmd run build`、扩展 ZIP 内容检查，以及浏览器冒烟验证。

## 需要你手动完成

1. **GitHub OAuth/MCP 登录**：在 Codex 客户端重载工作区，确认 GitHub MCP 出现并完成 OAuth。不要把 PAT 写入仓库。
2. **创建公开 GitHub 仓库并推送**：按课程要求在 GitHub 创建公开仓库，然后在 `source/` 中执行本地关联和推送。当前工作区明确禁止我执行 `git push`、创建云端仓库或部署，因此这一步必须由你在自己的账号下完成。
3. **开启 GitHub Pages**：仓库 `Settings → Pages`，选择发布分支和包含 `public/` 静态文件的目录。若仓库根目录直接作为 Pages 源，需要把 `public/plugin/` 的发布内容复制到你选定的 Pages 根目录，或者单独配置构建产物目录；发布后等待 GitHub 给出公网地址。
4. **补交截图**：用真实扩展加载页截取 03；用公开仓库页面截取 04；填写 Pages 公网 URL 到 05；打开公网官网并截取 06。浏览器本地地址 `127.0.0.1` 不能代替域名。
5. **真实设备确认**：如果老师要求在 Chrome 真机上验收，请你在本机 Chrome 的 `chrome://extensions` 加载 ZIP 解压目录，打开 `public/plugin/demo.html`，点击扩展图标完成一次扫描和下载，再截取结果。Playwright 证据可证明本地代码行为，但不能替代你提交时的账号、GitHub 和公网发布证据。

## 推荐提交顺序

先在本地运行 `npm.cmd test`、`npm.cmd run typecheck`、`npm.cmd run build` 和 `node scripts/extension-smoke.mjs`；确认截图和 ZIP 都生成后，再由你创建公开仓库、推送、配置 Pages，最后补齐 03 至 06 四项材料。
