# GitHub MCP 配置

项目现在使用 GitHub 官方远程 MCP 服务地址：`https://api.githubcopilot.com/mcp/`。旧的 `@modelcontextprotocol/server-github` npm 包已经被弃用，因此不再作为本项目依赖安装。首次使用需要在 Codex 客户端完成 GitHub OAuth；凭据不写入仓库。

配置位置：`.codex/config.toml` 的 `[mcp_servers.github]`。

验证步骤：

1. 重载 Codex 工作区或重启客户端。
2. 在 MCP 列表中确认 `github` 已出现。
3. 按客户端提示完成 GitHub 登录。
4. 只进行读取验证；本项目仍禁止 push、创建云端仓库和部署。

如果客户端不支持远程 MCP 的 OAuth，需要在客户端设置中使用同一 URL 完成授权，不能把 PAT 写入此仓库。
