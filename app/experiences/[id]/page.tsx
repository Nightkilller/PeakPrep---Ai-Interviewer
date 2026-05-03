import { getExperienceById } from "@/lib/actions/experience.action";
import ExperienceDetailClient from "./ExperienceDetailClient";
import { RouteParams } from "@/app/types";

export async function generateMetadata({ params }: RouteParams) {
  const { id } = await params;
  const exp = await getExperienceById(id);
  if (!exp) return { title: "Experience Not Found" };
  return {
    title: `${exp.company} Interview Questions ${exp.year} — Real Experience | InterviewOS`,
    description: `Real ${exp.company} ${exp.role} interview experience from ${exp.city} ${exp.year}. ${exp.rounds?.length || 0} rounds. Difficulty: ${exp.difficulty}. Outcome: ${exp.outcome}.`,
  };
}

export default async function ExperienceDetailPage({ params }: RouteParams) {
  const { id } = await params;
  const experience = await getExperienceById(id);

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Experience Not Found</h2>
          <p className="text-[#6b6b6b]">This interview experience may have been removed.</p>
        </div>
      </div>
    );
  }

  return <ExperienceDetailClient experience={experience} />;
}
