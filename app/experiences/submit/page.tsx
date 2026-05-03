"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { submitExperience } from "@/lib/actions/experience.action";
import { useUser } from "@clerk/nextjs";

const commonCompanies = [
  "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "HCL", "Tech Mahindra",
  "Amazon", "Flipkart", "Google", "Microsoft", "Paytm", "Swiggy", "Zomato",
  "Razorpay", "PhonePe", "Uber", "Goldman Sachs", "JP Morgan", "Deloitte", "Other"
];

const difficultyOptions = ["Easy", "Medium", "Hard"];
const outcomeOptions = ["Selected", "Rejected", "Waitlisted", "Pending"];

interface Round {
  name: string;
  description: string;
  questions: string[];
  difficulty: string;
}

export default function SubmitExperiencePage() {
  const router = useRouter();
  const { user } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [year, setYear] = useState(2026);
  const [difficulty, setDifficulty] = useState("Medium");
  const [outcome, setOutcome] = useState("");
  const [tips, setTips] = useState("");
  const [rounds, setRounds] = useState<Round[]>([
    { name: "Online Test", description: "", questions: [""], difficulty: "Medium" }
  ]);

  const addRound = () => {
    setRounds(prev => [...prev, { name: "", description: "", questions: [""], difficulty: "Medium" }]);
  };

  const removeRound = (idx: number) => {
    setRounds(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRound = (idx: number, field: keyof Round, value: any) => {
    setRounds(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const addQuestion = (roundIdx: number) => {
    setRounds(prev => prev.map((r, i) => i === roundIdx ? { ...r, questions: [...r.questions, ""] } : r));
  };

  const updateQuestion = (roundIdx: number, qIdx: number, value: string) => {
    setRounds(prev => prev.map((r, i) => {
      if (i !== roundIdx) return r;
      const newQ = [...r.questions];
      newQ[qIdx] = value;
      return { ...r, questions: newQ };
    }));
  };

  const removeQuestion = (roundIdx: number, qIdx: number) => {
    setRounds(prev => prev.map((r, i) => {
      if (i !== roundIdx) return r;
      return { ...r, questions: r.questions.filter((_, j) => j !== qIdx) };
    }));
  };

  const handleSubmit = async () => {
    const finalCompany = company === "Other" ? customCompany : company;
    if (!finalCompany || !role || !outcome) return;

    setSubmitting(true);
    try {
      await submitExperience({
        company: finalCompany,
        role,
        city,
        year,
        rounds: rounds.filter(r => r.name.trim()),
        difficulty,
        outcome,
        tips,
        submittedBy: user?.id || "guest",
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] noise-bg">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-36 pb-16 text-center">
          <div className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-12">
            <p className="text-5xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Thank You!</h2>
            <p className="text-[#6b6b6b] mb-6">Your interview experience has been submitted. You're helping thousands of students prepare better.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push("/experiences")} className="px-6 py-3 bg-[#16a34a] text-white font-bold rounded-xl hover:bg-[#15803d] transition">
                View All Experiences
              </button>
              <button onClick={() => router.push("/dashboard")} className="px-6 py-3 bg-white border border-[#1a1a1a]/15 text-[#1a1a1a] font-bold rounded-xl hover:bg-gray-50 transition">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] noise-bg grid-bg">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Share Your Interview Experience</h1>
          <p className="text-[#6b6b6b] text-sm mt-1">Help other students prepare — your real experience is more valuable than any textbook.</p>
        </div>

        <div className="space-y-6">
          {/* Company & Role */}
          <div className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-6 space-y-4">
            <h3 className="font-bold text-[#1a1a1a] text-sm">Company Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Company *</label>
                <select
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/10 rounded-lg text-sm"
                >
                  <option value="">Select company...</option>
                  {commonCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {company === "Other" && (
                  <input
                    type="text"
                    value={customCompany}
                    onChange={e => setCustomCompany(e.target.value)}
                    placeholder="Enter company name..."
                    className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/10 rounded-lg text-sm mt-2"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Role *</label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. SDE-1, Analyst..."
                  className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/10 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Pune, Bangalore..."
                  className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/10 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Year</label>
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/10 rounded-lg text-sm">
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Overall Difficulty</label>
                <div className="flex gap-2">
                  {difficultyOptions.map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition ${
                        difficulty === d
                          ? "border-[#16a34a] bg-[#16a34a]/10 text-[#16a34a]"
                          : "border-[#1a1a1a]/10 bg-[#f5f0e8] text-[#6b6b6b] hover:border-[#16a34a]/30"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rounds */}
          <div className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1a1a1a] text-sm">Interview Rounds</h3>
              <button onClick={addRound} className="px-3 py-1.5 bg-[#16a34a]/10 text-[#16a34a] text-xs font-bold rounded-lg hover:bg-[#16a34a]/20 transition">
                + Add Round
              </button>
            </div>

            {rounds.map((round, rIdx) => (
              <div key={rIdx} className="bg-[#f5f0e8]/50 rounded-xl border border-[#1a1a1a]/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#16a34a] bg-[#16a34a]/10 px-2 py-0.5 rounded">Round {rIdx + 1}</span>
                  {rounds.length > 1 && (
                    <button onClick={() => removeRound(rIdx)} className="text-xs text-red-500 hover:text-red-700 font-bold">Remove</button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={round.name}
                    onChange={e => updateRound(rIdx, "name", e.target.value)}
                    placeholder="Round name (e.g. Technical 1)"
                    className="px-3 py-2.5 bg-white border border-[#1a1a1a]/10 rounded-lg text-sm"
                  />
                  <select
                    value={round.difficulty}
                    onChange={e => updateRound(rIdx, "difficulty", e.target.value)}
                    className="px-3 py-2.5 bg-white border border-[#1a1a1a]/10 rounded-lg text-sm"
                  >
                    {difficultyOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <textarea
                  value={round.description}
                  onChange={e => updateRound(rIdx, "description", e.target.value)}
                  placeholder="Describe this round (format, duration, what to expect)..."
                  className="w-full px-3 py-2.5 bg-white border border-[#1a1a1a]/10 rounded-lg text-sm resize-none h-20"
                />

                <div>
                  <p className="text-xs font-bold text-[#1a1a1a] mb-2">Questions Asked</p>
                  {round.questions.map((q, qIdx) => (
                    <div key={qIdx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={q}
                        onChange={e => updateQuestion(rIdx, qIdx, e.target.value)}
                        placeholder={`Question ${qIdx + 1}...`}
                        className="flex-1 px-3 py-2 bg-white border border-[#1a1a1a]/10 rounded-lg text-sm"
                      />
                      {round.questions.length > 1 && (
                        <button onClick={() => removeQuestion(rIdx, qIdx)} className="text-xs text-red-400 hover:text-red-600 px-2">✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addQuestion(rIdx)} className="text-xs text-[#16a34a] font-bold hover:underline mt-1">+ Add question</button>
                </div>
              </div>
            ))}
          </div>

          {/* Outcome & Tips */}
          <div className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-6 space-y-4">
            <h3 className="font-bold text-[#1a1a1a] text-sm">Outcome & Tips</h3>
            
            <div>
              <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Outcome *</label>
              <div className="flex gap-2">
                {outcomeOptions.map(o => (
                  <button
                    key={o}
                    onClick={() => setOutcome(o)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition ${
                      outcome === o
                        ? "border-[#16a34a] bg-[#16a34a]/10 text-[#16a34a]"
                        : "border-[#1a1a1a]/10 bg-[#f5f0e8] text-[#6b6b6b] hover:border-[#16a34a]/30"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Tips for Future Candidates</label>
              <textarea
                value={tips}
                onChange={e => setTips(e.target.value)}
                placeholder="What would you tell someone preparing for this company? What resources helped? What would you do differently?"
                className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/10 rounded-lg text-sm resize-none h-28"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !company || !role || !outcome}
            className={`w-full py-4 rounded-xl font-bold text-white text-sm transition ${
              submitting || !company || !role || !outcome
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#16a34a] hover:bg-[#15803d] shadow-lg"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Your Experience"}
          </button>
        </div>
      </main>
    </div>
  );
}
