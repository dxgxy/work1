# 词伴 Google 发音助手

这是本项目自带的独立 Chrome Manifest V3 扩展，不是 Google 官方产品。它桥接本地网页与 `chrome.tts`，只选择语音列表中名称包含 Google、语言为英语的引擎，不调用未公开的翻译音频地址，不将系统语音冒充为 Google。

1. 使用桌面 Chrome 打开 `chrome://extensions`，开启开发者模式。
2. 点击“加载已解压的扩展程序”，选择此文件夹。
3. 打开或刷新 `http://127.0.0.1:4173`，在网页设置中启用并测试。可填写扩展 ID 锁定此实例。

助手本身不安装语音引擎。若 Chrome 的 `chrome.tts.getVoices()` 没有 Google 英语语音，会返回明确错误。操作系统的语音、网页 Web Speech 的语音与扩展 TTS 引擎不保证相同；不要因网页曾能发音就声称本扩展能获得 Google 引擎。实际声音需在用户设备验证。

权限仅 `tts`，内容脚本匹配 localhost / 127.0.0.1，并进一步限制端口 4173。对外消息通道为 `ci-buddy-speech-v1`，验证同源、requestId、类型与文本长度。后台只接受本地端口的内容脚本消息；仅收到语音 `start` 事件后才返回成功。超时、缺少引擎和连接断开都会返回失败。Google 发音可能联网，网页的离线与手动 Wi-Fi 策略不启动它。

技术依据：[Chrome tts API](https://developer.chrome.com/docs/extensions/reference/api/tts)。本助手不保证任意 Chrome/Edge/移动浏览器具有 Google 引擎，且不支持远程部署域名。
