"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import dayjs from "dayjs";
import DownloadReportButton from "@/components/DownloadReportButton";
import Logo from "@/components/Logo";

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

export default function ReportClient({ sessionId, data, initialAssessment }: { sessionId: string, data: any, initialAssessment: any }) {
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share Link");
  const [assessment, setAssessment] = useState<any>(initialAssessment);
  const [isPolling, setIsPolling] = useState(!initialAssessment);
  const [error, setError] = useState<string | null>(null);
  
  const scoreCounterRef = useRef<HTMLSpanElement>(null);
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const radarChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);

  const [expandedQs, setExpandedQs] = useState<Record<number, boolean>>({ 0: true });

  const scoreMap = getScoreColorMapping(assessment?.overallScore || 0);
  const donutColor = getGradeDonutColor(assessment?.grade || 'C');

  useEffect(() => {
    if (!isPolling) return;
    
    let isMounted = true;

    // Call the dedicated API route — much more reliable than a Server Action
    fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.assessment) {
          setAssessment(data.assessment);
          setIsPolling(false);
        } else {
          setError(data.error || "Failed to generate report. Make sure you spoke at least a few sentences during the interview.");
          setIsPolling(false);
        }
      })
      .catch((e) => {
        if (!isMounted) return;
        console.error("Report generation failed:", e);
        setError("Network error — could not reach the report generation API.");
        setIsPolling(false);
      });

    return () => { isMounted = false; };
  }, [isPolling, sessionId]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] grid-bg noise-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border border-red-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-3">Report Failed</h2>
          <p className="text-gray-500 mb-8 leading-relaxed text-sm">
            {error}
          </p>
          <Link href="/" className="px-6 py-3 bg-[#1a1a1a] text-white font-bold rounded-lg hover:bg-black transition-colors w-full">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] grid-bg noise-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-[#16a34a]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#16a34a] rounded-full border-t-transparent animate-spin"></div>
            <svg className="absolute inset-0 m-auto w-8 h-8 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-3">AI is analyzing your interview</h2>
          <p className="text-gray-500 mb-8 leading-relaxed text-sm">
            Our models are evaluating your communication, technical accuracy, and code quality. This usually takes about 10-15 seconds.
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-[#16a34a] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const reportData = {
    score: assessment.overallScore,
    grade: assessment.grade,
    gradeLabel: getScoreColorMapping(assessment.overallScore).label,
    feedback: assessment.verdictSummary,
    strengths: assessment.strengths,
    areasForImprovement: assessment.areasForImprovement,
    questionBreakdown: assessment.questionBreakdown?.map((q: any) => ({
      question: q.questionText,
      score: q.score,
      level: q.level,
      feedback: q.feedback
    })),
    position: data?.position,
    interviewType: data?.interviewType,
    completedAt: assessment.generatedAt || data?.completedAt,
    candidateName: assessment.candidateName
  };

  const handleShare = async () => {
    const url = window.location.href;
    const summary = `I scored ${assessment.overallScore}/100 (Grade ${assessment.grade}) on my ${assessment.nextRecommendation?.suggestedMode || 'interview'} mock interview on PeakPrep! Check it out: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My PeakPrep Result', text: summary, url });
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

      <div className="min-h-screen bg-[#f5f0e8] noise-bg grid-bg text-[#1a1a1a] font-sans pb-20">
        {/* 1. Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#1a1a1a]/10 px-6 py-4 flex items-center justify-between no-print shadow-sm">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-[#1a1a1a]">PeakPrep</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="px-4 py-2 text-sm font-bold bg-white border border-[#1a1a1a]/15 rounded-lg text-[#1a1a1a] hover:bg-gray-50 transition-all shadow-sm">
              {shareLabel}
            </button>
            <DownloadReportButton reportData={reportData} />
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-6 py-10 space-y-12 relative z-10">
          
          {/* 2. Report Header / Hero Section */}
          <section className="flex flex-col md:flex-row gap-10 items-center md:items-start bg-white rounded-2xl p-8 border border-[#1a1a1a]/10 shadow-sm shadow-[#1a1a1a]/5">
            <div className="relative w-48 h-48 flex-shrink-0">
              <canvas ref={donutChartRef}></canvas>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-[#16a34a]/10 text-[#16a34a] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#16a34a]/20">Official Assessment</span>
              </div>
              <h1 className="text-4xl font-black text-[#1a1a1a] tracking-tight">{assessment.candidateName}</h1>
              <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-widest text-[#6b6b6b]">
                <span className="px-3 py-1.5 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/5">{data.position || 'Role Not Specified'}</span>
                <span className="px-3 py-1.5 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/5">{data.interviewType || 'Interview Mode'}</span>
                <span className="px-3 py-1.5 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/5 text-[#16a34a]">{dayjs(assessment.generatedAt || data.completedAt).format('DD MMM YYYY, HH:mm')}</span>
              </div>
              <div className="pl-6 border-l-4 border-[#16a34a] text-[#1a1a1a] leading-relaxed font-medium bg-[#f5f0e8]/30 py-4 pr-4 rounded-r-xl">
                {assessment.verdictSummary}
              </div>
            </div>
          </section>

          {/* 2.5. Readiness Score */}
          {assessment.readinessRating != null && (
            <section className="bg-white rounded-2xl p-10 border border-[#1a1a1a]/10 shadow-sm shadow-[#1a1a1a]/5 relative overflow-hidden group transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#16a34a]/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all group-hover:bg-[#16a34a]/10"></div>
              <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#999] mb-4 font-black font-mono-accent">Interview Readiness</p>
                  <div className={`relative inline-flex items-center justify-center w-36 h-36 rounded-full border-4 border-[#f5f0e8] shadow-sm ${(assessment.readinessRating * 10) >= 800 ? 'bg-[#16a34a]/5' : (assessment.readinessRating * 10) >= 600 ? 'bg-blue-500/5' : (assessment.readinessRating * 10) >= 400 ? 'bg-amber-500/5' : 'bg-red-500/5'}`}>
                    <div className="text-center">
                      <p className="text-5xl font-black tracking-tight text-[#1a1a1a]">{Math.round(assessment.readinessRating * 10)}</p>
                      <p className="text-[10px] text-[#999] font-bold uppercase tracking-widest mt-1">/ 1000</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-8 w-full">
                  <p className="text-sm text-[#6b6b6b] mb-4 font-bold font-mono-accent uppercase tracking-widest">Company Tier benchmarks:</p>
                  {[
                    { label: "Service Tier (TCS, Infosys)", threshold: 400, color: "bg-[#16a34a]" },
                    { label: "Product Tier (Flipkart, Paytm)", threshold: 600, color: "bg-blue-500" },
                    { label: "FAANG Tier (Google, Amazon)", threshold: 750, color: "bg-purple-500" },
                  ].map((tier, i) => {
                    const score = Math.round(assessment.readinessRating * 10);
                    const progress = Math.min(100, (score / tier.threshold) * 100);
                    const ready = score >= tier.threshold;
                    return (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-1">
                          <span className="text-[#1a1a1a]">{tier.label}</span>
                          <span className={ready ? 'text-[#16a34a]' : 'text-[#999]'}>{ready ? '✓ Certified Ready' : `${tier.threshold - score} pts needed`}</span>
                        </div>
                        <div className="w-full h-3 bg-[#f5f0e8] rounded-full overflow-hidden border border-[#1a1a1a]/5 p-0.5">
                          <div className={`h-full rounded-full transition-all duration-1000 shadow-sm ${tier.color}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* 3. Key Metrics Bar */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-10 rounded-2xl border border-[#1a1a1a]/10 shadow-sm shadow-[#1a1a1a]/5 transition-all hover:shadow-md">
            <div className="space-y-2">
              <p className="text-[10px] text-[#999] uppercase font-black tracking-widest">Performance Score</p>
              <p className="text-5xl font-black tracking-tight" style={{ color: donutColor }}>
                <span ref={scoreCounterRef}>0</span><span className="text-xl text-[#999]">/100</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-[#999] uppercase font-black tracking-widest">Questions Hit</p>
              <p className="text-5xl font-black text-[#1a1a1a] tracking-tight">{assessment.questionsAnswered} <span className="text-xl text-[#999]">/ {assessment.totalQuestions}</span></p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-[#999] uppercase font-black tracking-widest">Safety Incidents</p>
              <p className={`text-5xl font-black tracking-tight ${(assessment.proctoringReport?.totalViolations || 0) > 0 ? 'text-red-500' : 'text-[#16a34a]'}`}>
                {assessment.proctoringReport?.totalViolations || 0}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-[#999] uppercase font-black tracking-widest">Time Invested</p>
              <p className="text-5xl font-black text-[#1a1a1a] tracking-tight">{assessment.interviewDuration || 0} <span className="text-xl text-[#999]">min</span></p>
            </div>
          </section>

          {/* 4. Category Scores */}
          <section className="bg-white rounded-2xl p-10 border border-[#1a1a1a]/10 shadow-sm shadow-[#1a1a1a]/5 grid md:grid-cols-2 gap-12 transition-all hover:shadow-md">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#16a34a] shadow-[0_0_10px_rgba(22,163,74,0.4)]"></span>
                <h3 className="text-xl font-black text-[#1a1a1a] tracking-tight">Core Competencies</h3>
              </div>
              <div className="space-y-6">
                {assessment.categoryScores?.map((cat: any, i: number) => {
                  const map = getScoreColorMapping(cat.score);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider">{cat.category}</span>
                        <span className="text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest" style={{ backgroundColor: map.bg, color: map.text }}>{map.label} ({cat.score})</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#f5f0e8] rounded-full overflow-hidden border border-[#1a1a1a]/5 p-0.5">
                        <div className="bar-fill h-full rounded-full transition-all duration-1000 w-0 shadow-sm" style={{ backgroundColor: map.bar }} data-score={cat.score}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="h-72 relative bg-[#f5f0e8]/30 rounded-2xl border border-[#1a1a1a]/5 p-6">
              <canvas ref={radarChartRef}></canvas>
            </div>
          </section>

          {/* 5. Strengths vs Improvements */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-[#16a34a]/10 shadow-sm shadow-[#16a34a]/5 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#16a34a]/10 rounded-lg flex items-center justify-center">
                  <span className="text-[#16a34a] font-black">✓</span>
                </div>
                <h3 className="text-lg font-black text-[#1a1a1a] tracking-tight">Key Strengths</h3>
              </div>
              <ul className="space-y-4">
                {assessment.strengths?.map((s: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-[#6b6b6b] leading-relaxed font-medium">
                    <span className="text-[#16a34a] mt-0.5 text-xs">●</span> <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-amber-500/10 shadow-sm shadow-amber-500/5 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-amber-500 font-black">!</span>
                </div>
                <h3 className="text-lg font-black text-[#1a1a1a] tracking-tight">Critical Adjustments</h3>
              </div>
              <ul className="space-y-4">
                {assessment.areasForImprovement?.map((a: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-[#6b6b6b] leading-relaxed font-medium">
                    <span className="text-amber-500 mt-0.5 text-xs">●</span> <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="page-break"></div>

          {/* 6. Score Trend Chart */}
          <section className="bg-white rounded-2xl p-10 border border-[#1a1a1a]/10 shadow-sm shadow-[#1a1a1a]/5 transition-all hover:shadow-md">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#185FA5]"></span> Performance Trajectory
            </h3>
            <div className="w-full h-80 bg-[#f5f0e8]/30 rounded-2xl border border-[#1a1a1a]/5 p-6">
              <canvas ref={lineChartRef}></canvas>
            </div>
          </section>

          {/* 7. Question-by-question breakdown */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-3 h-3 rounded-full bg-[#16a34a]"></span>
              <h3 className="text-xl font-black text-[#1a1a1a] tracking-tight">Question Analysis</h3>
            </div>
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
          <section className="bg-white rounded-2xl p-10 border border-[#1a1a1a]/10 shadow-sm shadow-[#1a1a1a]/5 transition-all hover:shadow-md">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></span> 
              Communication Signals
            </h3>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#999] uppercase font-black tracking-widest">Speaking Pace</p>
                    <p className="text-2xl font-black text-[#1a1a1a]">{assessment.communicationAnalysis?.wordsPerMinute} <span className="text-xs text-[#999]">WPM</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#999] uppercase font-black tracking-widest">Fillers Detected</p>
                    <p className="text-2xl font-black text-red-500">{assessment.communicationAnalysis?.totalFillerCount}</p>
                  </div>
                </div>
                <div className="p-5 bg-[#f5f0e8]/50 rounded-xl border border-[#1a1a1a]/5">
                  <p className="text-xs text-[#6b6b6b] leading-relaxed font-medium italic">"{assessment.communicationAnalysis?.paceFeedback}"</p>
                </div>
              </div>
              <div className="h-56 relative bg-[#f5f0e8]/30 rounded-2xl border border-[#1a1a1a]/5 p-6">
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
            <section className="bg-white rounded-2xl p-10 border border-[#1a1a1a]/10 shadow-sm shadow-[#1a1a1a]/5 transition-all hover:shadow-md">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${(assessment.proctoringReport.totalViolations > 0) ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-[#16a34a] shadow-[0_0_10px_rgba(22,163,74,0.4)]'}`}></span> 
                Session Integrity Log
              </h3>
              {assessment.proctoringReport.totalViolations > 0 ? (
                <div className="space-y-6">
                  <ul className="space-y-4">
                    {assessment.proctoringReport.violations?.map((v: any, i: number) => (
                      <li key={i} className="flex gap-6 text-sm items-center bg-[#f5f0e8]/50 p-4 rounded-xl border border-[#1a1a1a]/5">
                        <span className="text-[#999] font-black font-mono text-xs w-16 uppercase tracking-widest">{v.timestamp}</span>
                        <span className="text-red-500 font-black uppercase text-[10px] bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">{v.type}</span>
                        <span className="text-[#1a1a1a] font-bold">Lost focus for {v.durationSeconds}s</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-5 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-sm text-red-800 font-medium leading-relaxed italic">"{assessment.proctoringReport.proctoringNote}"</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#16a34a]/5 border border-[#16a34a]/10 p-6 rounded-2xl text-[13px] text-[#16a34a] font-black uppercase tracking-widest flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#16a34a] rounded-lg flex items-center justify-center text-white text-xl shadow-lg shadow-[#16a34a]/20">✓</div>
                  Clean Session — Professional Integrity Maintained
                </div>
              )}
            </section>
          )}

          {/* 11. 7-Day Study Roadmap */}
          {assessment.studyRoadmap && assessment.studyRoadmap.length > 0 && (
            <section className="bg-white rounded-2xl p-10 border border-[#1a1a1a]/10 shadow-sm shadow-[#1a1a1a]/5 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-10">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"></span>
                <h3 className="text-xl font-black text-[#1a1a1a] tracking-tight">Growth Roadmap</h3>
              </div>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-[#1a1a1a]/10 before:to-transparent">
                {assessment.studyRoadmap.map((item: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a1a] text-white font-black text-xs shadow-xl shadow-[#1a1a1a]/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                      D{item.day}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-[#f5f0e8]/30 p-6 rounded-2xl border border-[#1a1a1a]/5 transition-all group-hover:bg-white group-hover:shadow-md">
                      <h4 className="font-black text-[#1a1a1a] mb-2 uppercase tracking-wide text-sm">{item.topic}</h4>
                      <p className="text-xs text-[#6b6b6b] italic mb-4 font-medium leading-relaxed">"{item.reason}"</p>
                      <div className="bg-white rounded-xl p-4 space-y-3 border border-[#1a1a1a]/5">
                        <p className="text-xs leading-relaxed"><span className="font-black text-[#1a1a1a] uppercase tracking-widest text-[9px] mr-2">Objective:</span> <span className="text-[#6b6b6b] font-medium">{item.practiceTarget}</span></p>
                        <div className="flex items-center gap-2 pt-2 border-t border-[#1a1a1a]/5">
                          <span className="text-[9px] font-black text-[#16a34a] uppercase tracking-widest">Top Resource:</span>
                          <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">{item.resource}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 12. Salary Estimator */}
          {assessment.salaryEstimate && (
            <section className="bg-[#1a1a1a] rounded-2xl p-10 text-white shadow-xl relative overflow-hidden group transition-all hover:shadow-md">
              <div className="absolute top-0 left-0 w-96 h-96 bg-[#16a34a]/10 blur-[120px] rounded-full -ml-48 -mt-48 transition-all group-hover:bg-[#16a34a]/20"></div>
              <h3 className="text-xl font-black mb-2 flex items-center gap-3 relative z-10">
                <span className="w-3 h-3 rounded-full bg-[#16a34a] shadow-[0_0_15px_rgba(22,163,74,0.6)]"></span>
                Salary Benchmark Report
              </h3>
              <p className="text-[11px] text-[#999] mb-8 font-mono-accent uppercase tracking-[0.2em] relative z-10 border-b border-white/5 pb-6">Based on your current technical depth and communication clarity</p>
              
              <div className="space-y-8 relative z-10">
                {[
                  { label: "Service Companies (TCS, Infosys, Wipro)", range: `${assessment.salaryEstimate.serviceCompanies?.min || 0} - ${assessment.salaryEstimate.serviceCompanies?.max || 0} ${assessment.salaryEstimate.serviceCompanies?.currency || 'LPA'}`, min: assessment.salaryEstimate.serviceCompanies?.min || 0, max: assessment.salaryEstimate.serviceCompanies?.max || 0, ceiling: 10, color: "from-[#16a34a] to-emerald-300" },
                  { label: "Indian Product (Paytm, Swiggy, Zomato)", range: `${assessment.salaryEstimate.indianProduct?.min || 0} - ${assessment.salaryEstimate.indianProduct?.max || 0} ${assessment.salaryEstimate.indianProduct?.currency || 'LPA'}`, min: assessment.salaryEstimate.indianProduct?.min || 0, max: assessment.salaryEstimate.indianProduct?.max || 0, ceiling: 30, color: "from-blue-500 to-indigo-300" },
                  { label: "FAANG / Tier-1 Product", range: `${assessment.salaryEstimate.faang?.min || 0} - ${assessment.salaryEstimate.faang?.max || 0} ${assessment.salaryEstimate.faang?.currency || 'LPA'}`, min: assessment.salaryEstimate.faang?.min || 0, max: assessment.salaryEstimate.faang?.max || 0, ceiling: 60, color: "from-purple-500 to-pink-300" }
                ].map((tier, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#999]">{tier.label}</span>
                      <span className="font-mono font-black text-xl text-white">{tier.range}</span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <div className={`h-full bg-gradient-to-r ${tier.color} rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${Math.min(100, ((tier.max || 1) / tier.ceiling) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Improvement Callout */}
              {assessment.areasForImprovement && assessment.areasForImprovement.length > 0 && (
                <div className="mt-10 p-6 bg-white/5 rounded-xl border border-white/5 relative z-10 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-10 h-10 bg-amber-400/20 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-amber-400 text-lg">💡</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-1">Upgrade Path</p>
                    <p className="text-sm text-[#999] leading-relaxed">
                      Improve <span className="text-white font-bold">{assessment.areasForImprovement.slice(0, 2).join(" & ")}</span> to unlock the next salary bracket.
                    </p>
                  </div>
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
          <footer className="text-center pt-8 border-t border-[#1a1a1a]/10">
            <p className="text-sm text-[#999] font-bold uppercase tracking-[0.2em] mb-4">PeakPrep — Practice Like It's Real</p>
            <div className="flex justify-center gap-4 no-print items-center">
              <button onClick={handleShare} className="text-gray-600 hover:text-gray-900 font-medium text-sm transition">Share Report</button>
              <span className="text-gray-300">|</span>
              <div className="scale-[0.8] origin-left">
                <DownloadReportButton reportData={reportData} />
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
