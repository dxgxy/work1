# 英语学习平台项目企划书与开发规格

版本 1.0  |  日期 2026年10月16日  |  产品暂名 词伴

面向产品负责人、设计师、Web 与 Android 开发者及代码生成代理。本文件把双模式英语学习平台拆成产品规则、数据结构、接口、函数契约和验收任务。核心决策是先交付可离线学习、可跨端同步的卡片与听力闭环，再扩展 AI 输出、宠物、房间和社区。全文中的容量、时间、预算阈值均为首版设计基线或验证目标，不代表已验证的效果或市场数据。

## 1 产品定位与范围

### 1.1 用户与价值

主要用户是有明确学习目标、希望把词汇记忆转化为听力理解和实际表达的中文母语英语学习者。首批覆盖四六级、雅思备考与旅行交流；保研、留学等需求先作为目标标签与内容主题，不分别建设产品。少儿专属社区暂不开放，后续需单独设计监护与内容机制。

产品闭环为：确定目标与能力画像 → 选择词库 → 每日卡片任务 → 在文本和音频中再遇 → 句子或对话输出 → 根据实际表现调整复习与任务。宠物、等级、社区服务于这一闭环，不占用首屏主要注意力。

### 1.2 首版成功标准

核心指标是每周有效学习用户数与七天后同类题目的延迟回忆率。有效学习定义为当日完成至少五个不同学习项目的有效作答，或完成一次至少三分钟的听力练习；后台播放、页面停留和反复刷同一答案不计入有效学习。

配套观察激活率、次周留存、到期复习完成率、离线任务成功率、同步冲突率、AI 单次有效任务成本。上线前不承诺数值提升；先通过封闭测试建立基线，再设正式业务目标。不得用在线时长替代学习效果。

### 1.3 产品分期

|阶段|交付内容|明确的退出条件|
|---|---|---|
|P0 学习底座|双模式壳、目标、基础测评、词卡句卡、词书、List、复习、离线、同步、导入导出、基础听力|核心验收用例全部通过，无学习记录丢失|
|P1 个性化学习|AI 检索与内容补全、听力对齐、AI 单人房、基础效率工具、应用内宠物|费用可控，内容可纠正，失败有降级|
|P2 输出与互动|真人主题房、邀请制社区、人工审核台、公开内容授权流程|举报与管理链路可用，实时连接压测通过|
|P3 生态与经营|剧本房、主题组件、受限扩展、广告与商业化完善|学习体验与运营成本验证后逐项放量|

所有阶段共享同一数据模型。未实现模块不得显示可点击但无响应的正式入口。完整模式只展示已发布功能；实验功能标为测试并可关闭。

## 2 双模式与界面配置

### 2.1 清爽版

默认首页只有今日复习、新学任务、当前词书、快速查词四个区域，底部导航为今日、词库、我的。AI 检索入口在查词中按需展开。用户可以额外添加听力、番茄钟、宠物等已启用组件；默认最多添加四个，避免简单模式逐渐失控。

首页顶部持续显示网络策略与同步状态，例如“手动离线 · 待同步 12 条”。切换离线策略不应改变界面模式。

### 2.2 完整版

桌面端采用侧栏导航与主工作区，手机采用今日、词库、听力、发现、我的五个一级入口；发现内部容纳房间和社区。用户可调整首页组件顺序、隐藏模块、设置常用练习方式。不能删除账号、安全、数据导出与同步入口。

两种模式切换必须保留当前学习会话、草稿、播放器进度和任务列表，不新建账号、不复制学习进度。组件配置按用户同步，但 desktop、mobile 两种布局分别保存。

### 2.3 模块协议

每个模块声明 moduleId、version、titleKey、supportedModes、requiredCapabilities、offlineSupport、entryRoute、widgetIds、minimumClientVersion。模块加载状态为 available、disabled、requiresNetwork、requiresPermission、unavailable；不得把需要联网误报为权限不足。

P0 组件白名单：todaySummary、reviewQueue、currentBook、quickLookup、syncStatus。P1 增加 listeningResume、focusTimer、petReminder、inspirationInbox。远端布局配置只允许修改注册组件及其 JSON 参数，不得注入 JavaScript、HTML 或任意原生代码。

## 3 新用户引导与水平测试

### 3.1 首次流程

支持游客开始。用户选择目标类别、目标日期、每日可用分钟数、兴趣和偏好口音；考试分数仅作为用户自报目标。随后选择快速测评、完整测评或跳过。跳过时使用用户自报基础并标记可信度低，通过后续学习校正。不得强制使用麦克风、上传音频或绑定社交账号。

游客数据属于本地 profileId。登录时展示合并预览，确认后映射到账号，保留事件 ID。合并不得覆盖账号已有进度，也不能把一个游客档案自动交给下一位登录者。

### 3.2 测什么

|维度|题型|输出|不能推断的内容|
|---|---|---|---|
|词义识别|四选一及“不知道”|分频段识别表现|不能据此直接认定主动词汇量|
|主动提取|看中文输入词、补全短语|拼写和意义提取表现|不能等同口语表达能力|
|听力识别|听词或短句选择、关键词听写|声音与意义连接、短句理解|不能由听词成绩推断长篇理解|
|阅读理解|短段落主旨、定位、推断题|篇章理解表现|不能等同正式考试阅读分数|
|口语与写作|自愿录音或短文|单独的诊断反馈|未经标定不能给正式考试预测分|

快速版约 5 至 8 分钟：先做六题定向题，再在词义、拼写、听力、阅读四维各做四至六题，最多三十题或八分钟。完整版本约 15 至 25 分钟，每个核心维度至少十二道有效题，可追加输出任务。此时间为 UX 预算，题库试测后调整。

### 3.3 P0 可实现的选题算法

题库难度使用内部 band 1 至 6，不宣称与 CEFR 一一对应。每维从 band 3 开始，连续答对两题上调一级，连续答错或选择不知道两题下调一级，边界截断在 1 至 6。每次移动后清空连续计数，不重复题目与同一题族。每维的 band 分数用最近至多八道有效题的难度与正确情况按版本化查表计算，表保存在 assessment_scoring_config 中。

首版查表规则：单题 evidence = clamp(band + (correct ? 0.5 : -0.5), 1, 6)；维度分数为 evidence 均值，保留一位小数。每维四题前只显示“样本不足”；四至十一题为低可信度，十二题及以上且至少覆盖两个 band 为中可信度。未经真实题库标定不显示统计意义上的置信区间或“高可信度”。这只是诊断启发式，不是心理测量意义上的能力估计。

未回答因跳过能力题计为不知道；音频加载失败、设备打断不计分并补发不同题。极短反应时间只标记异常，不直接认定作弊。结束条件为总时限、总题数或用户主动结束；保留已答结果并明确缺测维度。报告不合并为单一等级，目标词库根据各维度短板推荐。

P1 收集足够且经质量审查的匿名化答题数据后，可以引入经过标定的 IRT/CAT；题目参数、标准误和停止阈值应随标定报告发布，不能把启发式分数包装为标准等级。

### 3.4 题库与防虚高

题目记录 questionId、familyId、dimension、band、stem、options、answer、audioAssetId、source、license、version、reviewStatus。正式测评只使用审核通过且权利明确的题；AI 生成题先进入候选池。选项长度和词性尽量一致，避免通过格式猜答案。不同测评至少间隔七天，重测排除近期题族。

词汇量如需显示，必须采用单独的按词频层分层随机抽样方案，给出抽样范围、词形口径与误差；P0 只报告“在已测题目中的表现”，不输出未经验证的五千词之类精确数字。

### 3.5 目标与词库生成

Goal 包含 goalType、targetDate、dailyMinutes、targetBookIds、targetScore、自报基础。词库推荐依据目标标签、内部难度段、缺口、版权可用性和用户主动选择，不让模型自由编造词书。

每日新增量默认二十张，可设置为零；到期复习优先。用最近七个有效学习日的单卡中位耗时估计负担，无历史时采用可配置初值，不声称能保证按期达标。若预计任务超过每日预算，提供减少新增量、延后日期或增加时间三个选项。考试日期临近只提醒，不制造断签焦虑。

## 4 卡片领域模型与内容规则

### 4.1 统一结构

原始设想中的 A、B、C 不建成三个互斥类型。使用 kind = word | sentence，sourceType = curated | user | imported | ai_assisted，组合得到预置单词卡 A、直接添加句子卡 B、自定义卡 C。自定义卡必须先选择 word 或 sentence；短语属于 word，并设 lexicalUnitType = phrase。界面给 user、imported 来源显示“自添加”。

