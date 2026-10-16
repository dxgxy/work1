import type { AssessmentAnswer } from "../types";

/** @functionId ASSESS-SCORE-001 @summary 计算四维诊断分数并给出样本可信度 @module assessment @input AssessmentAnswer[] @output dimension report @permission none @precondition answer band 在 1 至 6 @postcondition 不输出考试预测分 @sideEffects none @offline supported @idempotency deterministic @errors INVALID_ANSWER @concurrency pure @performance O(n) @test tests/domain/assessment.spec.ts @since 1.0.0 */
export function calculateProfile(answers: AssessmentAnswer[]) {
  const dimensions = ["meaning", "spelling", "listening", "reading"] as const;
  return dimensions.map((dimension) => {
    const rows = answers.filter((answer) => answer.dimension === dimension);
    const score = rows.length ? Math.round((rows.reduce((sum, row) => sum + Math.max(1, Math.min(6, row.band + (row.correct ? 0.5 : -0.5))), 0) / rows.length) * 10) / 10 : null;
    const bands = new Set(rows.map((row) => row.band));
    const confidence = rows.length < 4 ? "样本不足" : rows.length < 12 || bands.size < 2 ? "低可信度" : "中可信度";
    return { dimension, score, confidence, answered: rows.length };
  });
}
