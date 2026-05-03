import { getReadinessScore } from "@/lib/actions/readiness.action";
import { getWeaknessMap, generateStudyPlan, getCompletedSessionCount } from "@/lib/actions/weakness.action";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard — InterviewOS",
  description: "Your placement countdown, readiness score, and personalized study plan.",
};

import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return null; // or redirect, though middleware handles this
  }
  
  const [readiness, weaknesses, sessionCount] = await Promise.all([
    getReadinessScore(userId),
    getWeaknessMap(userId),
    getCompletedSessionCount(userId),
  ]);

  const studyPlan = weaknesses.length > 0 ? await generateStudyPlan(weaknesses) : [];

  return (
    <DashboardClient
      readiness={readiness}
      weaknesses={weaknesses}
      studyPlan={studyPlan}
      sessionCount={sessionCount}
    />
  );
}