公共 Card 字段：id、kind、language、text、normalizedText、translationLanguage、translations、explanations、examples、note、audioAssetIds、sourceType、sourceRef、ownerId、visibility、contentVersion、createdAt、updatedAt、deletedAt。所有时间用 UTC RFC3339；UI 使用用户时区。预置公共卡 ownerId 可空，自定义卡必须有 ownerId。

学习状态不写进公共卡。复习标记由用户的 LearningItem 和 ReviewState 计算，如新卡、学习中、待复习、已暂停。不同用户不能互相改变记忆状态。

### 4.2 单词卡 A 与自定义 word 卡

正面按练习模式显示单词、中文或音频；背面展示词形、词性、常用释义、英式或美式音频、同语言释义、例句及翻译、关联卡片。音标和发音缺失时显示缺失，不伪造字段。

同语言解释是英文词配英文定义；母语译文为中文。多义词按 senseId 区分，例句和关联义项绑定。支持 root、same_root、confusable、synonym、antonym、user_link 六种关系，CardLink 记录 fromCardId、toCardId、relationType、senseId、origin、confidence。AI 推断的词源关系须标注并审核，不能当作事实自动发布。

添加链接时可查找已有卡或创建私有卡。禁止自环；允许 A→B 与 B→A 在查询时双向展示，但同一关系不得重复插入。外链只允许 http/https，站外打开并禁止脚本协议。

### 4.3 句子卡 B 与自定义 sentence 卡

输入句子为必需，译文、场景例句、注释为可选。批量添加先预览分句结果，用户逐条勾选后导入；选中文章句子可保留 articleId 与字符区间，不能依赖易变化的页面 DOM 位置。

修正原设想中的语言歧义：英文原句缺译文时生成中文译文，中文原句需要学英文时生成英文译文；targetLanguage 必填并允许用户修改自动检测语言。附加例句是场景扩展，不把原句重复存为例句。

校验分为阻断与提示：空文本、超长文本、非法结构阻断；疑似错别字、语法问题、翻译不一致只提示并保留原文。AI 不得静默改写用户原句。翻译、注解和 TTS 独立生成，任一失败不影响卡片保存。

### 4.4 内容生成与修订

生成状态为 missing、queued、running、ready、failed、cancelled。卡片本体可在缺译文或缺音频时存在。每个生成字段记录 provider、modelVersion、promptVersion、generatedAt、sourceContentHash、reviewStatus，不把供应商密钥放入卡片。

用户修改字段后标记 userEdited；旧 AI 任务返回时必须比较 contentHash 和字段版本，不覆盖新内容。公共卡更新保留版本，用户可固定旧版本；个人笔记是独立用户层覆盖。内容严重纠错以通知方式呈现，用户能查看变更。

## 5 List 与复习机制

### 5.1 List 规则

普通 List 由词书顺序或筛选结果生成，初建十至三十张，默认二十张；只允许同 kind 的卡片。删除后可以少于十张，不能为了满足数量强塞新卡。日复习队列可以跨 List 汇总，也可以超过三十张，因此“List 容量”不等于“每日复习上限”。

收藏 List 允许与普通 List 重复，也允许同一卡出现在多个收藏 List；同一收藏 List 内同一 cardId 仍只出现一次。普通 List 在同一用户、同一学习计划内对 cardId 去重；跨计划重复只提示。语义近似但不同义项的卡由用户决定，不按文本简单合并。

List 是组织工具，记忆状态属于 userId + cardId + skill。删除 List 内卡片默认仅移除关联，不删除原卡和历史；另提供“暂停此卡所有练习”确认操作。删卡与删学习记录必须分开。

### 5.2 学习项目与题型

|卡片 kind|skill|提示与作答|揭示后|
|---|---|---|---|
|word|meaning_recognition|英到汉选择或回忆|展示完整卡、播放可用音频|
|word|word_recall|汉到英输入或回忆|展示义项与标准答案|
|word|listening_recognition|听音选义或输入|显示文字和完整卡|
|word|spelling|听音或释义拼写|逐处提示错误|
|sentence|sentence_listening|隐藏文本盲听，再自评或关键词作答|展示完整句卡并重播|

用户只启用需要的 skill，默认 word 启用 meaning_recognition，sentence 启用 sentence_listening，避免一张卡四倍增加负担。各 skill 独立调度，统计“卡数”和“练习次数”分开。盲听阶段没有文字可访问性支持时允许切换字幕，并标记辅助完成。

### 5.3 答题状态机

queued → presented → answered → revealed → rated → committed。用户可先揭示再自评；此时不记客观正确率。选择题提交即锁定答案，揭示完整卡，音频在用户手势允许的情况下播放；关闭自动播放后遵循设置。

评分统一 again、hard、good、easy。客观答错必须 again；正确但用提示最多 hard；独立正确可 good，easy 需用户明确选择。没有客观答案的句子盲听只给自评，不伪造正确率。切后台停止计时，单次响应时间上限按配置截断。

ReviewEvent 在本地事务中先写成功，再推进界面。恢复时不能因为崩溃重新提交已完成事件。撤销使用 compensating event 撤销最近一次未被后续练习依赖的记录，并重新计算状态，不直接删除历史事件。

### 5.4 调度算法

“艾宾浩斯”作为产品对间隔复习的解释，不作为每个人统一固定天数表。首版使用固定版本的 FSRS 实现，建立 SchedulerAdapter；锁定依赖版本、参数与算法授权，客户端与服务端使用同一组测试向量。默认 desiredRetention = 0.90，用户可在高级设置调节至 0.80 至 0.95，并展示复习负担估计；未经数据验证不声称最优。

算法输入必须包含 previousState、rating、reviewedAt、schedulerVersion、parametersVersion；输出 dueAt、stability、difficulty、state、scheduledDays。公式交给已核验实现，不由 AI 自创。个性化参数优化放 P1，通过回放比较后启用，并保留回滚版本。

每日优先级为学习中短间隔项目、逾期项目、当日到期、新卡。用户可设当日任务展示上限，超出的记录保留到期，不将其改成已学。到期时间是 UTC instant，dailyLearningDate 按用户时区和默认凌晨四点日界计算；更改时区不改变实际到期时刻。

### 5.5 表单与统计

复习单展示日期、单词或句子、中文译文、练习方式、结果；简洁视图只显示文本与译文。List 单展示列表顺序与卡片。每日记录从有效事件派生，可导出 CSV/JSON；导出时防止以 =、+、-、@ 开头的用户文本被表格程序执行为公式。

准确率只统计有客观答案且未揭示的题；自评记忆率单列。删除和重做不应刷高累计学习数。

## 6 词库 查词与文本统计

### 6.1 词书

词书记录名称、版本、语言、目标标签、排序、来源、许可和可下载范围。首版仅内置授权或自建词书，不假定商业考试词书可复制。用户词书默认私有。公共词书引用 Card，用户进度通过 LearningItem 关联。

导入支持 UTF-8 TXT、CSV、JSON，P0 单文件上限十 MB、最多一万条；字段映射预览、语言检测、重复预览、错误行下载、分批确认全部必备。音频和带格式文档另走媒体流程。导入任务可取消、可重试，以 importJobId + rowNumber 保证不重复写入。创建中间草稿，最后发布词书版本，避免中途失败留下半本可见词书。

### 6.2 查词

检索顺序为精确词形 → 词形还原和前缀 → 本地拼写模糊 → 服务端关键词 → 用户触发 AI 语义检索。英文大小写和空白归一，但专名和词义保留原文。AI 模糊检索必须返回真实 cardId 或明确“未找到，以下为生成解释”，不能伪造词典出处。

离线只搜索已下载和个人卡片，结果标明范围。AI 请求只发送必要查询和用户主动选择的上下文，不默认上传完整私人词书。

### 6.3 文本转词库与高频词

处理管线为去格式 → 分句 → 分词 → 词性标注与词形还原 → 排除配置停用词 → 计算频次 → 匹配已有卡 → 用户确认创建。保存原词形和出现位置，短语单独识别；不能把所有 token 机械小写合并。

“高频听力词”提供 corpusId、样本篇数 N、包含该词的不同文本篇数 df、tokenCount、词频与更新日期。再出现率首版定义为样本内文档频率 df/N，明确是所选语料的统计，不是下一次考试出现概率。展示样本不足标签；实际预测必须另行建模并验证。

### 6.4 MCP 扩展定位

