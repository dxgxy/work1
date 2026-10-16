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
  const next = { ...current, ...state };
  // ECDICT is bundled: persist only user cards plus learning progress, not duplicated dictionary text.
  if (Array.isArray(next.cards)) next.cards = next.cards.filter((card: Card): boolean => card.contentProvider !== "ecdict");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
        const knownIds = new Set(cards.map((card): string => card.id));
        const newPreloaded = preloadedCards.filter((card): boolean => !knownIds.has(card.id));
        const combinedCards = [...cards, ...newPreloaded];
        const learningItems = [...(parsed.learningItems ?? initialItems(cards))];
        const knownItems = new Set(learningItems.map((item): string => item.cardId));
        const missingCards = combinedCards.filter((card): boolean => !knownItems.has(card.id));
        learningItems.push(...initialItems(missingCards));
        const profile = parsed.profile ? { ...parsed.profile, speechExtension: parsed.profile.speechExtension ?? { enabled: false, extensionId: "", extensionName: "词伴 Google 发音助手" } } : null;
        set({ ...parsed, cards: combinedCards, profile, learningItems });
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
  addCard: (card) => { const items = [...get().cards, card]; const learningItems = [...get().learningItems, ...initialItems([card])]; persist({ cards: items, learningItems }); set({ cards: items, learningItems }); },
  importCards: (cards) => { const existing = new Set(get().cards.map(getCardKey)); const fresh = cards.filter((card) => { const key = getCardKey(card); if (existing.has(key)) return false; existing.add(key); return true; }); const nextCards = [...get().cards, ...fresh]; const nextItems = [...get().learningItems, ...initialItems(fresh)]; persist({ cards: nextCards, learningItems: nextItems }); set({ cards: nextCards, learningItems: nextItems }); },
  updateSpeechExtension: (config) => { const profile = get().profile; if (!profile) return; const speechExtension = { ...profile.speechExtension, ...config }; const next = { ...profile, speechExtension }; persist({ profile: next }); set({ profile: next }); },
  addAssessmentAnswer: (answer) => { const next = [...get().assessmentAnswers.filter((row) => row.questionId !== answer.questionId), answer]; set({ assessmentAnswers: next }); persist({ assessmentAnswers: next }); },
  resetAssessment: () => { set({ assessmentAnswers: [] }); persist({ assessmentAnswers: [] }); },
  exportData: () => JSON.stringify({ profile: get().profile, cards: get().cards, learningItems: get().learningItems, reviewEvents: get().reviewEvents, assessmentAnswers: get().assessmentAnswers }, null, 2),
  importData: (raw) => { try { const parsed = JSON.parse(raw) as Partial<StoreState>; if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.learningItems)) return false; set(parsed); persist(parsed); return true; } catch { return false; } },
}));

/** @functionId OFFLINE-REGISTER-001 @summary Register offline resources even when React mounts after window load @module offline @input none @output void @permission local browser @precondition production secure context @postcondition registration requested once page is loaded @sideEffects network @offline cached-only @idempotency browser reuses registration @errors browser registration warning @concurrency browser-managed @performance non-blocking @test output/playwright/library-smoke.json @since 1.0.0 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  /** @functionId OFFLINE-INSTALL-001 @summary Request service worker registration @module offline @input none @output void @permission local browser @precondition document loaded @postcondition registration started @sideEffects network @offline cached-only @idempotency browser-managed @errors warning @concurrency browser-managed @performance non-blocking @test output/playwright/library-smoke.json @since 1.0.0 */
  function install(): void { void navigator.serviceWorker.register("/sw.js").catch((error: unknown): void => console.warn("离线缓存注册失败", error)); }
  if (document.readyState === "complete") install();
  else window.addEventListener("load", install, { once: true });
}
