import type { LearningItem, Rating } from "../types";

export type SchedulerResult = { dueAt: string; state: LearningItem["state"]; stability: number; difficulty: number; scheduledDays: number };

/**
 * @functionId LEARN-SCHEDULE-001
 * @summary 使用固定版本的轻量间隔算法计算下一次复习
 * @module scheduler
 * @input LearningItem 与 Rating
 * @output SchedulerResult
 * @permission none
 * @precondition rating 为 again、hard、good、easy 之一
 * @postcondition 输出可序列化且 dueAt 为 UTC RFC3339
 * @sideEffects none
 * @offline supported
 * @idempotency 相同输入与时间得到相同输出
 * @errors INVALID_RATING
 * @concurrency 纯函数
 * @performance O(1)
 * @test tests/domain/scheduler.spec.ts
 * @since 1.0.0
 */
export function calculateNextState(item: LearningItem, rating: Rating, reviewedAt = new Date()): SchedulerResult {
  const factors: Record<Rating, number> = { again: 0.2, hard: 0.65, good: 1.35, easy: 2.1 };
  const intervals: Record<Rating, number> = { again: 0.02, hard: 0.7, good: Math.max(1, item.stability * 1.7), easy: Math.max(2, item.stability * 2.6) };
  const days = intervals[rating];
  const stability = Math.max(0.1, Math.min(365, item.stability * factors[rating] + (rating === "again" ? 0.1 : 0.8)));
  const difficulty = Math.max(1, Math.min(10, item.difficulty + (rating === "again" ? 0.7 : rating === "easy" ? -0.3 : rating === "hard" ? 0.25 : 0)));
  return { dueAt: new Date(reviewedAt.getTime() + days * 86_400_000).toISOString(), state: rating === "again" ? "learning" : "review", stability, difficulty, scheduledDays: days };
}

/** @functionId LEARN-QUEUE-001 @summary 按学习状态和到期时间排序复习队列 @module learning @input LearningItem[] @output LearningItem[] @permission none @precondition items 可为空 @postcondition 到期项优先 @sideEffects none @offline supported @idempotency deterministic @errors none @concurrency pure @performance O(n log n) @test tests/domain/scheduler.spec.ts @since 1.0.0 */
export function getDailyQueue(items: LearningItem[], now = new Date(), limit = 12): LearningItem[] {
  return [...items].filter((item) => item.state !== "suspended").sort((a, b) => {
    const overdue = (item: LearningItem) => new Date(item.dueAt).getTime() <= now.getTime() ? 0 : 1;
    return overdue(a) - overdue(b) || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  }).slice(0, limit);
}
