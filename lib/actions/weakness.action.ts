"use server";

import { db } from "@/firebase/admin";

export async function getWeaknessMap(userId: string): Promise<WeaknessEntry[]> {
  const snapshot = await db.collection("sessions")
    .where("userId", "==", userId)
    .where("isCompleted", "==", true)
    .get();

  const topicMap: Record<string, { scores: number[]; failCount: number; lastSeen: string }> = {};

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const assessment = data.assessment;
    if (!assessment) return;

    // Extract weak topics from assessment
    const weakTopics: string[] = assessment.weakTopics || [];
    weakTopics.forEach((topic: string) => {
      if (!topicMap[topic]) {
        topicMap[topic] = { scores: [], failCount: 0, lastSeen: data.completedAt };
      }
      topicMap[topic].failCount += 1;
      topicMap[topic].lastSeen = data.completedAt;
    });

    // Also parse category scores for broader weakness detection
    const categoryScores = assessment.categoryScores || [];
    categoryScores.forEach((cat: any) => {
      const topic = cat.category;
      if (!topicMap[topic]) {
        topicMap[topic] = { scores: [], failCount: 0, lastSeen: data.completedAt };
      }
      topicMap[topic].scores.push(cat.score);
      if (cat.score < 60) {
        topicMap[topic].failCount += 1;
      }
      topicMap[topic].lastSeen = data.completedAt;
    });
  });

  const weaknesses: WeaknessEntry[] = Object.entries(topicMap)
    .map(([topic, data]) => ({
      topic,
      failCount: data.failCount,
      totalAttempts: Math.max(data.scores.length, data.failCount),
      avgScore: data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0,
      lastSeen: data.lastSeen,
    }))
    .filter(w => w.failCount > 0)
    .sort((a, b) => b.failCount - a.failCount);

  return weaknesses;
}

export async function generateStudyPlan(weaknesses: WeaknessEntry[]) {
  // Take top 7 weaknesses and create a 7-day plan
  const topWeaknesses = weaknesses.slice(0, 7);
  
  const resourceMap: Record<string, string> = {
    "Dynamic Programming": "Striver's DP Series on YouTube + LeetCode DP Study Plan",
    "Graphs": "William Fiset Graph Theory playlist + LeetCode Graph tag",
    "Trees": "NeetCode Tree playlist + LeetCode Top 50 Tree problems",
    "System Design": "Alex Xu's System Design Interview book + Gaurav Sen YouTube",
    "Technical Knowledge": "GeeksforGeeks topic-wise practice + InterviewBit",
    "Problem Solving": "Codeforces Div 2 A-C problems + LeetCode Daily Challenge",
    "Code Quality": "Clean Code by Robert Martin chapters 1-5 + refactor 3 old solutions",
    "Communication": "Record yourself explaining solutions + Practice STAR method",
    "Confidence": "Mock interviews on Pramp + explain solutions aloud daily",
    "Complexity Accuracy": "Big-O Cheat Sheet + analyze complexity of 10 solved problems",
    "Arrays": "LeetCode Array tag — Medium difficulty, solve 10 problems",
    "Strings": "LeetCode String tag + KMP/Rabin-Karp pattern matching",
    "Linked Lists": "NeetCode Linked List playlist + LeetCode top 20",
    "Recursion": "Aditya Verma Recursion playlist + solve 8 backtracking problems",
    "Sorting": "Visualgo.net sorting animations + implement 5 sorts from scratch",
    "Hashing": "LeetCode Hash Table tag + 2-sum variants",
    "Stack/Queue": "Monotonic stack problems on LeetCode + next greater element variants",
  };

  return topWeaknesses.map((weakness, i) => ({
    day: i + 1,
    topic: weakness.topic,
    reason: `You've struggled with ${weakness.topic} in ${weakness.failCount} out of ${weakness.totalAttempts} interviews (avg score: ${weakness.avgScore}/100)`,
    resource: resourceMap[weakness.topic] || `GeeksforGeeks ${weakness.topic} practice + YouTube tutorials`,
    practiceTarget: weakness.avgScore < 40
      ? `Revisit fundamentals — study theory for 1 hour, then solve 3 easy problems`
      : weakness.avgScore < 70
        ? `Solve 5 medium-difficulty problems on ${weakness.topic}`
        : `Solve 3 hard problems and write explanations for each solution`,
    completed: false,
  }));
}

export async function getCompletedSessionCount(userId: string): Promise<number> {
  const snapshot = await db.collection("sessions")
    .where("userId", "==", userId)
    .where("isCompleted", "==", true)
    .get();
  return snapshot.size;
}
