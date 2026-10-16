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

当前存储是 localStorage，尚未实现 IndexedDB 原子事务、事件幂等与真正的 outbox；调度为草稿算法，必须替换成核验并固定版本的 FSRS。测评是少量演示题，听力页面的进度与统计存在占位数据。页面中的同步、下载和听力完成标志不能作为真实能力验收依据。

下一轮从 G0 Web 能力验证和 G1 本地学习事务闭环开始，补齐函数格式、注册表、可恢复会话、真实统计和失败路径。服务端、账号鉴权、两端同步、Android、AI 和支付未实现。

本地 Git 分支 `codex/local-web`，远程 origin 已移除，不上传云端。
