export type UiMode = "clean" | "complete";
export type Result<T, E extends string> = { ok: true; value: T } | { ok: false; error: { code: E; messageKey: string; retryable: boolean; details?: Readonly<Record<string, unknown>> } };
export type NetworkPolicy = "online" | "wifi_only" | "manual_offline";
export type Rating = "again" | "hard" | "good" | "easy";
export type Skill = "meaning_recognition" | "word_recall" | "listening_recognition" | "spelling" | "sentence_listening";

export interface Card {
  id: string;
  kind: "word" | "sentence";
  text: string;
  translation: string;
  partOfSpeech?: string;
  pronunciation?: string;
  definition?: string;
  example?: string;
  exampleTranslation?: string;
  category: string;
  sourceType: "curated" | "user" | "imported";
  /** Source provenance is kept separate from the display category. */
  contentProvider: "oxford-dictionaries-api" | "ecdict" | "demo-fixture" | "user" | "imported";
  contentLicense: "licensed-api" | "MIT" | "pending-license" | "user-owned" | "imported-by-user";
  bookTags?: string[];
  openDictionarySource?: { name: string; url: string; revision: string; license: string };
  dictionarySource?: { url: string; language: string; generatedAt: string; licenseReference: string };
  audioAvailable: boolean;
  pronunciationProvider: "google-extension" | "browser-speech" | "none";
}

export interface SpeechExtensionConfig {
  enabled: boolean;
  extensionId: string;
  extensionName: string;
}

export interface LearningItem {
  id: string;
  cardId: string;
  skill: Skill;
  dueAt: string;
  state: "new" | "learning" | "review" | "suspended";
  stability: number;
  difficulty: number;
  revision: number;
  lastRating?: Rating;
  reviewCount: number;
}

export interface ReviewEvent {
  eventId: string;
  learningItemId: string;
  rating: Rating;
  occurredAt: string;
  objectiveResult?: "correct" | "incorrect";
  responseDurationMs: number;
}

export interface Profile {
  id: string;
  nickname: string;
  uiMode: UiMode;
  networkPolicy: NetworkPolicy;
  dailyMinutes: number;
  goal: string;
  timezone: string;
  onboardingComplete: boolean;
  speechExtension: SpeechExtensionConfig;
}

export interface AssessmentAnswer {
  questionId: string;
  dimension: "meaning" | "spelling" | "listening" | "reading";
  correct: boolean;
  band: number;
}

export interface AssessmentQuestion {
  id: string;
  dimension: AssessmentAnswer["dimension"];
  band: number;
  prompt: string;
  options: string[];
  answer: string;
}

export interface StoreState {
  profile: Profile | null;
  cards: Card[];
  learningItems: LearningItem[];
  reviewEvents: ReviewEvent[];
  assessmentAnswers: AssessmentAnswer[];
  outboxCount: number;
  selectedBook: string;
  initialize: () => void;
  completeOnboarding: (profile: Omit<Profile, "id" | "timezone" | "onboardingComplete">) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  submitReview: (itemId: string, rating: Rating, objectiveResult?: "correct" | "incorrect") => void;
  addCard: (card: Card) => void;
  importCards: (cards: Card[]) => void;
  updateSpeechExtension: (config: Partial<SpeechExtensionConfig>) => void;
  addAssessmentAnswer: (answer: AssessmentAnswer) => void;
  resetAssessment: () => void;
  exportData: () => string;
  importData: (raw: string) => boolean;
}
