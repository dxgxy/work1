# Oxford 词典预置数据管线

Oxford Dictionaries API 的 Words/Entries 端点可以返回定义、例句、音标和音频引用。API 请求需要 `app_id`、`app_key`，官方 FAQ 说明将内容保存为离线缓存需要 Enterprise 许可。因此前端不放密钥，预置卡片只在构建期或受控服务端生成，并携带 `contentProvider: "oxford-dictionaries-api"` 与许可元数据。

当前仓库的预置卡是 `demo-fixture`，界面会明确显示“演示数据”，不能当作 Oxford 授权内容。获得授权后，可按以下流程替换数据包：

1. 在受保护的构建环境设置 `OXFORD_APP_ID`、`OXFORD_APP_KEY`、`OXFORD_LANGUAGE`（`en-gb` 或 `en-us`）和 `OXFORD_LICENSE_REFERENCE`。
2. 输入 UTF-8 单词列表；脚本逐词请求 Entries 端点，映射定义、例句、音标和可用音频引用，并在所有词成功校验后一次性输出 JSON。
3. 将授权范围、数据版本和生成时间记录到数据包元数据，再把数据包放进 `src/data/generated/`，由预加载器读取。

不得把 app key 写入 `VITE_*` 环境变量或浏览器包，也不能把请求失败的内容标成 Oxford。接口、授权和离线许可未配置时，应用继续使用已标明来源的演示卡。

```powershell
$env:OXFORD_APP_ID = '你的 app_id'
$env:OXFORD_APP_KEY = '你的 app_key'
$env:OXFORD_LICENSE_REFERENCE = '你已获得的离线许可编号'
$env:OXFORD_LANGUAGE = 'en-gb'
node scripts/build-oxford-pack.mjs words.txt
npm.cmd run build
```

默认输出 `src/data/generated/oxford-cards.json`。预加载器会检查版本、来源、许可引用和必填字段；合法包在新档案中直接加载，在已有档案下补入未加载的 Oxford 卡，保留原来的演示/自建卡与历史。英文单语 API 不会自动产生中文译文，界面显示英文释义与“未提供中文译文”；脚本不会编造译文。音频链接不会被当成已下载音频。

本仓库尚未配置任何真实 API 账号或许可，因此没有执行付费请求。官方来源：[FAQ（含缓存许可）](https://developer.oxforddictionaries.com/faq)、[请求与密钥](https://developer.oxforddictionaries.com/documentation/making-requests-to-the-api)、[端点说明](https://developer.oxforddictionaries.com/endpoints)。