文本统计首先是本产品内部服务 CorpusAnalysisService，无需为了统计而强制引入 MCP。P3 可提供 MCP 适配器，暴露 analyze_corpus、lookup_card、create_draft_book 三种受限工具。读工具只读用户获权语料；写工具先生成草稿，需用户确认发布。认证绑定用户与 scope，记录请求审计、配额及幂等键，不允许工具执行任意 SQL、脚本或读取服务端文件。

## 7 听力模块完整设计

### 7.1 内容与对齐

内容由 Article、MediaAsset、TranscriptSegment、ListeningSession 构成。文本和音频可分别导入，也可成对上传；音频是否包含文本中的段落必须校验。媒体记录 durationMs、mimeType、sizeBytes、checksum、license、ownerId。时间轴片段包含 startMs、endMs、text、translation、alignmentSource、confidence。

状态为 uploaded → validating → transcribing → aligning → ready 或 needsReview、failed。纯文本可在线 TTS 生成音频；只有音频可转写；二者俱全优先强制对齐。对齐结果可人工调整，未对齐内容仍可整段播放，但不能伪装成精准逐句循环。

P0 上传 MP3/M4A/WAV，单文件最多一百 MB、六十分钟；服务端检查实际 MIME、时长与解码，不信任扩展名。对外部 URL 不任意抓取内网地址，不把付费受限文章自动复制进公共库。

### 7.2 播放与练习

提供正常播放、盲听、精听、关键词听写、跟读五种模式。播放支持 0.5 至 2.0 倍速、前后五秒、AB 循环、按句循环、循环次数、句间间隔和断点续听。变速尽量保持音高，硬件能力不支持时明确降级。

用户选原文区间后，将字符范围映射到已有 segment 的时间边界；无词级时间戳时只能按句循环。重复字段可检索全部出现位置并选择某次出现，不把多处文本误拼成一个连续音频区间。

显示策略为原文/译文分别开关、先盲听后揭示、点击单词弹查词和已有卡入口。选句添加句卡、选词收藏、标为个人高频候选均不打断播放；保存上下文与来源。词汇频次统计不能被个人点击次数污染。

### 7.3 跟读与反馈

录音需要即时授权并有明显指示，默认练后删除；用户主动保存才上传。反馈分转写匹配、遗漏、节奏建议，不把通用语音识别结果当作精确发音测评。P0 不实现发音分数，P1 接入经验证的供应商能力后独立展示局限。

### 7.4 离线听力与验收

下载包包含音频、文本、译文、时间轴、许可摘要和 manifest。缺音频时可读文本；缺译文时显示待生成；不允许后台自动消耗移动网络补齐大型文件。飞行模式能循环已下载片段、收藏句子、恢复播放并保存进度。音频被清理后提示重新下载，不把任务标记为完成。

## 8 房间与英语输出

### 8.1 单人 AI 房 P1

用户选择主题、角色、难度、文字或语音、纠错频率和时长。主题包含旅行问路、面试、学术讨论、日常沟通；每轮最多指出三项值得改进的表达，用户可一键转成句卡。语音链路为授权录音 → ASR → 对话 → TTS，支持用户打断、文字降级、结束后总结。

AI 角色提示词分平台约束、主题模板、用户偏好三层，用户自定义不能覆盖权限、隐私或费用限制。提示词版本化；会话历史默认私有，可删除，不在后台拿去发布社区。

### 8.2 真人与主题房 P2

房间字段为 title、topic、languageLevelHint、visibility、capacity、hostId、scheduledAt、rules、recordingPolicy。首版最多八人同时连麦、五十在线旁听作为容量基线；超额扩容必须压测后调整。主持人可管理排麦、静音、移出，用户可拉黑、举报并退出。

媒体使用 WebRTC + SFU + TURN；信令与文字消息通过 WebSocket，业务服务签发短时房间令牌。服务端鉴权决定发布与订阅权限，不能只在前端隐藏按钮。断线保留席位三十秒，超时回收；重连取最新成员状态。默认不录音，任何录音功能都须入场前清晰说明并取得参与者同意。

### 8.3 游戏房 P3

剧本杀采用房间状态机 waiting → assigning → playing → voting → finished；角色私密信息只能发给对应成员。AI 角色占明确席位并标明身份。提供短时合作解谜与角色扮演优先，复杂长剧本后置。内容、语音和推理成本按房间配额限制，防止无限循环调用。

## 9 效率工具与宠物

### 9.1 工具边界

番茄钟支持工作/休息时长、暂停与恢复，用 endAt + 累计暂停时长恢复计时，不能依赖后台每秒回调。安排只提供学习任务与日历视图，不建设通用项目管理系统。灵感支持快速文本、标签、转卡片。冥想和睡前内容仅提供放松音频及关闭提醒，不提供医疗诊断或睡眠疗效承诺。

### 9.2 提醒

提醒记录用户时区、安静时段、提醒渠道、最近发送时间与去重键。默认每日一条学习提醒，可主动关闭；考试倒计时单独订阅。设备时区变化、夏令时与重启后重算下一次提醒。Android 后台调度遵循系统能力，界面不得保证精确到秒；关闭通知权限后显示应用内替代提醒。

### 9.3 宠物 UI

P1 先实现应用内宠物，状态 idle、learning、celebrating、resting、reminding。宠物提示由事件驱动并限频，不阻挡答案，不用羞辱或失去宠物惩罚未学习用户。昵称、专属对话、动作皮肤保存在 PetProfile；用户能关闭动画、声音和 AI。

Android 跨应用悬浮宠物为 P3 可选能力，需要专门的系统授权与对应平台评估，拒绝后仍可完整学习。Web 不承诺跨应用系统悬浮窗，以页内组件和可支持的通知替代。自定义动作只使用声明式动画与已审核资源，不执行用户脚本。

## 10 社区 增长与文化

### 10.1 分类与信息质量

P2 先做邀请制：考试日历、留学、考研保研、有效经验、技术 API、学习问答、日常分享、游戏、影视音乐。少儿独立专区不进入首期。每帖包含 category、tags、body、sourceLinks、experienceDate、isSponsored、visibility、moderationStatus；涉及政策和截止日期的信息必须标注来源与更新时间。

经验帖区分亲历、转述、待验证；“有用”评价按是否有具体步骤、来源、适用条件组织，不能把付费点赞当作真实性。定时帖到期自动提示需更新或归档，不自动改写报名规则。

### 10.2 推荐

首版使用可解释规则：订阅主题匹配、内容新鲜度、经去重的有用反馈、审核质量、用户屏蔽。对重复、广告、来源过期降权；不使用单纯停留时长最大化。推荐原因可见，提供按时间排序和关闭个性化选项。学习数据用于社区推荐须独立选择，私人错题不自动公开。

### 10.3 文化与增长

建立可选昵称、宠物形象、学习徽章、每周主题和公开感谢名单。“XX 大人”等称呼可作为自选风格，不能默认制造等级歧视。身份等级与贡献值分开：学习等级表示个人历程，贡献值表示经过反馈的社区贡献；付费不提高内容可信度。

以可导出的学习报告、授权名著节选、主题挑战和可分享的成果卡促进传播；分享前预览隐藏个人信息。把原设想的“暗中引导”改为透明的学习价值建议与用户自主目标，不通过羞辱、信息焦虑或隐蔽操控留存。

### 10.4 激励

点赞和免费投币每日限额由运营配置，服务端账本核验，不因客户端改时钟增加。币不能兑现或私下交易，首期不设置付费币。刷分识别结合频率、重复关系和设备信号，申诉后可恢复；不在无审核情况下永久封禁。

## 11 数据部署与离线策略

### 11.1 数据位置

服务端保存完整公共词库、版权元数据、账号、增量学习事件、媒体主文件、AI 任务与公共社区数据。客户端保存已选词书及当前/近期任务卡片、音频离线包、个人笔记、学习状态快照和 outbox。游客数据在绑定前仅本地。用户记录可导出，学习连续性不能成为阻止迁移的壁垒。

UI 读取本地学习仓库；在线更新先写本地再通知界面。大部分总量在服务端，并不意味着每次翻卡都联网。Android 官方 offline-first 指南同样采用本地与网络数据源及持久写入队列，参考见文末。

### 11.2 三种网络策略

|策略|前台学习|网络行为|恢复联网|
|---|---|---|---|
|online|本地优先|允许同步与显式 AI 请求|自动同步|
|wifi_only|本地优先|仅已确认 Wi-Fi 时传输，Web 无法可靠确认时按禁止自动传输处理|显示可手动同步按钮|
|manual_offline|只用本地|取消进行中可取消请求，禁止新 API、AI、分析与媒体预取|必须用户主动退出离线策略|

