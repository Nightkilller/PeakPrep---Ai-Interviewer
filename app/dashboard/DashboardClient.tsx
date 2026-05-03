"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { placementDrives } from "@/constants/placementData";
import { getCompanyLogo } from "@/lib/utils";

function getReadinessColor(score: number) {
  if (score >= 800) return { bg: "bg-[#16a34a]", text: "text-[#16a34a]", ring: "ring-[#16a34a]/20", label: "Elite", gradient: "from-[#16a34a] to-[#15803d]" };
  if (score >= 600) return { bg: "bg-[#16a34a]", text: "text-[#16a34a]", ring: "ring-[#16a34a]/20", label: "Strong", gradient: "from-[#16a34a] to-[#22c55e]" };
  if (score >= 400) return { bg: "bg-[#d97706]", text: "text-[#b45309]", ring: "ring-[#d97706]/20", label: "Developing", gradient: "from-[#d97706] to-[#f59e0b]" };
  return { bg: "bg-[#dc2626]", text: "text-[#dc2626]", ring: "ring-[#dc2626]/20", label: "Beginner", gradient: "from-[#dc2626] to-[#ef4444]" };
}

function getCountdown(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, passed: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, passed: false };
}

function getCategoryColor(cat: string) {
  if (cat === "faang") return { bg: "bg-[#1a1a1a]/[0.03]", border: "border-[#1a1a1a]/15", badge: "bg-[#1a1a1a] text-white", dot: "bg-[#1a1a1a]" };
  if (cat === "product") return { bg: "bg-white", border: "border-[#16a34a]/20", badge: "bg-[#16a34a]/10 text-[#16a34a]", dot: "bg-[#16a34a]" };
  return { bg: "bg-white", border: "border-[#1a1a1a]/10", badge: "bg-[#16a34a]/10 text-[#16a34a]", dot: "bg-[#16a34a]" };
}

interface DashboardProps {
  readiness: any;
  weaknesses: any[];
  studyPlan: any[];
  sessionCount: number;
}

