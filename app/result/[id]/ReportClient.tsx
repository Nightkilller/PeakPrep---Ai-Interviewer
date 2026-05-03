"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import dayjs from "dayjs";

function getScoreColorMapping(score: number) {
  if (score >= 90) return { bg: '#EAF3DE', text: '#27500A', label: 'Excellent', bar: '#639922' };
  if (score >= 75) return { bg: '#E6F1FB', text: '#0C447C', label: 'Good', bar: '#185FA5' };
  if (score >= 60) return { bg: '#FAEEDA', text: '#633806', label: 'Average', bar: '#BA7517' };
  return { bg: '#FCEBEB', text: '#791F1F', label: 'Poor', bar: '#E24B4A' };
}

function getGradeDonutColor(grade: string) {
  const g = grade.toUpperCase();
  if (g.includes('A')) return '#185FA5';
  if (g.includes('B')) return '#639922';
  if (g.includes('C')) return '#BA7517';
  return '#E24B4A';
}

function animateCounter(el: HTMLElement, target: number, duration: number = 1000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.round(start).toString();
    if (start >= target) clearInterval(timer);
  }, 16);
}

export default function ReportClient({ data, assessment }: { data: any, assessment: any }) {
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share Link");
  
  const scoreCounterRef = useRef<HTMLSpanElement>(null);
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const radarChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);

  const [expandedQs, setExpandedQs] = useState<Record<number, boolean>>({ 0: true });

  const scoreMap = getScoreColorMapping(assessment?.overallScore || 0);
  const donutColor = getGradeDonutColor(assessment?.grade || 'C');

  useEffect(() => {
    if (scoreCounterRef.current && assessment?.overallScore) {
      animateCounter(scoreCounterRef.current, assessment.overallScore, 1200);
    }

    // IntersectionObserver for progress bars
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target as HTMLElement;
          const targetWidth = bar.dataset.score + '%';
          setTimeout(() => { bar.style.width = targetWidth; }, 100);
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });
    
    document.querySelectorAll('.bar-fill').forEach(b => observer.observe(b));

    return () => observer.disconnect();
  }, [assessment?.overallScore]);

  useEffect(() => {
    if (!chartsLoaded || !(window as any).Chart || !assessment) return;
    const Chart = (window as any).Chart;

    // 1. Donut Chart
    if (donutChartRef.current) {
      new Chart(donutChartRef.current, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [assessment.overallScore || 0, Math.max(0, 100 - (assessment.overallScore || 0))],
            backgroundColor: [donutColor, '#F3F4F6'],
            borderWidth: 0,
            cutout: '78%'
          }]
        },
        plugins: [{
          id: 'centerText',
          afterDraw(chart: any) {
            const { ctx, width, height } = chart;
            ctx.save();
            ctx.font = 'bold 36px "Inter", sans-serif';
            ctx.fillStyle = donutColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(assessment.grade || 'C', width/2, height/2);
            ctx.restore();
          }
        }],
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1200, easing: 'easeOutQuart' }, events: [], tooltip: { enabled: false } }
      });
    }

    // 2. Radar Chart
    if (radarChartRef.current && assessment.categoryScores) {
      new Chart(radarChartRef.current, {
        type: 'radar',
        data: {
          labels: assessment.categoryScores.map((c: any) => c.category),
          datasets: [
            {
              label: 'Your score',
              data: assessment.categoryScores.map((c: any) => c.score),
              backgroundColor: 'rgba(24,95,165,0.12)',
              borderColor: '#185FA5',
              borderWidth: 2,
              pointBackgroundColor: '#185FA5'
            },
            {
              label: 'Target (100)',
              data: assessment.categoryScores.map(() => 100),
              backgroundColor: 'transparent',
              borderColor: 'rgba(0,0,0,0.1)',
              borderDash: [4,4],
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { r: { min: 0, max: 100, ticks: { display: false } } },
          plugins: { legend: { display: false } },
          animation: { duration: 1000 }
        }
      });
    }

    // 3. Line Chart
    if (lineChartRef.current && assessment.scoreHistory && assessment.scoreHistory.length > 0) {
      new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: assessment.scoreHistory.map((s: any) => new Date(s.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })),
          datasets: [{
            label: 'Score',
            data: assessment.scoreHistory.map((s: any) => s.score),
            borderColor: '#185FA5',
            backgroundColor: 'rgba(24,95,165,0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#185FA5',
            pointRadius: 5,
            fill: true,
            tension: 0.35
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 100, ticks: { stepSize: 25 } },
            x: { grid: { display: false } }
          },
          plugins: { legend: { display: false } }
        }
      });
    }

    // 4. Bar Chart
    if (barChartRef.current && assessment.communicationAnalysis?.fillerWords) {
      new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: assessment.communicationAnalysis.fillerWords.map((f: any) => `"${f.word}"`),
          datasets: [{
            data: assessment.communicationAnalysis.fillerWords.map((f: any) => f.count),
            backgroundColor: '#F09595',
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { stepSize: 2 } }, y: { grid: { display: false } } }
        }
      });
    }
  }, [chartsLoaded, assessment, donutColor]);

  if (!assessment) return null;

  const handleDownload = () => {
    document.title = `InterviewOS Report - ${assessment.candidateName} - ${dayjs().format('YYYY-MM-DD')}`;
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    const summary = `I scored ${assessment.overallScore}/100 (Grade ${assessment.grade}) on my ${assessment.nextRecommendation?.suggestedMode || 'interview'} mock interview on InterviewOS! Check it out: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My InterviewOS Result', text: summary, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareLabel('Copied!');
        setTimeout(() => setShareLabel('Share Link'), 2000);
      }
    } catch(e) { 
      console.error(e); 
    }
  };

  const toggleAccordion = (idx: number) => {
    setExpandedQs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" onLoad={() => setChartsLoaded(true)} />
      
      {/* CSS for print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          body { font-size: 12px; color: #111827; background: white; }
          .card { border: 1px solid #E5E7EB; break-inside: avoid; }
          canvas { max-width: 100%; }
          .accordion-content { display: block !important; }
        }
      `}} />

      <div className="min-h-screen bg-white text-[#111827] font-sans pb-20">
        {/* 1. Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between no-print shadow-sm">
          <Link href="/" className="font-bold text-xl tracking-tight">InterviewOS</Link>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition">
              {shareLabel}
            </button>
            <button onClick={handleDownload} className="px-4 py-2 text-sm font-medium bg-[#111827] text-white rounded-md hover:bg-black transition">
              Download PDF
            </button>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
          
          {/* 2. Report Header / Hero Section */}
          <section className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="relative w-48 h-48 flex-shrink-0">
              <canvas ref={donutChartRef}></canvas>
            </div>
            <div className="flex-1 space-y-4">
              <h1 className="text-4xl font-bold">{assessment.candidateName}</h1>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-wider">
                <span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-700">{data.position || 'Role Not Specified'}</span>
                <span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-700">{data.interviewType || 'Interview Mode'}</span>
                <span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-700">{dayjs(assessment.generatedAt || data.completedAt).format('DD MMM YYYY, HH:mm')}</span>
              </div>
              <div className="pl-4 border-l-4 border-[#185FA5] text-gray-700 leading-relaxed italic">
                {assessment.verdictSummary}
              </div>
            </div>
          </section>

          {/* 2.5. Readiness Score */}
          {assessment.readinessRating != null && (
            <section className="card p-6 border rounded-xl bg-gradient-to-r from-[#111827] to-[#1e293b] text-white shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Interview Readiness</p>
                  <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full ring-4 ${(assessment.readinessRating * 10) >= 800 ? 'ring-blue-500/30' : (assessment.readinessRating * 10) >= 600 ? 'ring-green-500/30' : (assessment.readinessRating * 10) >= 400 ? 'ring-amber-500/30' : 'ring-red-500/30'}`}>
                    <div className="text-center">
                      <p className="text-3xl font-black">{Math.round(assessment.readinessRating * 10)}</p>
                      <p className="text-xs text-gray-400">/ 1000</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <p className="text-sm text-gray-300 mb-3">Your readiness level across company tiers:</p>
                  {[
                    { label: "Service Tier (TCS, Infosys)", threshold: 400, color: "bg-emerald-400" },
                    { label: "Product Tier (Flipkart, Paytm)", threshold: 600, color: "bg-blue-400" },
                    { label: "FAANG Tier (Google, Amazon)", threshold: 750, color: "bg-purple-400" },
                  ].map((tier, i) => {
                    const score = Math.round(assessment.readinessRating * 10);
                    const progress = Math.min(100, (score / tier.threshold) * 100);
                    const ready = score >= tier.threshold;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{tier.label}</span>
                          <span className={ready ? 'text-green-400 font-bold' : 'text-gray-500'}>{ready ? '✓ Ready' : `${tier.threshold - score} pts needed`}</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${tier.color}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* 3. Key Metrics Bar */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-xl card border">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase font-semibold">Overall Score</p>
              <p className="text-3xl font-bold" style={{ color: donutColor }}>
                <span ref={scoreCounterRef}>0</span><span className="text-xl">/100</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase font-semibold">Questions Answered</p>
              <p className="text-3xl font-bold text-gray-900">{assessment.questionsAnswered} <span className="text-xl text-gray-400">/ {assessment.totalQuestions}</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase font-semibold">Violations</p>
              <p className={`text-3xl font-bold ${(assessment.proctoringReport?.totalViolations || 0) > 0 ? 'text-[#E24B4A]' : 'text-[#639922]'}`}>
                {assessment.proctoringReport?.totalViolations || 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase font-semibold">Duration</p>
              <p className="text-3xl font-bold text-gray-900">{assessment.interviewDuration || 0} <span className="text-xl text-gray-400">min</span></p>
            </div>
          </section>

          {/* 4. Category Scores */}
          <section className="grid md:grid-cols-2 gap-10 card bg-white">
            <div className="space-y-5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#185FA5]"></span> Category Scores
              </h3>
              {assessment.categoryScores?.map((cat: any, i: number) => {
                const map = getScoreColorMapping(cat.score);
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium">{cat.category}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: map.bg, color: map.text }}>{map.label} ({cat.score})</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bar-fill h-full transition-all duration-1000 w-0" style={{ backgroundColor: map.bar }} data-score={cat.score}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="h-64 relative">
              <canvas ref={radarChartRef}></canvas>
            </div>
          </section>

          {/* 5. Strengths vs Improvements */}
          <section className="grid md:grid-cols-2 gap-6 card">
            <div className="bg-[#EAF3DE]/40 border border-[#639922]/20 rounded-xl p-6">
              <h3 className="text-[#27500A] font-bold mb-4">Strengths</h3>
              <ul className="space-y-3">
                {assessment.strengths?.map((s: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-800 leading-relaxed">
                    <span className="text-[#639922] mt-0.5">✦</span> <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#FAEEDA]/40 border border-[#BA7517]/20 rounded-xl p-6">
              <h3 className="text-[#633806] font-bold mb-4">Areas to Improve</h3>
              <ul className="space-y-3">
                {assessment.areasForImprovement?.map((a: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-800 leading-relaxed">
                    <span className="text-[#BA7517] mt-0.5">!</span> <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="page-break"></div>

          {/* 6. Score Trend Chart */}
          <section className="card p-6 border rounded-xl bg-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#185FA5]"></span> Score Trend (Last 5 Interviews)
            </h3>
            <div className="w-full h-64">
              <canvas ref={lineChartRef}></canvas>
            </div>
          </section>

          {/* 7. Question-by-question breakdown */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#185FA5]"></span> Question and Answer Breakdown
            </h3>
            <div className="space-y-4">
              {assessment.questionBreakdown?.map((q: any, i: number) => {
                const map = getScoreColorMapping(q.score);
                const isExpanded = !!expandedQs[i];
                return (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden card bg-white shadow-sm">
                    <div 
                      className="p-5 cursor-pointer bg-gray-50 flex items-start gap-4 hover:bg-gray-100 transition"
                      onClick={() => toggleAccordion(i)}
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 leading-snug">Q{q.questionNumber} — {q.questionText}</h4>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ml-4 border" style={{ backgroundColor: 'white', color: map.text, borderColor: map.bg }}>
                            {q.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2"><span className="font-medium text-gray-900">Your answer:</span> {q.candidateAnswer}</p>
                      </div>
                    </div>
                    
                    <div className={`p-5 border-t border-gray-100 space-y-4 ${isExpanded ? 'block' : 'hidden'} accordion-content`}>
                      <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-100">
                        <span className="font-bold block mb-1">Feedback:</span>
                        {q.feedback}
                        {q.keyMistake && <span className="block mt-2 font-semibold">Key mistake: {q.keyMistake}</span>}
                      </div>
                      <div className="bg-[#E6F1FB] p-4 rounded-lg border border-[#185FA5]/20">
                        <span className="text-[#0C447C] font-bold text-xs uppercase tracking-wider mb-2 block">Model Answer Highlight</span>
                        <p className="text-sm text-[#0C447C] leading-relaxed">{q.modelAnswer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="page-break"></div>

          {/* 8. Communication Analysis */}
          <section className="card p-6 border rounded-xl bg-white">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E24B4A]"></span> Communication Analysis — Filler Words
            </h3>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Words per minute: <span className="font-bold text-gray-900">{assessment.communicationAnalysis?.wordsPerMinute}</span> (Target: {assessment.communicationAnalysis?.targetWpm})</p>
                  <p className="text-sm text-gray-600 mb-2">Pace: <span className="font-medium text-gray-800">{assessment.communicationAnalysis?.paceFeedback}</span></p>
                  <p className="text-sm text-gray-600">Total Filler Words: <span className="font-bold text-red-600">{assessment.communicationAnalysis?.totalFillerCount}</span></p>
                </div>
              </div>
              <div className="h-48 relative">
                <canvas ref={barChartRef}></canvas>
              </div>
            </div>
          </section>

          {/* 9. Code Analysis (if coding round) */}
          {assessment.codeAnalysis?.submitted && (
            <section className="card p-6 border rounded-xl bg-gray-50 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#185FA5]"></span> Code Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm mb-2"><span className="font-medium text-gray-700">Execution:</span> {assessment.codeAnalysis.executedSuccessfully ? '✅ Success' : '❌ Failed'}</p>
                  <p className="text-sm mb-2"><span className="font-medium text-gray-700">Correctness Score:</span> {assessment.codeAnalysis.correctnessScore}/100</p>
                  <p className="text-sm mb-2"><span className="font-medium text-gray-700">Big-O Stated:</span> {assessment.codeAnalysis.complexityStated}</p>
                  <p className="text-sm mb-2"><span className="font-medium text-gray-700">Big-O Actual:</span> {assessment.codeAnalysis.complexityActual}</p>
                </div>
                <div className="bg-white p-4 rounded-md border text-sm text-gray-700 italic leading-relaxed">
                  {assessment.codeAnalysis.codeQualityFeedback}
                </div>
              </div>
            </section>
          )}

          {/* 10. Proctoring Log */}
          {assessment.proctoringReport && (
            <section className="card space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E24B4A]"></span> Proctoring Log
              </h3>
              {assessment.proctoringReport.totalViolations > 0 ? (
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                  <ul className="space-y-3 mb-4">
                    {assessment.proctoringReport.violations?.map((v: any, i: number) => (
                      <li key={i} className="flex gap-4 text-sm items-center">
                        <span className="text-gray-500 font-mono w-12">{v.timestamp}</span>
                        <span className="text-red-600 font-bold uppercase text-[10px] bg-red-50 px-2 py-0.5 rounded border border-red-100">{v.type}</span>
                        <span className="text-gray-700">Focus lost for {v.durationSeconds} seconds</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 border-t pt-3">{assessment.proctoringReport.proctoringNote}</p>
                </div>
              ) : (
                <div className="bg-[#EAF3DE]/50 border border-[#639922]/20 px-4 py-3 rounded-lg text-sm text-[#27500A] font-medium flex items-center gap-2">
                  <span>✓</span> Clean session — no violations detected.
                </div>
              )}
            </section>
          )}

          {/* 11. 7-Day Study Roadmap */}
          {assessment.studyRoadmap && assessment.studyRoadmap.length > 0 && (
            <section className="card">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#BA7517]"></span> 7-Day Study Roadmap
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {assessment.studyRoadmap.map((item: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#BA7517] text-white font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {item.day}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-1">{item.topic}</h4>
                      <p className="text-sm text-gray-500 italic mb-3">{item.reason}</p>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100">
                        <p className="mb-2"><span className="font-semibold text-gray-900">Target:</span> {item.practiceTarget}</p>
                        <p><span className="font-semibold text-gray-900">Resource:</span> <span className="text-blue-600 font-medium cursor-pointer hover:underline">{item.resource}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 12. Salary Estimator */}
          {assessment.salaryEstimate && (
            <section className="card p-6 border rounded-xl bg-[#111827] text-white shadow-lg">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#639922]"></span> Estimated Salary Range Based on Performance
              </h3>
              <p className="text-xs text-gray-400 mb-6 border-b border-gray-800 pb-4">{assessment.salaryEstimate.salaryNote}</p>
              
              <div className="space-y-4">
                {[
                  { label: "Service Companies (TCS, Infosys, Wipro)", range: `${assessment.salaryEstimate.serviceCompanies?.min || 0} - ${assessment.salaryEstimate.serviceCompanies?.max || 0} ${assessment.salaryEstimate.serviceCompanies?.currency || 'LPA'}`, min: assessment.salaryEstimate.serviceCompanies?.min || 0, max: assessment.salaryEstimate.serviceCompanies?.max || 0, ceiling: 10 },
                  { label: "Indian Product (Paytm, Swiggy, Zomato)", range: `${assessment.salaryEstimate.indianProduct?.min || 0} - ${assessment.salaryEstimate.indianProduct?.max || 0} ${assessment.salaryEstimate.indianProduct?.currency || 'LPA'}`, min: assessment.salaryEstimate.indianProduct?.min || 0, max: assessment.salaryEstimate.indianProduct?.max || 0, ceiling: 30 },
                  { label: "FAANG / Top Product", range: `${assessment.salaryEstimate.faang?.min || 0} - ${assessment.salaryEstimate.faang?.max || 0} ${assessment.salaryEstimate.faang?.currency || 'LPA'}`, min: assessment.salaryEstimate.faang?.min || 0, max: assessment.salaryEstimate.faang?.max || 0, ceiling: 60 }
                ].map((tier, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-gray-300">{tier.label}</span>
                      <span className="font-mono font-bold text-[#EAF3DE]">{tier.range}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#639922] to-[#EAF3DE] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, ((tier.max || 1) / tier.ceiling) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Improvement Callout */}
              {assessment.areasForImprovement && assessment.areasForImprovement.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <p className="text-xs text-amber-400 font-bold mb-1">💡 How to jump to the next tier:</p>
                  <p className="text-sm text-gray-300">
                    Improve <span className="text-white font-bold">{assessment.areasForImprovement.slice(0, 3).join(", ")}</span> to unlock higher salary ranges.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* 13. Next Recommendation Card */}
          {assessment.nextRecommendation && (
            <section className="bg-indigo-50 border border-indigo-100 p-8 rounded-2xl shadow-sm no-print relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-900"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
              </div>
              <h3 className="text-indigo-900 font-black text-xl mb-3 relative z-10">Recommendation For Next Session</h3>
              <p className="text-indigo-800 mb-6 relative z-10 max-w-2xl leading-relaxed">{assessment.nextRecommendation.rationale}</p>
              
              <div className="flex flex-wrap gap-4 mb-6 relative z-10">
                <div className="bg-white px-5 py-3 rounded-xl border border-indigo-100 shadow-sm flex-1 min-w-[120px]">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Mode</span>
                  <span className="font-bold text-gray-900">{assessment.nextRecommendation.suggestedMode}</span>
                </div>
                <div className="bg-white px-5 py-3 rounded-xl border border-indigo-100 shadow-sm flex-1 min-w-[120px]">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Difficulty</span>
                  <span className="font-bold text-gray-900">{assessment.nextRecommendation.suggestedDifficulty}</span>
                </div>
                <div className="bg-white px-5 py-3 rounded-xl border border-indigo-100 shadow-sm flex-1 min-w-[120px]">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Target Score</span>
                  <span className="font-bold text-gray-900 text-lg">{assessment.nextRecommendation.targetScore} <span className="text-xs text-gray-500 font-normal">/ 100</span></span>
                </div>
              </div>

              <Link href="/setup" className="inline-block bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition relative z-10">
                Start Recommended Session
              </Link>
            </section>
          )}

          {/* 14. Footer */}
          <footer className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-4">InterviewOS — Practice Like It's Real</p>
            <div className="flex justify-center gap-4 no-print">
              <button onClick={handleShare} className="text-gray-600 hover:text-gray-900 font-medium text-sm transition">Share Report</button>
              <span className="text-gray-300">|</span>
              <button onClick={handleDownload} className="text-gray-600 hover:text-gray-900 font-medium text-sm transition">Save as PDF</button>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
