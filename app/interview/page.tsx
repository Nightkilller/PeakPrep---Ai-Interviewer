"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { useUser } from "@clerk/nextjs";

const VoiceInterviewer = dynamic(() => import("@/components/Agent"), {
  ssr: false,
});

export default function InterviewPage() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center font-mono">Please sign in to start an interview.</div>;

  return (
    <div className="relative bg-[#f5f0e8] noise-bg grid-bg flex flex-col" style={{ overflowY: "hidden", height: "100vh" }}>
      <Navbar />

      {/* Main Content — fills all remaining space */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-6 relative z-10">
        <div className="w-full max-w-6xl">
          <VoiceInterviewer
            candidateName={user?.fullName || "Candidate"}
            userId={user?.id || "guest"}
            mode="generate"
            autoStart={isInterviewStarted}
          />
        </div>
      </div>
    </div>
  );
}