手动离线不是仅把按钮置灰：所有 Repository 的远端通道必须经过 NetworkPolicyGate。联网检测不等于后端可达。离线模式提示未同步条数和本地备份入口；退出账号先处理未同步数据，不静默清除。

### 11.3 下载包与缓存

OfflineManifest 包含 packageId、bookVersion、cardVersionMap、mediaHashes、totalBytes、licenseExpiresAt、minimumSchemaVersion。先下载临时区，逐项校验 hash 后原子激活；失败保留旧版本。升级数据库须可恢复，不能先删旧包。

学习事件、未同步笔记和个人原始导入文件不能按 LRU 自动清理；已同步缓存和可重新下载媒体可清理。Web 存储受浏览器配额和回收影响，用户须能查看本地保存状态、申请持久存储并导出备份，不能承诺永不丢失。授权到期资源明确停止新下载，已下载内容的使用按许可规定执行。

## 12 跨端同步与冲突

### 12.1 事件与版本

每个事件携带 eventId UUID、deviceId、deviceSequence、profileId、eventType、occurredAt、baseEntityVersion、payloadVersion、payload。服务端生成 receivedAt 和单调递增 userSequence，所有权从访问令牌解析，不信任客户端 userId。用户变更与 outbox 记录必须在同一本地数据库事务中完成。

push 每批最多一百事件，返回逐项 accepted、duplicate、conflict、rejected 及错误码；同批允许部分成功。仅 accepted 或 duplicate 可从 outbox 标为已确认。网络错误按带抖动指数退避重试，认证错误暂停，结构错误进入待处理队列。

pull 使用不透明 cursor 返回变化和 tombstone。cursor 超期返回 SYNC_CURSOR_EXPIRED，执行快照恢复，但先保留并上传本地 outbox。严禁全量覆盖本地未确认操作。

### 12.2 学习事件归并

同 eventId 只接收一次；相同练习在两个设备独立完成是两个事件，不能靠 cardId 去重。服务端按 receivedAt、userSequence 的确定顺序归并；用于算法的 effectiveReviewedAt = max(previousEffectiveAt + 1ms, clamp(occurredAt, receivedAt - 90 days, receivedAt + 5 minutes))，原时间完整保留。超过窗口的历史导入必须走专门导入接口，不混为实时事件。

这会让跨设备离线并发的调度在同步后与本地暂算不同，UI 显示“复习计划已合并”；服务端重放得出的 ReviewState 为最终状态。所有跨端实现须使用相同排序、边界与测试向量。学习时长与日历记录保留原本时间并标注异常，不因调度钳制悄悄改写历史。

### 12.3 其他冲突

个人卡片按 entityVersion 乐观并发；两端编辑相同字段返回冲突副本，由用户选择或合并，不能静默最后写入覆盖。不同字段可由服务端合并并生成新版本。布局使用独立平台版本，同平台冲突采用服务器接收顺序，保留上一版可恢复。

收藏成员使用有版本的 membershipId 与 tombstone，按服务端顺序应用 add/remove；重新添加创建新 membershipId。移除与添加冲突时返回最终版本给客户端。删除卡片创建 tombstone，三十天内可恢复，具体保留期可配置；彻底删除按账号删除任务处理，不能被旧设备同步复活。

## 13 技术架构与代码目录

### 13.1 默认实现方案

为减少 Web 与 Android 的业务逻辑分叉，默认采用 TypeScript 单仓：Web 使用 React PWA，Android 使用同一 Web 客户端经 Capacitor 容器与受控原生插件封装，服务端使用 NestJS 模块化单体。数据库 PostgreSQL，对象存储兼容 S3，异步任务使用持久化队列。Redis 可用于队列与短期缓存，不保存唯一学习记录。版本号在开工日依据官方支持范围确定并写入 lockfile，本企划不绑定“最新版本”。

该方案是开发基线，不是已完成的兼容性结论。立项技术验证必须覆盖 WebView 音频、原生持久存储、后台同步、麦克风、文件导入和通知；若关键项失败，Android 改为 Kotlin + Compose + Room + WorkManager，保持 HTTP 契约和调度测试向量相同。此时不再追求界面代码复用，禁止半途维护两套无清晰边界的 Android UI。

### 13.2 结构

```text
apps/
  web/src/{app,pages,widgets,features,platform}
  android/                     # 原生宿主与插件
  api/src/modules/
    auth profiles assessment catalog cards lists learning
    sync import media listening ai focus pet rooms community
    moderation billing admin
packages/
  contracts/                   # OpenAPI 与运行时校验 schema
  domain/                      # 纯业务类型与用例
  scheduler/                   # 版本锁定与确定性调度适配器
  data-local/                  # Repository 与事务接口
  sync-engine/                 # outbox 与冲突处理
  ui/                          # tokens 与通用组件
  adapters/                    # 网络 存储 音频 时钟 平台差异
  test-vectors/                # 调度 同步 归一化测试数据
docs/{product,architecture,adr,functions,ui,operations}
infra/{migrations,compose,deploy,monitoring}
```

UI → use case → domain/repository interface → local/network adapter。组件不直接写 SQL、不直接调用 AI、不持有服务端密钥。服务端 Controller 只负责认证上下文、校验、调用与响应映射；Service 承担业务事务；Repository 负责数据访问。跨模块不直接访问对方私有表。

### 13.3 平台适配器

LocalStore、AudioPlayer、Recorder、FilePicker、NotificationScheduler、NetworkPolicyGate、SecureCredentialStore、BackgroundTaskRunner、Clock、IdGenerator 均通过接口注入。Web 与 Android 分别实现，业务函数不得读取 window、Android 原生对象或系统当前时间。

Web Service Worker 只处理静态资源与缓存策略；不得缓存带身份响应到共享缓存。后台同步能力不足时在应用启动、回到前台和手动点击时执行同步。Android 使用经验证的原生持久任务实现，不依赖 WebView 永久驻留。

## 14 数据库字典与约束

通用约定：主键 UUID；外键建索引；用户私有表包含 owner_id 并在所有查询中强制授权；可变资源包含 version bigint；软删除包含 deleted_at；金额用最小货币单位整数，禁止浮点金额；时区用 IANA 标识。

|表|关键字段|约束或索引|
|---|---|---|
|users|id status created_at deleted_at|账号状态服务端判定|
|profiles|id user_id nickname timezone ui_mode network_policy|user_id 唯一；游客本地另存|
|goals|id owner_id goal_type target_date daily_minutes config|每日时长 5 至 240 分钟|
|assessment_sessions|id owner_id version status started_at report|按 owner_id 与 created_at 索引|
|assessment_answers|session_id question_id response correctness duration_ms|session_id + question_id 唯一|
|questions|id family_id dimension band content license version status|审核通过后才能抽题|
|cards|id owner_id kind text normalized_text content source_type version|公共与个人卡授权分开|
|card_senses|id card_id part_of_speech translations explanations|card_id + local_order 唯一|
|card_links|id owner_id from_card_id to_card_id relation_type sense_id|同范围端点关系唯一，无自环|
|user_card_overrides|owner_id card_id fields version|owner_id + card_id 唯一|
|books|id owner_id title version license visibility status|只有 published 可订阅|
|book_cards|book_id card_id position|book_id + card_id 唯一|
|study_plans|id owner_id goal_id book_ids status|定义普通 List 去重范围|
|task_lists|id owner_id plan_id kind list_type title version|kind word 或 sentence|
|list_memberships|id list_id card_id position added_at removed_at|活跃 list_id + card_id 唯一|
|learning_items|id owner_id card_id skill enabled|owner_id + card_id + skill 唯一|
|review_events|id owner_id learning_item_id rating occurred_at effective_at device_id device_sequence|id 去重；owner_id + device_id + device_sequence 唯一|
|review_states|learning_item_id scheduler_version parameters_version due_at state stability difficulty revision|按 owner_id + due_at 索引；状态可由事件重建|
|sync_events|owner_id user_sequence event_id payload received_at|owner_id + user_sequence 唯一|
|idempotency_records|owner_id route key request_hash result expires_at|owner_id + route + key 唯一|
|import_jobs|id owner_id kind status counts error_asset_id|row 结果另表唯一 job_id + row_number|
|media_assets|id owner_id hash object_key mime size duration status license|对象不能仅凭 key 公开访问|
|articles|id owner_id title text source license version|默认私有|
|transcript_segments|id article_id media_id start_ms end_ms text translation|0 ≤ start < end ≤ duration|
|listening_sessions|id owner_id article_id position_ms mode completed_at|position 在合法时长内|
|generation_jobs|id owner_id kind target_id content_hash status quota_reservation|去重键 owner_id + kind + target_id + content_hash|
|ui_layouts|owner_id platform schema_version config version|owner_id + platform 唯一|
|focus_sessions|id owner_id state started_at end_at paused_ms|完成事件幂等|
|reminders|id owner_id timezone quiet_hours channel next_fire_at enabled|发送记录有唯一 dedupe_key|
|pet_profiles|owner_id pet_id nickname prompt_config assets version|用户提示词长度与资源校验|
|rooms room_members|room 配置；member 角色与状态|只有成员获得房间令牌|
|posts comments reactions|owner_id 分类 内容 status 版本|反应 owner_id + target_id + kind 唯一|
|reports moderation_actions|target reason evidence status reviewer audit|管理动作不可被普通用户修改|
|wallet_entries|owner_id kind delta source_id created_at|source_id 唯一；余额由账本计算|
|billing_orders|owner_id provider amount currency status external_id|provider + external_id 唯一|
|audit_logs|actor action target trace_id redacted_metadata|日志脱敏，权限最小化|

