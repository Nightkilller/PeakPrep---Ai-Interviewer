import { redirect } from "next/navigation";

import VoiceInterviewer from "@/components/Agent";
import Navbar from "@/components/Navbar";
import { getSessionById } from "@/lib/actions/general.action";

import { auth, currentUser } from "@clerk/nextjs/server";

const SessionDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  const { userId } = await auth();
  const user = await currentUser();

  const sessionData = await getSessionById(id);
  if (!sessionData) redirect("/");

  const hasCoding = sessionData.codingRound === true;

  return (
    <div className="relative bg-[#f5f0e8] noise-bg grid-bg flex flex-col" style={{ overflowY: "hidden", height: "100vh" }}>
      <Navbar />

      {/* Main Content — fills all remaining space */}
      <div className={`flex-1 flex items-start justify-center relative z-10 pt-20 pb-4 ${hasCoding ? 'px-2 sm:px-4 lg:px-8' : 'px-4 sm:px-8 lg:px-16'}`}>
        <div className={`w-full ${hasCoding ? 'max-w-[1400px]' : 'max-w-6xl'}`}>
          <VoiceInterviewer
            candidateName={user?.firstName || "Candidate"}
            userId={userId || "guest"}
            sessionId={id}
            mode="interview"
            queryList={sessionData.queryList}
            setupContext={{
              targetRole: sessionData.targetRole,
              companyType: sessionData.companyType,
              interviewType: sessionData.interviewType,
              codingRound: sessionData.codingRound,
              preferredLanguage: sessionData.preferredLanguage,
              recordInterview: sessionData.recordInterview,
              difficulty: sessionData.difficulty,
              detectedSkills: sessionData.detectedSkills,
              keyTechnologies: sessionData.keyTechnologies,
              experienceLevel: sessionData.experienceLevel,
              resumeText: sessionData.resumeText,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
