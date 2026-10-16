import type { Card, AssessmentQuestion } from "../types";

export const sampleCards: Card[] = [
  { id: "card-adapt", kind: "word", text: "adapt", translation: "适应；改编", partOfSpeech: "v.", pronunciation: "/əˈdæpt/", definition: "to change something so it works in a new situation", example: "We need to adapt to a changing world.", exampleTranslation: "我们需要适应不断变化的世界。", category: "四级核心", sourceType: "curated", audioAvailable: true },
  { id: "card-sustain", kind: "word", text: "sustain", translation: "维持；支撑", partOfSpeech: "v.", pronunciation: "/səˈsteɪn/", definition: "to keep something going over time", example: "Small habits sustain long-term progress.", exampleTranslation: "小习惯支撑长期进步。", category: "四级核心", sourceType: "curated", audioAvailable: true },
  { id: "card-insight", kind: "word", text: "insight", translation: "洞察；深刻理解", partOfSpeech: "n.", pronunciation: "/ˈɪnsaɪt/", definition: "a clear understanding of a complex situation", example: "The article gave me a new insight.", exampleTranslation: "这篇文章让我有了新的洞察。", category: "雅思高频", sourceType: "curated", audioAvailable: true },
  { id: "card-reliable", kind: "word", text: "reliable", translation: "可靠的", partOfSpeech: "adj.", pronunciation: "/rɪˈlaɪəbəl/", definition: "able to be trusted to work well", example: "Choose a reliable source before sharing.", exampleTranslation: "分享前先选择可靠的来源。", category: "日常表达", sourceType: "curated", audioAvailable: true },
  { id: "card-clarify", kind: "word", text: "clarify", translation: "澄清；阐明", partOfSpeech: "v.", pronunciation: "/ˈklærəfaɪ/", definition: "to make an idea easier to understand", example: "Could you clarify the last point?", exampleTranslation: "你能澄清一下最后一点吗？", category: "四级核心", sourceType: "curated", audioAvailable: true },
  { id: "card-sentence", kind: "sentence", text: "Could you clarify the last point?", translation: "你能澄清一下最后一点吗？", category: "场景句卡", sourceType: "curated", audioAvailable: true },
  { id: "card-sentence-2", kind: "sentence", text: "Small habits sustain long-term progress.", translation: "小习惯支撑长期进步。", category: "场景句卡", sourceType: "curated", audioAvailable: true },
  { id: "card-journey", kind: "word", text: "journey", translation: "旅程；过程", partOfSpeech: "n.", pronunciation: "/ˈdʒɜːrni/", definition: "an act of travelling from one place to another", example: "Learning is a journey, not a race.", exampleTranslation: "学习是一段旅程，而不是比赛。", category: "旅行交流", sourceType: "curated", audioAvailable: true },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  { id: "q-meaning-1", dimension: "meaning", band: 2, prompt: "What does ‘reliable’ mean?", options: ["昂贵的", "可靠的", "快速的", "复杂的"], answer: "可靠的" },
  { id: "q-meaning-2", dimension: "meaning", band: 3, prompt: "‘adapt’ is closest to…", options: ["适应", "拒绝", "删除", "预测"], answer: "适应" },
  { id: "q-spelling-1", dimension: "spelling", band: 2, prompt: "拼写：澄清；阐明", options: ["clarify", "classify", "clarity", "clarified"], answer: "clarify" },
  { id: "q-spelling-2", dimension: "spelling", band: 4, prompt: "拼写：洞察；深刻理解", options: ["inside", "insight", "incite", "insightful"], answer: "insight" },
  { id: "q-listening-1", dimension: "listening", band: 3, prompt: "听到 ‘sustain’ 时，它的意思是？", options: ["维持", "替换", "测量", "分享"], answer: "维持" },
  { id: "q-listening-2", dimension: "listening", band: 5, prompt: "‘long-term progress’ 指的是？", options: ["长期进步", "即时反馈", "公开课程", "学习计划"], answer: "长期进步" },
  { id: "q-reading-1", dimension: "reading", band: 3, prompt: "Learning is a journey, not a race. 这句话强调？", options: ["速度最重要", "过程需要持续", "学习不能规划", "旅行很昂贵"], answer: "过程需要持续" },
  { id: "q-reading-2", dimension: "reading", band: 4, prompt: "A reliable source should be checked before sharing. Why?", options: ["为了增加字数", "为了减少误导", "为了隐藏链接", "为了获得积分"], answer: "为了减少误导" },
];