本地数据库另有 outbox、inbox_cursor、offline_packages、media_cache、local_profiles。Card.content 与 config 等 JSON 字段必须有版本化 schema，不能作为无约束杂物桶。ReviewEvent 追加不更新，撤销和纠错单独事件化。

## 15 API 统一协议与端点

### 15.1 通用契约

路径前缀 /api/v1。JSON 字段 camelCase；分页使用 cursor 与 limit，默认二十、最大一百。认证使用短期访问凭据与可撤销刷新会话：Web 优先 HttpOnly Secure SameSite Cookie 并防 CSRF，Android 刷新凭据放系统安全存储；具体策略由 ADR 固定。CORS 只开放指定来源。客户端不得把模型 API 密钥或对象存储长期密钥打包进安装包。

成功体为 { data, meta: { requestId, serverTime, nextCursor? } }；失败体为 { error: { code, messageKey, details?, retryable }, meta: { requestId, serverTime } }。details 不返回堆栈和敏感输入。HTTP 状态：400 语法错误、401 未认证、403 无权限、404 不存在或不可见、409 版本/幂等冲突、422 业务校验失败、429 超配额、503 暂不可用。

所有创建与扣费端点要求 Idempotency-Key；相同键与相同请求体返回第一次结果，相同键不同请求体返回 409。幂等记录默认保留七天，学习 eventId 去重长期保留直到账号数据删除。更新资源携带 If-Match entityVersion，冲突返回最新版本与字段冲突信息。批量上限与字段长度在 schema 中强制。

### 15.2 端点目录

表中的“写”均需认证与资源授权；游客对应操作走本地 Repository，绑定后同步。GET 不产生扣费 AI 生成。

|方法与路径|输入或返回重点|阶段|
|---|---|---|
|POST /auth/sessions|登录凭据交换与设备会话|P0|
|POST /auth/refresh|轮换刷新凭据|P0|
|DELETE /auth/sessions/{id}|撤销指定会话|P0|
|GET PATCH /me/profile|目标 时区 模式 网络策略 版本|P0|
|GET POST /me/goals|目标计划；新增幂等|P0|
|POST /assessments|测试类型与题库版本，返回 sessionId|P0|
|GET /assessments/{id}/next|未回答题目，不含正确答案|P0|
|POST /assessments/{id}/answers|questionId answer durationMs eventId|P0|
|POST /assessments/{id}/finish|报告与缺测说明|P0|
|GET /books|目标标签、难度、分页|P0|
|GET /books/{id}/cards|词书版本与卡片分页|P0|
|POST /books/{id}/download-manifests|按获权版本创建下载 manifest|P0|
|GET POST /cards|查询或新增私有卡|P0|
|GET PATCH DELETE /cards/{id}|授权检查；更新版本；软删除|P0|
|POST DELETE /cards/{id}/links/{targetId}|关联类型与范围|P0|
|GET /search/cards|query scope kind cursor|P0|
|POST /search/semantic|语义查询，显式消耗 AI 配额|P1|
|GET POST /lists|kind listType planId cardIds|P0|
|PATCH /lists/{id}|标题 顺序 版本|P0|
|POST /lists/{id}/memberships|cardId，检测规则范围重复|P0|
|DELETE /lists/{id}/memberships/{membershipId}|仅移除成员|P0|
|GET /learning/queue|日期 预算技能；返回待学项目|P0|
|POST /learning/review-events|eventId itemId rating timestamps version|P0|
|GET /learning/history|日期范围，支持分页|P0|
|POST /learning/review-events/{id}/undo|补偿事件与原因|P0|
|POST /sync/push|events 最多一百，逐项 ack|P0|
|GET /sync/pull|cursor limit 返回增量|P0|
|GET /sync/snapshot|快照版本与继续 cursor|P0|
|POST /imports|文件引用、映射、目标类型|P0|
|GET /imports/{id}|状态 预览 错误行|P0|
|POST /imports/{id}/commit|确认预览版本|P0|
|POST /imports/{id}/cancel|幂等取消，不回滚已发布用户修改|P0|
|POST /media/uploads|用途 MIME 大小 hash 返回短时上传地址|P0|
|POST /media/{id}/complete|校验并排队处理|P0|
|GET POST /articles|个人文本与授权内容|P0|
|GET /articles/{id}/segments|可用时间轴与版本|P0|
|POST /articles/{id}/alignment-jobs|ASR/对齐任务|P1|
|POST /listening/sessions|创建练习|P0|
|PATCH /listening/sessions/{id}|位置 模式 完成事件|P0|
|POST /ai/generation-jobs|kind targetId targetLanguage contentHash|P1|
|GET /ai/generation-jobs/{id}|结果与费用配额摘要|P1|
|POST /ai/generation-jobs/{id}/cancel|尽力取消与状态|P1|
|POST /corpora/analysis-jobs|语料范围、统计规则版本|P1|
|GET PATCH /me/layouts/{platform}|组件布局与版本|P0|
|GET POST /focus/sessions|专注会话|P1|
|GET POST /reminders|时区 安静时段 渠道|P1|
|GET PATCH /me/pet|外观、提示词、动作白名单|P1|
|POST /conversations|AI 单人房设置|P1|
|POST /conversations/{id}/turns|文本或媒体引用，费用配额|P1|
|GET POST /rooms|筛选或创建房间|P2|
|POST /rooms/{id}/join|短时信令与媒体令牌|P2|
|POST /rooms/{id}/moderation-actions|主持人操作，服务端判权|P2|
|GET POST /posts|分类、订阅、草稿发布|P2|
|POST /posts/{id}/comments|内容与回复引用|P2|
|POST /reactions|目标与类型，账本限额|P2|
|POST /reports|目标 原因 证据引用|P2|
|GET /admin/moderation-queue|独立管理员权限|P2|
|POST /admin/moderation-actions|操作 理由 审核记录|P2|
|POST /exports|本人数据格式与范围|P0|
|POST /me/deletion-requests|二次验证与删除任务|P0|
|POST /billing/orders|供应商 商品 货币|P3|
|POST /billing/webhooks/{provider}|签名核验，不使用用户会话|P3|

### 15.3 复习事件示例

```json
{
  "eventId": "e8c89c5f-8de5-43cd-91f5-75d8d473e203",
  "deviceId": "d7b3dc48-8afe-476c-a559-8b67f570de1a",
  "deviceSequence": 42,
  "learningItemId": "1c820061-398a-46ea-af0a-0c5c90ce176c",
  "rating": "good",
  "objectiveResult": "correct",
  "usedHint": false,
  "revealedBeforeAnswer": false,
  "responseDurationMs": 4200,
  "occurredAt": "2026-10-16T02:00:00.000Z",
  "baseStateRevision": 7,
  "schedulerVersion": "locked-at-implementation",
  "parametersVersion": "default-v1",
  "payloadVersion": 1
}
```

### 15.4 WebSocket 与任务事件

异步任务均先返回 202 与 jobId，再轮询或订阅。事件统一 { eventId, type, version, occurredAt, payload }。房间事件为 room.member_joined、room.member_left、room.role_changed、room.state_changed；任务事件为 job.progress、job.completed、job.failed。客户端按 eventId 去重并检测序号缺口，缺口从快照恢复。传输层 ping 不计用户学习活跃。

