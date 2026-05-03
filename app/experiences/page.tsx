import { getExperiences, getUniqueCompanies } from "@/lib/actions/experience.action";
import ExperienceListClient from "./ExperienceListClient";

export const metadata = {
  title: "Interview Experiences — Real Questions from Real Students | InterviewOS",
  description: "Crowdsourced interview experiences from TCS, Infosys, Amazon, Google, and more. Real questions asked in 2025-2026 campus placements.",
};

export default async function ExperiencesPage() {
  const [experiences, companies] = await Promise.all([
    getExperiences(),
    getUniqueCompanies(),
  ]);

  return <ExperienceListClient experiences={experiences} companies={companies} />;
}
