# 已内置的无需 API 词库

数据来源：[skywind3000/ECDICT](https://github.com/skywind3000/ECDICT)。下载固定提交 `bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b` 的 `ecdict.csv`，按中考、高考、四级、六级、雅思标签筛选，保留具有中文释义的英文词条，规范化文本换行并去重，最终为 **8,512** 个词条。

| 上游标签 | 页面分类 | 数量 |
|---|---|---:|
| zk | 中考 | 1,601 |
| gk | 高考 | 3,674 |
| cet4 | 四级 | 3,846 |
| cet6 | 六级 | 5,406 |
| ielts | 雅思 | 5,040 |

同一词条可属于多个分类。标签为上游历史数据，不能当作当前官方考试大纲。保留源中文释义、已有英文释义和音标；未补写不存在的例句、音频或释义。卡片显示 `ECDICT · MIT`，不会标记为 Oxford。

仓库提供的 [MIT 许可](https://github.com/skywind3000/ECDICT/blob/bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b/LICENSE) 原文保存在 `public/licenses/ECDICT-MIT.txt`，随构建分发。原始 CSV 约 66 MB，下载缓存位于忽略目录 `.cache/ecdict/`；只将筛选后的约 2.5 MB JSON 与来源、哈希记录纳入本地 Git。来源提交、输入与输出 SHA-256 和分类计数见 `ecdict-manifest.json`。

应用启动时直接从打包内容读取词条，无运行时下载、无需注册、无需密钥。旧档案刷新后按稳定词条 ID 自动补入，已有卡片、学习记录和复习状态保留。词库页面每页 48 张，支持英文、中文、英文释义搜索。内置 ECDICT 文本不重复写入 localStorage，学习状态仍正常保存；导出的完整 JSON 备份包含所有卡片。

离线使用需先打开一次生产构建让应用资源缓存成功。开发服务器不会注册新的 service worker。文字卡片可离线查看，Google 扩展发音可能依赖网络。

为让离线词库无需外部字体服务，界面改用已安装字体。包含全量学习词条的生产 JS 约 2.6 MB（gzip 约 1.0 MB）；这是本地打包数据，首次加载后由 service worker 缓存，不会逐词调用网络接口。

## 复现生成

```powershell
# 下载一次固定提交的公开文件，无 API 账号
New-Item -ItemType Directory -Force .cache/ecdict
Invoke-WebRequest 'https://raw.githubusercontent.com/skywind3000/ECDICT/bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b/ecdict.csv' -OutFile .cache/ecdict/ecdict.csv
python scripts/build-ecdict-pack.py
npm.cmd test
npm.cmd run build
```

脚本输出为 `src/data/generated/ecdict-cards.json`，生成来源和版本见本文件与 manifest。完整词库未进行人工逐词校对，释义或音标可能存在上游历史错误。
