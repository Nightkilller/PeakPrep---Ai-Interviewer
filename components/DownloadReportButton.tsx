"use client";

import { useState } from "react";

interface DownloadReportButtonProps {
  reportData: {
    score: number;
    grade: string;
    gradeLabel: string;
    feedback: string;
    strengths: string[];
    areasForImprovement: string[];
    questionBreakdown?: { question: string; score: number; level: string; feedback: string }[];
    position?: string;
    interviewType?: string;
    completedAt?: string;
    candidateName?: string;
  };
}

export default function DownloadReportButton({ reportData }: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const gradeColors: Record<string, { bg: number[]; light: number[]; text: number[] }> = {
    A: { bg: [22, 163, 74], light: [220, 252, 231], text: [22, 163, 74] },
    B: { bg: [37, 99, 235], light: [219, 234, 254], text: [37, 99, 235] },
    C: { bg: [245, 158, 11], light: [254, 243, 199], text: [217, 119, 6] },
    D: { bg: [234, 88, 12], light: [255, 237, 213], text: [234, 88, 12] },
    E: { bg: [220, 38, 38], light: [254, 226, 226], text: [220, 38, 38] },
  };

  function getGradeKey(grade: string) {
    const g = grade?.toUpperCase() || "C";
    if (g.startsWith("A")) return "A";
    if (g.startsWith("B")) return "B";
    if (g.startsWith("C")) return "C";
    if (g.startsWith("D")) return "D";
    return "E";
  }

  function getLevelRgb(level: string): { bg: number[]; text: number[] } {
    const l = level?.toLowerCase() || "average";
    if (l === "excellent") return { bg: [220, 252, 231], text: [22, 163, 74] };
    if (l === "good") return { bg: [219, 234, 254], text: [37, 99, 235] };
    if (l === "average") return { bg: [254, 243, 199], text: [217, 119, 6] };
    return { bg: [254, 226, 226], text: [220, 38, 38] };
  }

  const gradeKey = getGradeKey(reportData.grade);
  const gc = gradeColors[gradeKey];

  const readinessLabel =
    reportData.score >= 85 ? "Interview Ready" :
    reportData.score >= 65 ? "Partially Ready" :
    reportData.score >= 45 ? "Needs Improvement" : "Not Ready";

  const readinessRgb =
    reportData.score >= 85 ? [22, 163, 74] :
    reportData.score >= 65 ? [245, 158, 11] :
    reportData.score >= 45 ? [234, 88, 12] : [220, 38, 38];

  const hireLabel =
    reportData.score >= 85 ? "Strong Hire" :
    reportData.score >= 70 ? "Lean Hire" :
    reportData.score >= 50 ? "Lean No Hire" : "No Hire";

  const hireRgb = reportData.score >= 70 ? [22, 163, 74] : [220, 38, 38];

  const formattedDate = reportData.completedAt
    ? new Date(reportData.completedAt).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
      })
    : null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const contentW = W - margin * 2;
      let y = 16;

      // ── Helpers ──
      const rgb = (c: number[]) => pdf.setTextColor(c[0], c[1], c[2]);
      const fillRgb = (c: number[]) => pdf.setFillColor(c[0], c[1], c[2]);
      const drawRgb = (c: number[]) => pdf.setDrawColor(c[0], c[1], c[2]);
      const gray = (hex: string) => {
        const v = parseInt(hex.replace("#", ""), 16);
        const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
        return [r, g, b];
      };

      const wrapText = (text: string, maxW: number, fontSize: number): string[] => {
        pdf.setFontSize(fontSize);
        return pdf.splitTextToSize(text, maxW);
      };

      const checkPage = (needed: number) => {
        if (y + needed > H - 12) {
          pdf.addPage();
          y = 16;
        }
      };

      const roundedRect = (x: number, ry: number, w: number, h: number, r: number, style: "F" | "S" | "FD" = "F") => {
        pdf.roundedRect(x, ry, w, h, r, r, style);
      };

      // ── Background ──
      pdf.setFillColor(245, 240, 232);
      pdf.rect(0, 0, W, H, "F");

      // ── Header badge ──
      fillRgb([22, 163, 74]);
      // Note: jsPDF does not have a setGlobalAlpha method, opacity is handled differently
      // Simple badge background
      const badgeText = "PEAKPREP — AI INTERVIEW PLATFORM";
      pdf.setFontSize(7);
      const badgeW = pdf.getTextWidth(badgeText) + 14;
      const badgeX = (W - badgeW) / 2;

      fillRgb([235, 251, 240]);
      roundedRect(badgeX, y, badgeW, 7, 2, "F");
      drawRgb([22, 163, 74]);
      roundedRect(badgeX, y, badgeW, 7, 2, "S");

      // Badge dot
      fillRgb([22, 163, 74]);
      pdf.circle(badgeX + 5, y + 3.5, 1.2, "F");

      // Badge text
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      rgb([22, 163, 74]);
      pdf.text(badgeText, badgeX + 9, y + 4.6);

      y += 14;

      // ── Title ──
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(26);
      rgb(gray("#1a1a1a"));
      const titlePart1 = "Interview ";
      const titlePart2 = "Report";
      const t1w = pdf.getTextWidth(titlePart1);
      const t2w = pdf.getTextWidth(titlePart2);
      const titleX = (W - t1w - t2w) / 2;
      pdf.text(titlePart1, titleX, y);
      rgb([22, 163, 74]);
      pdf.text(titlePart2, titleX + t1w, y);

      y += 6;

      // ── Subtitle meta ──
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      rgb(gray("#999999"));
      const metaParts = [reportData.position, reportData.interviewType, formattedDate].filter(Boolean);
      const metaStr = metaParts.join("  •  ");
      pdf.text(metaStr, W / 2, y, { align: "center" });

      y += 12;

      // ━━━ ROW 1: REPORT CARD ━━━
      const cardH = 52;
      checkPage(cardH);
      const cardY = y;

      // Card bg
      pdf.setFillColor(255, 255, 255);
      drawRgb(gray("#e0e0e0"));
      roundedRect(margin, cardY, contentW, cardH, 3, "FD");

      // -- Grade box
      const gradeBoxX = margin + 8;
      const gradeBoxY = cardY + 6;
      fillRgb(gc.light);
      drawRgb(gc.bg);
      pdf.setLineWidth(0.6);
      roundedRect(gradeBoxX, gradeBoxY, 24, 24, 3, "FD");
      pdf.setLineWidth(0.2);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      rgb(gc.bg);
      pdf.text(reportData.grade, gradeBoxX + 12, gradeBoxY + 16, { align: "center" });

      // Grade label
      pdf.setFontSize(6);
      rgb(gc.bg);
      pdf.text(reportData.gradeLabel, gradeBoxX + 12, gradeBoxY + 28, { align: "center" });

      // Hire label
      pdf.setFontSize(7);
      rgb(hireRgb);
      pdf.text(hireLabel, gradeBoxX + 12, gradeBoxY + 33, { align: "center" });

      // -- Feedback section
      const fbX = margin + 38;
      const fbMaxW = contentW - 80;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      rgb(gray("#1a1a1a"));
      const perfLabel = reportData.score >= 85 ? "Excellent Performance" : reportData.score >= 65 ? "Good Performance" : "Needs Improvement";
      pdf.text(perfLabel, fbX, cardY + 12);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      rgb(gray("#555555"));
      const fbLines = wrapText(reportData.feedback || "", fbMaxW, 8);
      pdf.text(fbLines.slice(0, 5), fbX, cardY + 18);

      // -- Score ring (right side)
      const ringCX = margin + contentW - 22;
      const ringCY = cardY + 22;
      const ringR = 14;

      // Background circle
      drawRgb(gray("#e5e7eb"));
      pdf.setLineWidth(2.5);
      pdf.circle(ringCX, ringCY, ringR, "S");

      // Score arc
      drawRgb(gc.bg);
      pdf.setLineWidth(2.5);
      const startAngle = -90;
      const endAngle = startAngle + (reportData.score / 100) * 360;
      // Draw arc by many small segments
      const steps = Math.max(2, Math.floor(reportData.score / 2));
      for (let i = 0; i < steps; i++) {
        const a1 = ((startAngle + (i / steps) * (endAngle - startAngle)) * Math.PI) / 180;
        const a2 = ((startAngle + ((i + 1) / steps) * (endAngle - startAngle)) * Math.PI) / 180;
        const x1 = ringCX + ringR * Math.cos(a1);
        const y1 = ringCY + ringR * Math.sin(a1);
        const x2 = ringCX + ringR * Math.cos(a2);
        const y2 = ringCY + ringR * Math.sin(a2);
        pdf.line(x1, y1, x2, y2);
      }

      pdf.setLineWidth(0.2);

      // Score text inside
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      rgb(gray("#1a1a1a"));
      pdf.text(String(reportData.score), ringCX, ringCY + 1, { align: "center" });

      pdf.setFontSize(6);
      rgb(gray("#999999"));
      pdf.text("/100", ringCX, ringCY + 5, { align: "center" });

      // Readiness label
      pdf.setFontSize(7);
      rgb(readinessRgb);
      pdf.text(readinessLabel, ringCX, ringCY + ringR + 6, { align: "center" });

      y = cardY + cardH + 6;

      // ━━━ ROW 2: STRENGTHS + WEAKNESSES (side by side) ━━━
      const colW = (contentW - 4) / 2;
      const sItems = reportData.strengths || [];
      const wItems = reportData.areasForImprovement || [];

      // Calculate heights
      pdf.setFontSize(8);
      const sLineCount = sItems.reduce((acc, s) => acc + wrapText(s, colW - 16, 8).length, 0);
      const wLineCount = wItems.reduce((acc, a) => acc + wrapText(a, colW - 16, 8).length, 0);
      const sH = Math.max(30, 20 + sLineCount * 4);
      const wH = Math.max(30, 20 + wLineCount * 4);
      const rowH = Math.max(sH, wH);

      checkPage(rowH);
      const row2Y = y;

      // Strengths card
      pdf.setFillColor(255, 255, 255);
      drawRgb(gray("#e0e0e0"));
      roundedRect(margin, row2Y, colW, rowH, 3, "FD");

      // Strengths badge
      fillRgb([22, 163, 74]);
      roundedRect(margin + 8, row2Y + 6, 26, 6, 2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      rgb([255, 255, 255]);
      pdf.text("\u2713 Strengths", margin + 10, row2Y + 10.2);

      // Strengths items
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      let sy = row2Y + 18;
      sItems.forEach((s) => {
        const lines = wrapText(s, colW - 16, 8);
        fillRgb([22, 163, 74]);
        pdf.circle(margin + 10, sy - 0.5, 0.8, "F");
        rgb(gray("#1a1a1a"));
        pdf.text(lines, margin + 14, sy);
        sy += lines.length * 4;
      });

      // Weaknesses card
      const wX = margin + colW + 4;
      pdf.setFillColor(255, 255, 255);
      drawRgb(gray("#e0e0e0"));
      roundedRect(wX, row2Y, colW, rowH, 3, "FD");

      // Weaknesses badge
      fillRgb([234, 88, 12]);
      roundedRect(wX + 8, row2Y + 6, 34, 6, 2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      rgb([255, 255, 255]);
      pdf.text("\u26A0 Areas to Improve", wX + 10, row2Y + 10.2);

      // Weaknesses items
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      let wy = row2Y + 18;
      wItems.forEach((a) => {
        const lines = wrapText(a, colW - 16, 8);
        fillRgb([234, 88, 12]);
        pdf.circle(wX + 10, wy - 0.5, 0.8, "F");
        rgb(gray("#1a1a1a"));
        pdf.text(lines, wX + 14, wy);
        wy += lines.length * 4;
      });

      y = row2Y + rowH + 6;

      // ━━━ ROW 3: QUESTION BREAKDOWN ━━━
      const qb = reportData.questionBreakdown || [];
      if (qb.length > 0) {
        // Header
        checkPage(20);
        const qcardY = y;

        pdf.setFillColor(255, 255, 255);
        drawRgb(gray("#e0e0e0"));
        roundedRect(margin, qcardY, contentW, 12, 3, "FD");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        rgb(gray("#1a1a1a"));
        pdf.text("Question-wise Analysis", margin + 8, qcardY + 7.5);

        pdf.setFontSize(6.5);
        rgb(gray("#999999"));
        pdf.text(`${qb.length} QUESTIONS`, margin + 60, qcardY + 7.5);

        y = qcardY + 14;

        // Table header
        checkPage(8);
        pdf.setFillColor(250, 250, 248);
        pdf.rect(margin, y, contentW, 7, "F");
        drawRgb(gray("#e8e8e8"));
        pdf.line(margin, y + 7, margin + contentW, y + 7);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6);
        rgb(gray("#999999"));
        pdf.text("QUESTION", margin + 6, y + 4.5);
        pdf.text("AI EVALUATION", margin + contentW * 0.42, y + 4.5);
        pdf.text("SCORE", margin + contentW * 0.78, y + 4.5);

        y += 9;

        // Question rows
        qb.forEach((q, i) => {
          const qlc = getLevelRgb(q.level);
          const qLines = wrapText(q.question, contentW * 0.36, 8);
          const fLines = wrapText(q.feedback, contentW * 0.3, 7);
          const rowHeight = Math.max(12, Math.max(qLines.length, fLines.length) * 3.5 + 6);

          checkPage(rowHeight);

          // Row background on new pages
          pdf.setFillColor(255, 255, 255);
          pdf.rect(margin, y, contentW, rowHeight, "F");

          if (i < qb.length - 1) {
            drawRgb(gray("#eeeeee"));
            pdf.line(margin + 4, y + rowHeight, margin + contentW - 4, y + rowHeight);
          }

          // Question number
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(6);
          rgb(gray("#bbbbbb"));
          pdf.text(`Q${i + 1}`, margin + 6, y + 4);

          // Question text
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          rgb(gray("#1a1a1a"));
          pdf.text(qLines, margin + 6, y + 8);

          // Feedback
          fillRgb(qlc.text);
          pdf.circle(margin + contentW * 0.42, y + 5.5, 0.8, "F");
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          rgb(gray("#555555"));
          pdf.text(fLines, margin + contentW * 0.42 + 4, y + 6);

          // Score box
          const scoreBoxX = margin + contentW * 0.78;
          fillRgb(qlc.bg);
          drawRgb(qlc.text);
          pdf.setLineWidth(0.4);
          roundedRect(scoreBoxX, y + 2, 10, 10, 2, "FD");
          pdf.setLineWidth(0.2);

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          rgb(qlc.text);
          pdf.text(String(q.score), scoreBoxX + 5, y + 8.5, { align: "center" });

          // Level badge
          fillRgb(qlc.bg);
          roundedRect(scoreBoxX + 14, y + 4, 16, 5, 1.5, "F");
          pdf.setFontSize(5.5);
          rgb(qlc.text);
          pdf.text((q.level || "").toUpperCase(), scoreBoxX + 22, y + 7.5, { align: "center" });

          y += rowHeight + 1;
        });
      }

      // ━━━ FOOTER ━━━
      y += 6;
      checkPage(10);

      drawRgb(gray("#e0e0e0"));
      pdf.line(margin, y, margin + contentW, y);

      y += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      rgb(gray("#bbbbbb"));
      const footerDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      pdf.text(`Generated by PeakPrep  •  peakprep.ai  •  ${footerDate}`, W / 2, y, { align: "center" });

      // Save
      const filename = `peakprep-report-${reportData.position?.replace(/\s+/g, "-").toLowerCase() || "interview"}-${Date.now()}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="px-8 py-3 bg-[#1a1a1a] hover:bg-[#333] text-white font-bold rounded-full transition-all transform hover:scale-[1.02] text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Generating PDF…
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  );
}