## 16 所有函数统一编写规范

### 16.1 强制规则与适用范围

所有手写函数、方法、事件处理器及回调都必须有稳定的函数 ID、统一注释和显式类型。公共业务函数额外登记在 function-registry.json，包含输入输出 schema、错误、权限、离线行为、幂等、测试和负责人。第三方库与自动生成代码不人工补注释，但必须放 generated 目录并注明生成源和版本。

业务函数统一命名 verbObject，模块导出使用具名函数，禁止默认导出。避免匿名回调：对有业务意义的回调命名；极短纯映射也写明用途，不在回调内隐藏 IO。一个函数只完成一个可描述职责，超过八十行时触发审查而非机械拆分。

读函数统一 get/list/search 前缀；写函数统一 create/update/remove/submit 前缀；转换使用 map/normalize/parse；校验使用 validate；事件处理使用 handle。remove 明确软删还是移除关联，purge 专指不可恢复删除。

### 16.2 标准注释模板

```ts
/**
 * @functionId LEARN-REVIEW-001
 * @summary 提交一次复习并持久保存本地事件
 * @module learning
 * @input SubmitReviewInput 受运行时 schema 校验
 * @output Promise<Result<SubmitReviewOutput, ReviewErrorCode>>
 * @permission 当前本地档案拥有此学习项目
 * @precondition 项目已揭示并完成评分 输入时区合法
 * @postcondition 本地事件 状态 outbox 同事务落盘
 * @sideEffects local-db-write outbox-write
 * @offline supported 不直接发网络请求
 * @idempotency eventId 相同输入返回既有结果 不同输入返回冲突
 * @errors VALIDATION_FAILED ITEM_NOT_FOUND EVENT_CONFLICT STORAGE_FAILED
 * @concurrency 本地事务与项目 revision 检查
 * @performance 本地提交目标 p95 小于 150ms 需在基准机实测
 * @test tests/learning/submitReview.spec.ts
 * @since 1.0.0
 */
```

所有模板字段必须填真实内容；纯函数 @sideEffects none、@offline supported、@permission none，不能删除字段。UI 组件允许返回 UI 节点或 void，纯转换允许直接返回明确类型，异步业务边界统一 Result；不强迫 React 组件返回业务 Result。

### 16.3 类型与错误格式

```ts
export type Result<T, E extends string> =
  | { ok: true; value: T }
  | { ok: false; error: { code: E; messageKey: string;
      retryable: boolean; details?: Readonly<Record<string, unknown>> } };

export interface FunctionContext {
  readonly profileId: string;
  readonly requestId: string;
  readonly signal?: AbortSignal;
}

export interface SubmitReviewInput {
  readonly eventId: string;
  readonly learningItemId: string;
  readonly rating: "again" | "hard" | "good" | "easy";
  readonly occurredAt: string;
  readonly baseStateRevision: number;
}

export type ReviewErrorCode = "VALIDATION_FAILED" | "ITEM_NOT_FOUND"
  | "EVENT_CONFLICT" | "STATE_CONFLICT" | "STORAGE_FAILED";

export interface SubmitReviewOutput {
  readonly eventId: string;
  readonly localStateRevision: number;
  readonly dueAt: string;
  readonly syncStatus: "pending" | "confirmed";
}

// 实现签名示例 依赖由工厂注入 实现前须补齐上方完整注释
export interface LearningService {
  submitReview(
    context: FunctionContext,
    input: SubmitReviewInput
  ): Promise<Result<SubmitReviewOutput, ReviewErrorCode>>;
}
```

预期业务失败使用 Result；底层异常在边界转换并记录脱敏 traceId，禁止 catch 后返回假成功。网络请求必须有超时和取消信号；重试只在幂等操作或有幂等键时启用。输入类型不能替代运行时校验。禁止 any、隐藏全局状态、未经封装的 Date.now/Math.random 和在客户端硬编码密钥。

### 16.4 函数目录与首批 ID

|函数 ID|模块与函数|关键职责|
|---|---|---|
|PROFILE-MODE-001|profile.updateUiMode|切换模式并保持会话|
|PROFILE-GOAL-001|profile.createGoal|创建目标与初始预算|
|ASSESS-NEXT-001|assessment.getNextQuestion|按版本规则选下一题|
|ASSESS-SCORE-001|assessment.calculateProfile|计算各维度分数与可信度|
|CARD-CREATE-001|cards.createCard|校验 kind 来源与所有权|
|CARD-VALIDATE-001|cards.validateCardInput|结构阻断与质量提示分开|
|CARD-LINK-001|cards.createCardLink|权限、自环与重复检查|
|LIST-CREATE-001|lists.createTaskList|数量、类型与计划内去重|
|LIST-REMOVE-001|lists.removeMembership|仅移除列表关系|
|LEARN-QUEUE-001|learning.getDailyQueue|到期优先与预算分配|
|LEARN-REVIEW-001|learning.submitReview|事务提交事件 状态 outbox|
|LEARN-SCHEDULE-001|scheduler.calculateNextState|固定版本纯调度函数|
|LEARN-UNDO-001|learning.createReviewUndo|验证依赖并生成补偿事件|
|SYNC-PUSH-001|sync.pushPendingEvents|逐项确认与安全重试|
|SYNC-PULL-001|sync.pullRemoteChanges|cursor 与 tombstone 应用|
|SYNC-MERGE-001|sync.mergeReviewEvents|确定性事件归并|
|NETWORK-GATE-001|network.validateNetworkPermission|手动离线与网络策略统一门禁|
|IMPORT-PARSE-001|imports.parseBookRows|解析 映射 错误行与限制|
|IMPORT-COMMIT-001|imports.commitImport|幂等分批提交与发布|
|SEARCH-LOOKUP-001|search.searchCards|范围明确的分层检索|
|CORPUS-COUNT-001|corpus.calculateFrequencies|语料范围与词形统计|
|MEDIA-PACKAGE-001|media.activateOfflinePackage|hash 校验与原子切换|
|LISTEN-LOOP-001|listening.resolveLoopRange|字符范围映射时间轴|
|LISTEN-CARD-001|listening.createCardFromSelection|授权来源与上下文保存|
|AI-JOB-001|ai.createGenerationJob|预算预占与内容 hash 去重|
|AI-APPLY-001|ai.applyGenerationResult|拒绝覆盖用户编辑与过期内容|
|FOCUS-RESTORE-001|focus.restoreTimer|基于时刻恢复计时|
|PET-EVENT-001|pet.handleLearningEvent|白名单动作与提醒限频|
|ROOM-JOIN-001|rooms.createJoinToken|成员权限定向签发|
|COMMUNITY-RANK-001|community.rankPosts|规则排序与屏蔽|
|MODERATION-ACT-001|moderation.createAction|角色判权与审计|
|BILLING-CALLBACK-001|billing.handleProviderCallback|签名 订单金额 幂等状态迁移|
|EXPORT-DATA-001|privacy.createUserExport|本人数据导出与下载过期|
|PRIVACY-DELETE-001|privacy.createDeletionJob|撤销会话与分层删除|

此目录定义稳定业务边界，不声称穷尽未来实现的所有辅助函数。任何新增辅助函数必须按同一模板填写 ID，并由 CI 检查；代码生成代理不得以“目录未列出”为由跳过规范。

### 16.5 统一 UI 规格

每个页面和组件登记 uiId、route、purpose、dataSources、actions、states、permissions、responsiveRules、accessibility、testIds。状态至少覆盖 loading、empty、ready、error、offline、permissionDenied 中适用项。每个交互必须对应 use case 或明确的本地展示状态，不允许悬空按钮。

色彩、字号、间距、圆角、层级、动效均使用 tokens；正文支持系统字体放大和 reduced-motion。核心按钮触摸区域目标不小于 44 CSS px；Android 原生部分按平台可访问性规范复核。卡片不能只用颜色区分正确错误，音频按钮有可访问名称。

## 17 页面清单与关键交互

