"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCompanyLogo } from "@/lib/utils";

interface ExperienceDetailProps {
  experience: any;
}

export default function ExperienceDetailClient({ experience }: ExperienceDetailProps) {
  const exp = experience;

  const getDifficultyColor = (d: string) => {
    if (d === "Hard") return "bg-red-100 text-red-700 border-red-200";
    if (d === "Medium") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getOutcomeColor = (o: string) => {
    if (o.toLowerCase().includes("selected")) return "bg-green-100 text-green-700 border-green-200";
    if (o.toLowerCase().includes("rejected")) return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] noise-bg grid-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        {/* Back Link */}
        <Link href="/experiences" className="inline-flex items-center gap-2 text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition mb-6">
          ← Back to all experiences
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl border border-[#e5e5e5] bg-[#fafafa] flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={getCompanyLogo(exp.company)}
                  alt={exp.company}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${exp.company}&background=16a34a&color=fff&rounded=true&bold=true`;
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1a1a1a]">{exp.company}</h1>
                <p className="text-[#6b6b6b] mt-1">{exp.role} • {exp.city} • {exp.year}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getDifficultyColor(exp.difficulty)}`}>
                {exp.difficulty}
              </span>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getOutcomeColor(exp.outcome)}`}>
                {exp.outcome}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#999]">Submitted on {new Date(exp.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Rounds */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-bold text-[#1a1a1a]">Interview Rounds ({exp.rounds?.length || 0})</h2>
          
          {exp.rounds?.map((round: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#16a34a] text-white rounded-lg flex items-center justify-center font-bold text-sm">{i + 1}</span>
                  <h3 className="font-bold text-[#1a1a1a]">{round.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getDifficultyColor(round.difficulty)}`}>
                  {round.difficulty}
                </span>
              </div>

              {round.description && (
                <p className="text-sm text-[#6b6b6b] mb-4 leading-relaxed">{round.description}</p>
              )}

              {round.questions && round.questions.length > 0 && round.questions[0] && (
                <div>
                  <p className="text-xs font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">Questions Asked</p>
                  <ul className="space-y-2">
                    {round.questions.filter((q: string) => q.trim()).map((q: string, qIdx: number) => (
                      <li key={qIdx} className="flex gap-2 text-sm text-[#1a1a1a] bg-[#f5f0e8] px-4 py-3 rounded-lg border border-[#1a1a1a]/5">
                        <span className="text-[#16a34a] font-bold shrink-0">Q{qIdx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tips */}
        {exp.tips && (
          <div className="bg-[#16a34a]/5 border border-[#16a34a]/20 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-[#16a34a] mb-2 flex items-center gap-2">
              <span>💡</span> Tips from the Candidate
            </h3>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">{exp.tips}</p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-8 text-center">
          <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Preparing for {exp.company}?</h3>
          <p className="text-[#6b6b6b] text-sm mb-4">Practice a mock interview tailored for this exact company and role.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/setup" className="px-6 py-3 bg-[#16a34a] text-white font-bold rounded-xl hover:bg-[#15803d] transition text-sm">
              Start {exp.company} Mock Interview
            </Link>
            <Link href="/experiences/submit" className="px-6 py-3 bg-white border border-[#1a1a1a]/15 text-[#1a1a1a] font-bold rounded-xl hover:bg-gray-50 transition text-sm">
              Share Your Experience
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