export default function DashboardClient({ readiness, weaknesses, studyPlan, sessionCount }: DashboardProps) {
  const [filter, setFilter] = useState<"all" | "service" | "product" | "faang">("all");
  const [, setTick] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  // Tick every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Load completed tasks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("studyPlanCompleted");
      if (saved) setCompletedTasks(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleTask = (day: number) => {
    const updated = { ...completedTasks, [day]: !completedTasks[day] };
    setCompletedTasks(updated);
    try { localStorage.setItem("studyPlanCompleted", JSON.stringify(updated)); } catch {}
  };

  const filteredDrives = placementDrives
    .filter(d => filter === "all" || d.category === filter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const readinessScore = readiness?.currentScore || 0;
  const readinessInfo = getReadinessColor(readinessScore);
  const streak = readiness?.streak || 0;

  return (
    <div className="min-h-screen bg-[#f5f0e8] noise-bg grid-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-24 sm:pt-28 pb-12 sm:pb-16 space-y-8 sm:space-y-12">
        
        {/* Hero — Readiness Score */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Readiness Score Card */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-[#1a1a1a]/10 p-6 sm:p-8 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${readinessInfo.gradient}`}></div>
            <p className="text-xs font-mono uppercase text-[#6b6b6b] mb-3 tracking-widest">Interview Readiness</p>
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ring-4 ${readinessInfo.ring} mb-4`}>
              <div className="text-center">
                <p className={`text-4xl font-black ${readinessInfo.text}`}>{readinessScore}</p>
                <p className="text-xs text-[#999]">/ 1000</p>
              </div>
            </div>
            <p className={`text-sm font-bold ${readinessInfo.text}`}>{readinessInfo.label}</p>
            <div className="flex justify-center gap-4 mt-4 text-xs text-[#6b6b6b]">
              <span>{readiness?.totalSessions || sessionCount} sessions</span>
              <span>•</span>
              <span>{streak} day streak 🔥</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Readiness Tiers */}
            <div className="sm:col-span-2 bg-white rounded-2xl border border-[#1a1a1a]/10 p-5 sm:p-6">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">Company Tier Readiness</h3>
              <div className="space-y-3">
                {[
                  { label: "Service (TCS, Infosys, Wipro)", threshold: 400, color: "bg-[#16a34a]" },
                  { label: "Product (Paytm, Swiggy, Flipkart)", threshold: 600, color: "bg-[#1a1a1a]" },
                  { label: "FAANG (Google, Amazon, Microsoft)", threshold: 750, color: "bg-[#1a1a1a]" },
                ].map(tier => {
                  const progress = Math.min(100, (readinessScore / tier.threshold) * 100);
                  const ready = readinessScore >= tier.threshold;
                  return (
                    <div key={tier.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#6b6b6b]">{tier.label}</span>
                        <span className={`font-bold ${ready ? 'text-green-600' : 'text-[#999]'}`}>
                          {ready ? '✓ Ready' : `${tier.threshold - readinessScore} pts needed`}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#f5f0e8] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${tier.color}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <Link href="/setup" className="bg-[#16a34a] text-white rounded-2xl p-6 flex flex-col justify-between hover:bg-[#15803d] transition group">
              <p className="text-xs uppercase tracking-wider opacity-80 text-white">Quick Action</p>
              <p className="text-xl font-bold mt-2 text-white">Start Mock Interview →</p>
            </Link>
            <Link href="/experiences" className="bg-[#1a1a1a] text-white rounded-2xl p-6 flex flex-col justify-between hover:bg-black transition group">
              <p className="text-xs uppercase tracking-wider opacity-60 text-white">Community</p>
              <p className="text-xl font-bold mt-2 text-white">Real Experiences →</p>
            </Link>
          </div>
        </section>

        {/* Placement Countdown */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Upcoming Placement Drives</h2>
              <p className="text-sm text-[#6b6b6b] mt-1">Practice before deadlines — real urgency drives real prep.</p>
            </div>
            <div className="flex gap-2">
              {(["all", "service", "product", "faang"] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    filter === cat
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white border border-[#1a1a1a]/10 text-[#6b6b6b] hover:border-[#16a34a]/40"
                  }`}
                >
                  {cat === "all" ? "All" : cat === "faang" ? "FAANG" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrives.map(drive => {
              const countdown = getCountdown(drive.date);
              const catColor = getCategoryColor(drive.category);
              const meetsThreshold = readinessScore >= drive.requiredReadiness;
              const recommendedMocks = 10;

              return (
                <div key={drive.id} className={`${catColor.bg} rounded-2xl border ${catColor.border} p-6 relative overflow-hidden transition hover:shadow-md`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[14px] border-[2px] border-[#e5e5e5] bg-[#f5f0e8] flex items-center justify-center shrink-0">
                        <img 
                          src={getCompanyLogo(drive.company)} 
                          alt={drive.company} 
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${drive.company}&background=random&color=fff&rounded=true&bold=true`;
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1a1a1a] text-sm">{drive.company}</h3>
                        <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wider">{drive.examName}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${catColor.badge}`}>
                      {drive.category.toUpperCase()}
                    </span>
                  </div>

                  {/* Countdown */}
                  {!countdown.passed ? (
                    <div className="flex gap-3 mb-4">
                      {[
                        { val: countdown.days, label: "days" },
                        { val: countdown.hours, label: "hrs" },
                        { val: countdown.minutes, label: "min" },
                      ].map(unit => (
                        <div key={unit.label} className="bg-white rounded-lg px-3 py-2 text-center border border-black/5 shadow-sm">
                          <p className="text-lg font-black text-[#1a1a1a]">{unit.val}</p>
                          <p className="text-[9px] text-[#999] uppercase">{unit.label}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-2 rounded-lg mb-4 text-center">
                      Drive has passed
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-[#6b6b6b]">
                    <p>📋 {drive.eligibility}</p>
                    <p>💰 {drive.packageRange}</p>
                  </div>

                  {/* Prep Progress */}
                  <div className="mt-4 pt-3 border-t border-black/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6b6b6b]">Mock prep: <strong className="text-[#1a1a1a]">{Math.min(sessionCount, recommendedMocks)}/{recommendedMocks}</strong></span>
                      <span className={`font-bold ${meetsThreshold ? 'text-green-600' : 'text-amber-600'}`}>
                        {meetsThreshold ? '✓ Ready' : `Need ${drive.requiredReadiness}+`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-[#16a34a] rounded-full transition-all" style={{ width: `${Math.min(100, (sessionCount / recommendedMocks) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Weak Topic Detector + Study Plan */}
        {weaknesses.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Weakness Heatmap */}
            <div className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-6">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">Weak Topic Detector</h3>
              <p className="text-xs text-[#6b6b6b] mb-6">Topics where you consistently struggle — based on {readiness?.totalSessions || sessionCount} interviews.</p>
              <div className="space-y-3">
                {weaknesses.slice(0, 8).map((w, i) => {
                  const intensity = Math.min(100, (w.failCount / Math.max(w.totalAttempts, 1)) * 100);
                  const heatColor = intensity > 70 ? 'bg-[#dc2626]' : intensity > 40 ? 'bg-[#d97706]' : 'bg-[#16a34a]';
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-sm ${heatColor} shrink-0`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-[#1a1a1a]">{w.topic}</span>
                          <span className="text-[10px] text-[#dc2626] font-bold bg-[#dc2626]/10 px-2 py-0.5 rounded">
                            {w.failCount} fails / {w.totalAttempts} attempts
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#f5f0e8] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${heatColor}`} style={{ width: `${intensity}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Auto Study Plan */}
            <div className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-6">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">Your 7-Day Study Plan</h3>
              <p className="text-xs text-[#6b6b6b] mb-6">Auto-generated based on your weaknesses. Check off as you complete.</p>
              <div className="space-y-3">
                {studyPlan.map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border transition ${
                      completedTasks[item.day]
                        ? 'bg-[#16a34a]/5 border-[#16a34a]/20'
                        : 'bg-[#f5f0e8]/50 border-[#1a1a1a]/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(item.day)}
                        className={`w-5 h-5 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center transition ${
                          completedTasks[item.day]
                            ? 'bg-[#16a34a] border-[#16a34a] text-white'
                            : 'border-[#1a1a1a]/20'
                        }`}
                      >
                        {completedTasks[item.day] && <span className="text-xs">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#16a34a] bg-[#16a34a]/10 px-1.5 py-0.5 rounded">Day {item.day}</span>
                          <span className={`text-sm font-bold ${completedTasks[item.day] ? 'line-through text-[#999]' : 'text-[#1a1a1a]'}`}>{item.topic}</span>
                        </div>
                        <p className="text-[11px] text-[#6b6b6b] italic mb-1">{item.reason}</p>
                        <p className="text-[11px] text-[#1a1a1a]"><strong>Target:</strong> {item.practiceTarget}</p>
                        <p className="text-[11px] text-[#16a34a] mt-0.5">{item.resource}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {studyPlan.length === 0 && (
                  <div className="text-center py-8 text-[#999]">
                    <p className="text-lg mb-2">🎯</p>
                    <p className="text-sm">Complete more interviews to generate a personalized study plan.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Empty State if no data */}
        {weaknesses.length === 0 && (
          <section className="bg-white rounded-2xl border border-[#1a1a1a]/10 p-12 text-center">
            <p className="text-4xl mb-4">🎓</p>
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Start Your Journey</h3>
            <p className="text-[#6b6b6b] max-w-md mx-auto mb-6">
              Complete your first mock interview to unlock your personalized weakness detector, study plan, and readiness score.
            </p>
            <Link href="/setup" className="inline-block px-8 py-3 bg-[#16a34a] text-white font-bold rounded-xl hover:bg-[#15803d] transition">
              Start Your First Interview
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