|uiId 与路由|内容与动作|必要异常态|
|---|---|---|
|UI-ONBOARD /onboarding|目标 测评或跳过 词书预览|离线无法拉题时可跳过|
|UI-ASSESS /assessment/:id|单题 时间 退出 恢复|音频失败补题 不计错|
|UI-TODAY /today|今日预算 待复习 新学 同步|零新增仍能复习|
|UI-REVIEW /study/:sessionId|提示 作答 揭示 评分 撤销|存储失败不推进下一题|
|UI-CARD /cards/:id|完整卡 关联 笔记 收藏|不可见卡用无权限或不存在|
|UI-BOOKS /books|词书列表 下载 导入|授权过期 下载不完整|
|UI-LIST /lists/:id|卡面清单 排序 移除|混合类型拒绝并解释|
|UI-IMPORT /imports/:id|映射 去重预览 错误行 提交|单行失败可定位|
|UI-LISTEN /listen/:articleId|播放器 时间轴 查词 制卡|无时间轴按整段播放|
|UI-HISTORY /history|复习单 日期筛选 导出|无记录不显示虚构曲线|
|UI-LAYOUT /settings/layout|模式与组件排序预览|旧组件不支持时安全隐藏|
|UI-OFFLINE /settings/offline|包大小 待同步 缓存清理|不能清理唯一未同步数据|
|UI-PET /pet|外观 昵称 提醒 提示词|拒绝权限可应用内使用|
|UI-AIROOM /conversations/:id|对话 录音 纠错 转卡|配额不足切文字或结束|
|UI-ROOM /rooms/:id|主题 席位 排麦 举报|重连 恶意主持人 令牌过期|
|UI-COMMUNITY /community|分类 时间或推荐 发帖|审核中 原因 申诉|
|UI-PRIVACY /settings/privacy|导出 删除 授权与会话|未同步数据二次提示|
|UI-ADMIN /admin|内容审核 举报 申诉 任务|独立角色与操作确认|

## 18 AI 网关与费用控制

AI 仅通过服务端网关访问，按任务分为 translate、explain、tts、asr、align、semantic_search、conversation、sentence_recommendation。每种任务定义结构化输入输出、模型选择配置、超时、最大输入、预算与 fallback。ProviderAdapter 支持替换供应商，不把厂商专有格式泄漏到领域模型。

创建任务先检查用户日配额与平台日预算，预占额度，完成后按实际消耗结算；失败释放未使用额度。配额是运营配置，例如文本任务每天十次仅为测试初值，不能宣传为永久权益。重试、用户取消和供应商超时都有独立结算状态，避免重复收费。

缓存键包括任务类型、输入 hash、语言、声音、模型与提示词版本；私人内容缓存必须隔离到 ownerId，不用公共缓存泄露原文。TTS 共享仅适用于授权公共词条。检索到的文章和用户提示词均当作不可信数据，不得因其文本要求而执行管理工具或泄露系统信息。

流动句子栏先从审核通过的内容池按难度、兴趣和去重规则推荐，AI 只做候选生成与解释，缺少来源时标“AI 生成”，不伪造名人名言。离线显示缓存句子；默认不自动刷新消耗配额。

## 19 安全 管理与内容权利

### 19.1 访问控制

角色为 guest、member、moderator、admin、service。后端所有资源操作验证 ownerId、visibility、角色与 scope；ID 难猜不能替代授权。媒体下载用短期签名地址，管理员访问私人学习内容须有明确目的和审计。账号登出与封禁应撤销刷新会话及房间令牌。

### 19.2 上传与输入

限制文本长度、导入行数、媒体大小和速率；检测文件真实类型与恶意内容；HTML 采用安全白名单清洗，Markdown 禁止原始脚本；任意外链、图片代理和媒体抓取要防 SSRF。SQL 只用参数化访问。客户端渲染与服务端校验并行，不能互相替代。

关键词屏蔽只是辅助，结合上下文、用户举报、人工复核和申诉；学习材料引用敏感词与针对他人的骚扰分开处理。审核流程为 pending → approved/rejected → appealed → resolved，说明理由与可申诉渠道。

### 19.3 数据生命周期

传输加密、存储加密、密钥托管、最小权限、日志脱敏与备份恢复演练作为上线条件。原始录音默认练后删除；选择保存的录音可在设置删除。AI 会话与服务日志分别设置保留期，推荐会话三十天可配置、普通技术日志十四天；法律或争议保留例外须事先说明，并经上线地区专项确认。

账号删除先撤销会话、禁止新写入，再处理主库、媒体、搜索与缓存；备份在其生命周期内自然过期或按既定流程清除，恢复备份后重放删除清单防复活。面向用户展示实际处理状态和期限，不承诺做不到的即时删除所有备份。

### 19.4 数据与代码开源

代码、词典、音频、外刊、剧本、用户内容分别记录权利；开源代码不代表附带内容可商用。每个内置资源必须有 source、license、attribution、redistributionAllowed、commercialUseAllowed 字段和审核记录。用户私人导入默认不公开，公开前再次确认授权。

本文件是产品与技术方案，不替代特定地区的法律意见。上线地区、未成年人范围、商店支付渠道、隐私与内容授权需在上线清单中逐项确认，未确认前关闭相应功能，不凭空宣称合规。

## 20 商业化与经营账目

免费核心包括本地复习、用户自己的卡片、基本词库、记录导出与离线学习。可收费部分优先为高成本 AI 配额、特定授权内容与宠物外观，不把历史记录访问作为付费门槛。目标截止日期可触发自愿打赏邀请，但不得暗示付款保证考试结果。

广告只出现在非学习主流程的明确广告位，不插入作答、听力播放或考试倒计时，不弹窗遮挡卡片；用户可举报广告，广告审核与普通内容分开。是否提供去广告方案由成本试验决定，默认不接入追踪型广告 SDK。

“流水交”按公开收支摘要理解：月度展示广告、打赏、订阅收入和云服务、AI、内容、运营支出，公布统计口径，不公开用户订单或供应商敏感合同。实际支付以签名回调核验订单、商品、币种、金额和状态，绝不靠客户端“支付成功”页面记账。

|经营指标|计算口径|决策用途|
|---|---|---|
|单活跃用户变动成本|AI 媒体 CDN 消息等变动费用 / 活跃用户|确定免费配额|
|单次有效 AI 学习成本|任务实际费用 / 用户采纳且未报错的任务数|选择任务与供应商|
|贡献毛利|净收入减变动成本|判断功能可持续性|
|留存与满意度|分组周留存 学习效果 举报率|约束广告与促销强度|

商业壁垒来自连续的个人学习服务、可靠内容、习惯与可选宠物体验；用户可迁移数据，账号等级不构成无法退出的锁定。

## 21 运维 性能与可观测性

P0 使用模块化单体 API + worker + PostgreSQL + 对象存储部署，按任务分开伸缩；不在未验证负载前拆微服务。开发、测试、生产分环境，所有 schema 迁移有版本；破坏性迁移采用 expand → migrate → contract，并保留旧客户端兼容窗口。

性能目标需在固定基准验证：Android 四 GB RAM 中端设备、Web 主流移动浏览器、已下载一万卡、单账号十万复习事件；本地查词 p95 小于三百 ms，评分本地提交 p95 小于一百五十 ms，缓存翻卡 p95 小于一百 ms。API 常规读请求 p95 小于五百 ms 不含网络传输与大型媒体，初期以一百并发学习用户压测；这些是验收目标而非已达成指标。

服务可用性初始目标月度 99.5%；学习服务故障仍允许离线。备份目标 RPO 二十四小时、RTO 八小时，需演练证明；若业务规模提升再升级。禁止只写有备份却不做恢复验证。

日志贯通 requestId、eventId、jobId、匿名化 actorId；监控错误率、同步积压、拒绝事件、数据库事务延迟、生成任务耗时、费用预算、媒体失败、房间连接质量。异常费用自动停止新 AI 任务但保留卡片学习。任何日志不记录密钥、完整私人原文或原始音频。

## 22 测试与验收矩阵

