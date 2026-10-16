# Skills 与 MCP 配置记录

配置日期：2026-10-16（Asia/Shanghai）。本阶段仅准备开发工具；完整产品仍须按 G0/G1 起逐轮验收。

## 已安装 Skills

| Skill | 来源 | 用途 |
|---|---|---|
| react-vite-expert | questfortech-investments/claude-code-skills | React/Vite 组件与项目结构 |
| zustand-state-management | mindrally/skills | 客户端共享状态与选择器 |
| jest-typescript | bobmatnyc/claude-mpm-skills | TypeScript 测试参考；项目采用 Vitest，不额外引入 Jest |
| playwright | openai/skills，skills/.curated/playwright | 官方浏览器 CLI 流程 |
| security-best-practices | openai/skills，skills/.curated/security-best-practices | React/TypeScript 安全检查 |

前三项位于 `C:/Users/31918/.agents/skills/`；后两项位于 `C:/Users/31918/.codex/skills/`。已有的 find-skills、OpenAI Docs 等系统技能保留。新增 Skills 下一轮可供发现。

安装工具：Skills CLI 与 OpenAI skill-installer。未成功安装的第三方 playwright-core 不作为依赖；官方 playwright 已替代。

## MCP

| MCP | 固定版本 | 验证与状态 |
|---|---|---|
| Playwright | @playwright/mcp 0.0.83 | enabled；initialize、tools/list、启动无窗口 Edge、about:blank 导航通过 |
| Context7 | @upstash/context7-mcp 4.4.2 | enabled；initialize 与 tools/list 通过。文档上游查询仍受网络、速率和服务限制 |
| OpenAI Developer Docs | 公共 HTTP 服务 | 配置保留但 disabled；实测 403 或 fetch failed，不能声称已连通 |

两项 stdio MCP 通过项目 node_modules 的固定入口运行，不依赖每次启动时的 npx 下载。Context7 关闭可选遥测。Playwright 使用系统 Microsoft Edge，无需额外下载浏览器；输出内容和页面访问由工具调用决定。

项目级 `.codex/config.toml` 已由 `codex mcp list` 识别。已为 source 子仓库添加 trusted 标记，原用户配置备份为 `C:/Users/31918/.codex/config.before-ci-buddy-tools.toml`。桌面客户端可能需要重载项目或重新启动后才能加载新 MCP；当前聊天不能热添加工具。无需重新创建云端仓库。配置不含 API 密钥。

## 验证命令

```powershell
npm ci
codex mcp list
node scripts/verify-mcp.mjs
npm run typecheck
npm run build
```

若沙箱终端提示无法解析用户目录，当前终端使用 `codex -c` 或在可访问正常用户目录的终端检查；无需修改系统用户目录变量。验证脚本会在 `mcp-verification.json` 保存具体证据。因为文档 MCP 当前不可达，脚本包含该检查时返回非零是预期结果，必须阅读每项状态。

## 官方资料

- Codex MCP 项目配置：https://learn.chatgpt.com/docs/extend/mcp?surface=cli
- Microsoft Playwright MCP：https://github.com/microsoft/playwright-mcp
- Context7：https://github.com/upstash/context7
- OpenAI 文档 MCP：https://developers.openai.com/learn/docs-mcp

所有代码仅用本地 Git 管理；远端 origin 已移除。当前应用草稿的功能缺口见根目录 README.md，不能当作 P0 交付。
