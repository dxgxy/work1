# 本轮验证记录

- TypeScript 与 Vite 生产构建通过。
- Vitest：5 个文件、14 项测试；包括真实模板解析、CSV 引号/BOM/换行、空文件拒绝、编码/行数/文件大小限制、错误与重复记录、无存储假成功、桥接同源校验、离线禁播、引擎缺失与语音 start 事件。
- 7 个本轮公共业务函数通过注册表 Schema 和实现/契约/测试路径校验，命令 `node scripts/verify-contracts.mjs`。旧草稿和所有回调的完整规范化仍属于后续 G0/G1 工作，不能宣称全仓 34 个契约已实现。
- Playwright MCP 在独立 Edge 配置中完成新档案 → 词库 → 选择本地 CSV → 预览 → 跳过重复 → 确认写入 → 发音设置未启用提示。最终浏览器控制台为 0 错误、0 警告。
- 390px 移动宽度设置截图保存在 `output/playwright/settings-mobile.png`，过程记录保存在 `output/playwright/import-smoke.json`。
- 新增 service worker 缓存范围与版本升级代码通过构建；离线首次安装、跨版本更新、并发多标签并未在本轮作端到端验收。
- 未执行真实 Oxford 付费接口，没有账户凭据或离线许可；演示包继续明确标注来源。未安装真实 Google 语音引擎，实际发声未验证；扩展的分支单元测试使用模拟 Chrome API。
- 尚未完成产品企划整体验收；现有功能缺口继续以 README 与任务清单为准。
