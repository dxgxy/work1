export type UiMode = "clean" | "complete";
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
  audioAvailable: boolean;
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
  addAssessmentAnswer: (answer: AssessmentAnswer) => void;
  resetAssessment: () => void;
  exportData: () => string;
  importData: (raw: string) => boolean;
}
