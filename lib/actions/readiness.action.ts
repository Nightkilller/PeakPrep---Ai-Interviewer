"use server";

import { db } from "@/firebase/admin";

export async function getReadinessScore(userId: string): Promise<ReadinessProfile | null> {
  const doc = await db.collection("readiness").doc(userId).get();
  if (!doc.exists) return null;
  return doc.data() as ReadinessProfile;
}

export async function updateReadinessScore(
  userId: string,
  sessionId: string,
  overallScore: number
): Promise<number> {
  const profileDoc = await db.collection("readiness").doc(userId).get();
  
  let profile: ReadinessProfile;
  
  if (!profileDoc.exists) {
    // First session ever — initialize
    const newScore = Math.round(overallScore * 10); // 75/100 → 750/1000
    profile = {
      userId,
      currentScore: newScore,
      history: [{ score: newScore, date: new Date().toISOString(), sessionId }],
      totalSessions: 1,
      streak: 1,
      lastSessionDate: new Date().toISOString(),
    };
  } else {
    const existing = profileDoc.data() as ReadinessProfile;
    
    // ELO-like calculation
    // New score = weighted average with recency bias
    const historyScores = existing.history.map(h => h.score);
    const rawNewScore = Math.round(overallScore * 10);
    
    // Weight: 40% new score, 60% running average (recency bias)
    const avgExisting = historyScores.length > 0
      ? historyScores.reduce((a, b) => a + b, 0) / historyScores.length
      : 0;
    
    let calculatedScore = Math.round(rawNewScore * 0.4 + avgExisting * 0.6);
    
    // Streak bonus: +5 per consecutive day, capped at +25
    const lastDate = new Date(existing.lastSessionDate);
    const now = new Date();
    const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
    
    let newStreak = existing.streak;
    if (diffHours < 36) {
      // Within ~1.5 days — streak continues
      newStreak = existing.streak + 1;
      const streakBonus = Math.min(newStreak * 5, 25);
      calculatedScore = Math.min(1000, calculatedScore + streakBonus);
    } else {
      newStreak = 1;
    }
    
    // Clamp to 0-1000
    calculatedScore = Math.max(0, Math.min(1000, calculatedScore));
    
    profile = {
      userId,
      currentScore: calculatedScore,
      history: [
        ...existing.history,
        { score: calculatedScore, date: new Date().toISOString(), sessionId }
      ],
      totalSessions: existing.totalSessions + 1,
      streak: newStreak,
      lastSessionDate: new Date().toISOString(),
    };
  }
  
  await db.collection("readiness").doc(userId).set(profile);
  return profile.currentScore;
}

export async function getReadinessHistory(userId: string) {
  const profile = await getReadinessScore(userId);
  if (!profile) return [];
  return profile.history;
}
