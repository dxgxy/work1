# 词伴 Web 开发工作区

这是依据英语学习平台企划书建立的本地开发仓库。目前包含工具配置与初始 React PWA 草稿，尚未完成企划验收。

## 本地运行

```powershell
npm ci
npm run dev
```

地址：http://127.0.0.1:4173

```powershell
npm run typecheck
npm run build
node scripts/verify-mcp.mjs
```

产品文档：`docs/product-spec.md`。任务清单：`docs/codegen-tasks.md`。工具安装记录：`docs/setup/README.md`。

## 现有草稿的限制

当前存储是 localStorage，尚未实现 IndexedDB 原子事务、事件幂等与真正的 outbox；调度为草稿算法，必须替换成核验并固定版本的 FSRS。测评是少量演示题，今日页的部分统计仍是占位数据。听力页已改为句子发音示例，没有宣称已下载离线音频。页面中的同步状态不能作为真实服务端能力验收依据。

下一轮从 G0 Web 能力验证和 G1 本地学习事务闭环开始，补齐函数格式、注册表、可恢复会话、真实统计和失败路径。服务端、账号鉴权、两端同步、Android、AI 和支付未实现。

本地 Git 分支 `codex/local-web`，远程 origin 已移除，不上传云端。

## 本轮新增

- **现在已内置 8,512 个 ECDICT 英汉词条，无需 API 或账号。** 刷新网页 → 词库即可查看，支持中考、高考、四级、六级、雅思分类、搜索与分页。旧档案会自动补入词库并保留学习记录。来源、许可与数据生成方法见 [离线词库说明](docs/data/ecdict.md)。

- 词库 → 批量导入：先下载 UTF-8 模板，选择 CSV / TXT（制表符）/ JSON 文件，检查预览与错误，确认后保存。格式详见 [词书导入规范](docs/wordbook-format.md)，模板在 `public/templates/`。
- 设置 → Google 扩展发音：加载项目附带的 `extensions/google-pronunciation` 独立 Chrome 扩展，再启用并测试。助手仅选择系统可用列表中的 Google 英语语音；它不是 Google 官方扩展，也不自带 Google 语音引擎。未安装扩展、缺少语音或离线均会提示，不会用其他语音冒充。
- Oxford 构建期数据生成与来源标记：[配置说明](docs/oxford-data-pipeline.md)。没有 API 凭据与离线许可时，预加载包仍为空，应用显示“演示数据”，不会声称现有示例来自 Oxford。

```powershell
npm.cmd test
npm.cmd run build
# 保持 npm.cmd run dev 运行，然后执行浏览器检查
node scripts/browser-smoke.mjs
```

本轮测试覆盖格式解析、编码、重复、超限、失败不写入、离线禁播与桥接回复校验。浏览器检查覆盖导入预览/确认和未启用扩展提示；尚未验证真实 Google 发声、真实 Oxford 请求或 Android。


课程录音、作业提交项和需要手动完成的 GitHub/Pages 步骤见 [课程与作业分析](docs/course-homework.md)。

