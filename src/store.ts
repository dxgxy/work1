import { create } from "zustand";
import type { StoreState, Profile, Card, LearningItem, Rating, AssessmentAnswer } from "./types";
import { preloadedCards } from "./data/preloadedCards";
import { getCardKey } from "./domain/bookImport";
import { calculateNextState } from "./domain/scheduler";

const STORAGE_KEY = "ci-buddy-local-v1";
const deviceId = "web-local";

function newId(prefix: string) { return `${prefix}-${crypto.randomUUID()}`; }

function initialItems(cards: Card[]): LearningItem[] {
  return cards.map((card, index) => ({ id: `item-${card.id}`, cardId: card.id, skill: card.kind === "sentence" ? "sentence_listening" : "meaning_recognition", dueAt: new Date(Date.now() - (index < 3 ? 60_000 : -index * 3_600_000)).toISOString(), state: "new", stability: 1, difficulty: 5, revision: 0, reviewCount: 0 }));
}

function persist(state: Partial<StoreState>) {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }));
}

/** @functionId PROFILE-MODE-001 @summary 切换模式并保持学习会话 @module profile @input UiMode @output void @permission profile owner @precondition profile exists @postcondition mode persisted @sideEffects local-db-write @offline supported @idempotency last-write-wins @errors PROFILE_NOT_FOUND @concurrency local state update @performance O(1) @test tests/store/profile.spec.ts @since 1.0.0 */
export const useAppStore = create<StoreState>((set, get) => ({
  profile: null, cards: preloadedCards, learningItems: initialItems(preloadedCards), reviewEvents: [], assessmentAnswers: [], outboxCount: 0, selectedBook: "预加载词书",
  initialize: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<StoreState>;
        const cards = Array.isArray(parsed.cards) ? parsed.cards.map((card) => ({ ...card, contentProvider: card.contentProvider ?? (card.sourceType === "imported" ? "imported" : card.sourceType === "user" ? "user" : "demo-fixture"), contentLicense: card.contentLicense ?? (card.sourceType === "imported" ? "imported-by-user" : card.sourceType === "user" ? "user-owned" : "pending-license"), pronunciationProvider: card.pronunciationProvider ?? "google-extension" })) : preloadedCards;
        const newOxford = preloadedCards.filter((card) => card.contentProvider === "oxford-dictionaries-api" && !cards.some((saved) => saved.id === card.id));
        const learningItems = [...(parsed.learningItems ?? initialItems(cards)), ...initialItems(newOxford)];
        const profile = parsed.profile ? { ...parsed.profile, speechExtension: parsed.profile.speechExtension ?? { enabled: false, extensionId: "", extensionName: "词伴 Google 发音助手" } } : null;
        set({ ...parsed, cards: [...cards, ...newOxford], profile, learningItems });
      } catch { console.warn("本地存档无法读取，原始存档已保留，请先导出排查。"); }
    }
  },
  completeOnboarding: (profile) => {
    const next: Profile = { ...profile, id: newId("profile"), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, onboardingComplete: true };
    set({ profile: next }); persist({ profile: next });
  },
  updateProfile: (patch) => { const profile = get().profile; if (!profile) return; const next = { ...profile, ...patch }; set({ profile: next }); persist({ profile: next }); },
  submitReview: (itemId, rating, objectiveResult) => {
    const item = get().learningItems.find((entry) => entry.id === itemId); if (!item) return;
    const now = new Date(); const next = calculateNextState(item, rating, now);
    const updated = get().learningItems.map((entry) => entry.id === itemId ? { ...entry, ...next, revision: entry.revision + 1, lastRating: rating, reviewCount: entry.reviewCount + 1 } : entry);
    const event = { eventId: newId("event"), learningItemId: itemId, rating, occurredAt: now.toISOString(), objectiveResult, responseDurationMs: 0 };
    const state = { learningItems: updated, reviewEvents: [...get().reviewEvents, event], outboxCount: get().outboxCount + 1 };
    set(state); persist(state);
  },
  addCard: (card) => { const items = [...get().cards, card]; const learningItems = [...get().learningItems, ...initialItems([card])]; set({ cards: items, learningItems }); persist({ cards: items, learningItems }); },
  importCards: (cards) => { const existing = new Set(get().cards.map(getCardKey)); const fresh = cards.filter((card) => { const key = getCardKey(card); if (existing.has(key)) return false; existing.add(key); return true; }); const nextCards = [...get().cards, ...fresh]; const nextItems = [...get().learningItems, ...initialItems(fresh)]; persist({ cards: nextCards, learningItems: nextItems }); set({ cards: nextCards, learningItems: nextItems }); },
  updateSpeechExtension: (config) => { const profile = get().profile; if (!profile) return; const speechExtension = { ...profile.speechExtension, ...config }; const next = { ...profile, speechExtension }; persist({ profile: next }); set({ profile: next }); },
  addAssessmentAnswer: (answer) => { const next = [...get().assessmentAnswers.filter((row) => row.questionId !== answer.questionId), answer]; set({ assessmentAnswers: next }); persist({ assessmentAnswers: next }); },
  resetAssessment: () => { set({ assessmentAnswers: [] }); persist({ assessmentAnswers: [] }); },
  exportData: () => JSON.stringify({ profile: get().profile, cards: get().cards, learningItems: get().learningItems, reviewEvents: get().reviewEvents, assessmentAnswers: get().assessmentAnswers }, null, 2),
  importData: (raw) => { try { const parsed = JSON.parse(raw) as Partial<StoreState>; if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.learningItems)) return false; set(parsed); persist(parsed); return true; } catch { return false; } },
}));

export function registerServiceWorker() { if (import.meta.env.PROD && "serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined)); }
