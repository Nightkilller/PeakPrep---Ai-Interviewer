"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCompanyLogo } from "@/lib/utils";

interface ExperienceListProps {
  experiences: any[];
  companies: string[];
}

export default function ExperienceListClient({ experiences, companies }: ExperienceListProps) {
  const [filterCompany, setFilterCompany] = useState("");
  const [filterYear, setFilterYear] = useState<number | "">("");

  const filtered = experiences.filter(exp => {
    if (filterCompany && exp.company !== filterCompany) return false;
    if (filterYear && exp.year !== filterYear) return false;
    return true;
  });

  const getDifficultyColor = (d: string) => {
    if (d === "Hard") return "bg-red-100 text-red-700";
    if (d === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-green-100 text-green-700";
  };

  const getOutcomeColor = (o: string) => {
    if (o.toLowerCase().includes("selected") || o.toLowerCase().includes("offer")) return "text-green-600";
    if (o.toLowerCase().includes("rejected")) return "text-red-600";
    return "text-[#6b6b6b]";
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] noise-bg grid-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-24 sm:pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#1a1a1a]">Interview Experiences</h1>
            <p className="text-[#6b6b6b] text-sm mt-1">Real questions from real students — crowdsourced interview data.</p>
          </div>
          <Link
            href="/experiences/submit"
            className="px-6 py-3 bg-[#16a34a] text-white font-bold rounded-xl hover:bg-[#15803d] transition text-sm"
          >
            Share Your Experience
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={filterCompany}
            onChange={e => setFilterCompany(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#1a1a1a]/10 rounded-lg text-sm text-[#1a1a1a] cursor-pointer"
          >
            <option value="">All Companies</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value ? Number(e.target.value) : "")}
            className="px-4 py-2.5 bg-white border border-[#1a1a1a]/10 rounded-lg text-sm text-[#1a1a1a] cursor-pointer"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <span className="px-4 py-2.5 bg-white border border-[#1a1a1a]/10 rounded-lg text-xs text-[#6b6b6b] flex items-center">
            {filtered.length} experience{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((exp) => (
              <Link
                key={exp.id}
                href={`/experiences/${exp.id}`}
                className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-6 hover:shadow-md hover:border-[#16a34a]/30 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-[#e5e5e5] bg-[#fafafa] flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={getCompanyLogo(exp.company)}
                        alt={exp.company}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${exp.company}&background=16a34a&color=fff&rounded=true&bold=true`;
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1a1a1a] text-lg group-hover:text-[#16a34a] transition">{exp.company}</h3>
                      <p className="text-sm text-[#6b6b6b]">{exp.role} • {exp.city} • {exp.year}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${getDifficultyColor(exp.difficulty)}`}>
                    {exp.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {exp.rounds?.slice(0, 3).map((r: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-[#f5f0e8] text-[#1a1a1a] text-[10px] font-medium rounded border border-[#1a1a1a]/10">
                      {r.name}
                    </span>
                  ))}
                  {exp.rounds?.length > 3 && (
                    <span className="px-2 py-0.5 text-[10px] text-[#999]">+{exp.rounds.length - 3} more</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs pt-3 border-t border-[#1a1a1a]/5">
                  <span className={`font-bold ${getOutcomeColor(exp.outcome)}`}>{exp.outcome}</span>
                  <span className="text-[#999]">{new Date(exp.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-16 text-center">
            <p className="text-4xl mb-4">📝</p>
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">No Experiences Yet</h3>
            <p className="text-[#6b6b6b] max-w-md mx-auto mb-6">
              Be the first to share your interview experience and help other students prepare better.
            </p>
            <Link
              href="/experiences/submit"
              className="inline-block px-8 py-3 bg-[#16a34a] text-white font-bold rounded-xl hover:bg-[#15803d] transition"
            >
              Share Your Experience
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