|编号|场景|通过标准|
|---|---|---|
|AT-01|清爽和完整模式切换|会话、进度、草稿不丢失，学习状态相同|
|AT-02|测评跳过与缺测|允许开始学习，报告不伪造缺测维度|
|AT-03|测评连续对错|上下降 band 与停止规则符合版本配置|
|AT-04|卡片语言与生成失败|英文转中文、中文转英文正确；生成失败仍保存原文|
|AT-05|混合 List 与去重|混 kind 拒绝；普通 List 计划内去重；收藏跨 List 允许|
|AT-06|移除 List 卡片|原卡、其他 List、复习历史仍在|
|AT-07|作答后强杀重启|已提交事件仅一次，恢复状态无跳题|
|AT-08|调度一致性|Web、Android、服务端对固定向量输出相同|
|AT-09|手动离线|仪器记录所有远端出口均无新请求，已有内容可练习|
|AT-10|离线一百次作答后联网|逐项确认，最终事件数不重不漏|
|AT-11|两端并发复习与重复上传|独立练习保留，重传去重，最终状态确定|
|AT-12|两端修改相同笔记|产生可恢复冲突副本，不静默覆盖|
|AT-13|快照恢复和删除复活|outbox 保留，tombstone 生效，旧端不复活删卡|
|AT-14|损坏下载包|hash 拒绝激活，旧包可继续用|
|AT-15|浏览器缓存回收|提示可重下范围，未声称数据已永久保存|
|AT-16|听力选中重复句|选择具体出现位置，循环落在正确时间范围|
|AT-17|无音频无时间轴|允许文本阅读或整段播放，不伪造循环与完成|
|AT-18|批量导入有错误与重试|错误可定位，确认前不发布，重试不重复|
|AT-19|AI 返回时用户已编辑|旧结果不覆盖用户新内容|
|AT-20|AI 超时与预算耗尽|不重复扣费，可取消，普通学习可继续|
|AT-21|权限拒绝与后台被杀|录音/通知/悬浮拒绝后可学习，计时恢复正确|
|AT-22|跨账号越权|卡片 媒体 房间 草稿全部由后端拒绝|
|AT-23|导入恶意 HTML URL 公式|不执行脚本 不访问内网 不触发表格公式|
|AT-24|房间断线与角色变更|令牌和服务器权限实时生效，重连取最新状态|
|AT-25|举报 申诉与管理员操作|状态可追踪，非管理员不能审核，操作有审计|
|AT-26|支付伪造与重复回调|错误签名拒绝，重复回调不重复入账|
|AT-27|导出删除与恢复备份|本人导出完整，删除清单恢复后仍生效|
|AT-28|函数与 UI 规范|手写函数完整注释，注册表和实现无悬空引用|
|AT-29|时区与日界变动|dueAt 不变，日统计按明确时区正确归档|
|AT-30|无障碍与小屏|键盘可作答，读屏可识别，文字放大不遮挡关键动作|

测试层次：纯函数单测覆盖归一化、测评、调度与日期；集成测试覆盖本地事务、API 授权、导入、幂等；契约测试验证 OpenAPI；端到端覆盖关键离线恢复与真实设备音频。正常页面样式变化无需堆叠镜像实现的测试，但同步、计费、权限和数据删除必须有失败路径测试。

## 23 工作包 排期与交付物

以下按两位全职工程师、一位兼职设计/产品和独立测试支持估算，仅用于计划。内容采购、语料审核、供应商接入和商店审核独立排期。人员能力、范围与验证结果变化时重新估算。

|工作包|周期估算|依赖|可验收产物|
|---|---|---|---|
|W0 技术与内容验证|1 至 2 周|无|ADR 平台能力样机 授权资源清单|
|W1 仓库与基础设施|1 至 2 周|W0|CI 类型 schema 数据迁移 账号 本地仓库|
|W2 卡片词书与 List|2 至 3 周|W1|导入预览 卡片编辑 关联 查词|
|W3 调度与同步|3 至 4 周|W2|离线事件 测试向量 冲突恢复|
|W4 双模式测评与听力|2 至 3 周|W2 W3|可用 UI 基础测评 播放循环 制卡|
|W5 P0 加固与试用|2 至 3 周|W4|真实设备验证 安全检查 备份恢复 发布候选|
|W6 P1 AI 与个性化|4 至 6 周|P0 通过|网关 成本控制 单人房 宠物与工具|
|W7 P2 社区与房间|6 至 10 周|P1 稳定和运营就绪|SFU 审核台 举报 公开内容流程|

P0 顺序总量约 11 至 17 周；可并行部分不直接相减，预留整合缓冲。不可把此表理解为一人几周实现所有社区与语音能力的承诺。

每个工作包交付源代码、运行说明、环境变量示例、不含真实密钥的测试数据、数据库迁移、API schema、函数注册表、UI 规格、必要测试和已知问题。发布必须可回滚，数据库破坏性变更不能只靠回滚应用解决。

## 24 代码生成执行规约

### 24.1 可直接交给代码生成代理的总指令

```text
以本企划书 1.0 为产品与工程基线，优先实现 P0。
先读取 docs 和现有仓库规则，输出本轮功能 ID 及验收编号。
采用已通过 W0 验证的技术方案，不擅自新增框架和供应商。
先建立 contracts schema、领域类型、Repository 接口和本地事务。
每次仅实现一个工作包内的可运行纵向切片，不生成整站空壳冒充完成。
所有手写函数严格采用第16节注释、显式类型、稳定 functionId。
所有 UI 按第17节登记，入口必须接到真实用例并覆盖适用异常态。
客户端学习先本地提交，远端写入经 outbox 与网络门禁。
学习状态依照事件重放，禁止按最后更新时间覆盖历史。
AI 函数只经服务端网关，未接入时返回明确的不可用状态。
公共题库和词书只用附带许可的数据；测试数据清晰标为测试。
变更 API 先更新 schema 与契约测试，不手写不同版本客户端类型。
每次提交列出实现内容、运行命令、验收结果和剩余限制。
不得把 TODO、假登录、内存数组、伪支付、模拟同步当生产实现。
```

### 24.2 建议生成顺序

第一轮做游客档案 → 下载测试词包 → 一张卡离线作答 → 本地事件与状态落盘 → 重启恢复。第二轮做服务端身份与上传去重 → 拉取状态 → 两端合并。第三轮扩充词书、List、导入与历史；第四轮完成模式布局、测评和听力。每轮通过对应验收再继续，社区和真人房间不提前混入学习核心。

### 24.3 CI 门禁

format、lint、typecheck、schema validation、migration check、unit/integration、contract、critical E2E、secret scan、dependency audit 必须通过。自定义 lint 检查函数注释字段与唯一 ID；注册表中的 inputSchema/outputSchema/errorCodes/testPaths 必须存在。变更公共函数要同步 function registry；变更 UI 路由要同步 UI registry。

函数统一格式不等于已经列出所有实现细节。实现时新增的每个函数也须遵守同一约束；对于尚未发布的 P1 至 P3，先实现契约和功能开关，进入对应阶段时补齐可执行 schema 与用例，不让占位契约冒充可用服务。

## 25 风险与立项决策

|风险|处理|立项或发布门槛|
|---|---|---|
|范围过大|按 P0 至 P3 分期|学习底座未稳定前不开放社区|
|测评误导|内部维度与可信度，不冒充考试认证|题库审查与报告文案通过|
|内容成本与版权|私有导入和公共发布分开|内置内容逐项有授权依据|
|跨端离线丢失|事件 outbox 幂等 可恢复冲突|AT-07 至 AT-15 全通过|
|WebView 能力不足|W0 真机验证与原生备用方案|未通过不进入大规模 UI 开发|
|AI 花费失控|预占配额 任务上限 熔断|预算耗尽仍可背词|
|社区管理不足|邀请制 审核 举报 申诉|无管理人员不公开发帖|
|付费干扰学习|收费与核心记录访问解耦|无伪支付与学习中插屏|

默认立项选择：中文用户、英语学习；React PWA 与 Android 容器优先验证；服务端完整库与本地学习副本；固定版本 FSRS；P0 不公开社区、不开放系统悬浮宠物、不输出官方考试预测分。需要负责人最终确定的是品牌名、首发地区、预算与团队、首批获权词书、AI/语音供应商、账号登录方式、支付渠道和开源许可证。未确定项通过配置和适配器保留选择，不阻塞本地学习切片。

## 26 官方与项目参考

以下来源支持平台约束与算法接口选择，不代表对本项目学习效果或商业模式的背书。链接核验日期为 2026年10月16日；实施时复核所用版本。

1. Android Developers 离线优先架构：本地与网络数据源、持久化队列和同步设计。https://developer.android.com/topic/architecture/data-layer/offline-first
2. MDN Service Worker：安全上下文、缓存与运行生命周期。https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
3. MDN Secure Contexts：Service Worker 注册等能力要求可信上下文。https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts
4. MDN Background Fetch：浏览器后台大型下载能力存在兼容性限制，不能作为唯一下载机制。https://developer.mozilla.org/en-US/docs/Web/API/Background_Fetch_API
5. Open Spaced Repetition 官方组织与实现入口：FSRS 调度、优化和测试资源。https://github.com/open-spaced-repetition
6. ts-fsrs 官方实现说明：实现时选择固定版本并核对许可及测试向量。https://github.com/open-spaced-repetition/ts-fsrs

附带文件“函数注册表模板.json”用于公共函数登记，“代码生成任务清单.md”用于分轮派工；它们与本文件一起构成开发输入，未标注为可执行代码的片段均为契约示例。
