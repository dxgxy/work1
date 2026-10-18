# 词伴商品图片下载器

这是一个 Manifest V3 Chrome 扩展。它在用户主动打开扩展弹窗后，扫描当前网页的 `<img>` 与 CSS 背景图，允许勾选并调用浏览器下载 API 保存到本地 `ci-buddy-images/` 目录。

## 安装

1. 解压 `ci-buddy-image-downloader.zip`。
2. 打开 Chrome 的 `chrome://extensions`，启用“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择解压后的 `image-downloader` 文件夹。
4. 打开一个商品列表页，点击工具栏中的“词伴商品图片下载器”。

扩展不上传图片，不调用远程 API。下载权限仅用于用户点击后的本地保存；浏览器受限页面（例如 `chrome://`）不支持扫描。
