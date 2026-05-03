import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import Groq from "groq-sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { updateReadinessScore, getPreviousScores } from "@/lib/actions/readiness.action";

const GROQ_SYSTEM_PROMPT = `
You are an expert senior technical interviewer and performance analyst. You evaluate technical interview transcripts and return a comprehensive, honest, actionable performance report. You are direct, specific, and never vague. You always return valid JSON and nothing else — no markdown, no preamble, no explanation outside the JSON object.
`;

const GROQ_USER_PROMPT_TEMPLATE = `
Analyze the following technical interview transcript for the position of {{targetRole}} at experience level {{experienceLevel}}. Interview mode: {{interviewMode}}. Company mode: {{companyMode}}. Language used: {{language}}.

TRANSCRIPT:
{{formattedTranscript}}

PROCTORING DATA:
{{proctoringViolations}} violations detected. Violation timestamps: {{violationTimestamps}}

CODE SUBMITTED (if coding round):
{{submittedCode}}
Code executed successfully: {{codeExecuted}}. Output matched expected: {{codeCorrect}}.

Return ONLY a valid JSON object. No markdown. No text outside JSON.
Generate feedback in English.

JSON schema:
{
"candidateName": "string",
"sessionId": "string",
"generatedAt": "ISO timestamp string",
"overallScore": 0,
"grade": "A+ | A | B+ | B | C+ | C | D | F",
"readinessRating": 0,
"verdictSummary": "3-5 sentence honest overall assessment paragraph",
"interviewDuration": 0,
"totalQuestions": 0,
"questionsAnswered": 0,
"categoryScores": [
{"category": "Technical Knowledge", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": "1 sentence observation"},
{"category": "Problem Solving", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": ""},
{"category": "Code Quality", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": ""},
{"category": "Communication", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": ""},
{"category": "Confidence", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": ""},
{"category": "Complexity Accuracy", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": ""}
],
"strengths": ["string", "string", "string"],
"areasForImprovement": ["string", "string", "string"],
"questionBreakdown": [
{
"questionNumber": 0,
"questionText": "exact question asked",
"candidateAnswer": "2-3 sentence summary",
"score": 0,
"level": "Excellent | Good | Average | Poor",
"feedback": "2 sentence critique",
"modelAnswer": "what a 10/10 answer includes",
"keyMistake": "most important mistake or null"
}
],
"communicationAnalysis": {
"wordsPerMinute": 0,
"targetWpm": 145,
"fillerWords": [
{"word": "basically", "count": 0},
{"word": "umm", "count": 0},
{"word": "like", "count": 0},
{"word": "you know", "count": 0},
{"word": "sort of", "count": 0}
],
"totalFillerCount": 0,
"paceFeedback": "1 sentence on speaking pace",
"clarityScore": 0
},
"proctoringReport": {
"totalViolations": 0,
"scoreDeduction": 0,
"violations": [{"timestamp": "MM:SS", "type": "tab_switch | window_blur", "durationSeconds": 0}],
"proctoringNote": "1-2 sentence summary"
},
"codeAnalysis": {
"submitted": false,
"executedSuccessfully": false,
"correctnessScore": 0,
"codeQualityFeedback": "2 sentences on code quality",
"complexityStated": "what candidate said Big-O was",
"complexityCorrect": false,
"complexityActual": "real Big-O of solution"
},
"studyRoadmap": [
{
"day": 1,
"topic": "string",
"reason": "why this topic",
"resource": "specific free resource name",
"practiceTarget": "concrete action"
}
],
"salaryEstimate": {
"serviceCompanies": {"min": 0, "max": 0, "currency": "LPA"},
"indianProduct": {"min": 0, "max": 0, "currency": "LPA"},
"faang": {"min": 0, "max": 0, "currency": "LPA"},
"salaryNote": "1 sentence on improvement"
},
"nextRecommendation": {
"suggestedMode": "Voice Standard",
"suggestedDifficulty": "Easy | Medium | Hard | Adaptive",
"suggestedCompany": "string",
"rationale": "2 sentence explanation",
"targetScore": 0,
"estimatedReadyInWeeks": 0
},
"scoreHistory": [],
"weakTopics": ["list 3-5 specific weak topics"]
}
`;

export const maxDuration = 300; // 5 min timeout on Vercel Pro, 60s on hobby

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const sessionDoc = await db.collection("sessions").doc(sessionId).get();
    if (!sessionDoc.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const sessionData = sessionDoc.data()!;

    // If already generated, return it immediately
    if (sessionData.assessment) {
      return NextResponse.json({ assessment: sessionData.assessment });
    }

    const transcript = sessionData.transcript || [];
    if (transcript.length === 0) {
      return NextResponse.json({ error: "No transcript found. Make sure to speak during the interview." }, { status: 422 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const formattedTranscript = transcript
      .map((e: any) => `${e.role === "assistant" ? "INTERVIEWER" : "CANDIDATE"}: ${e.content}`)
      .join("\n");

    const violations = sessionData.proctoringLog || [];
    const violationTimestamps = violations.map((v: any) => `${v.type} at ${v.timestamp}`).join(", ");
    const setupContext = sessionData.setupContext || {};

    const userPrompt = GROQ_USER_PROMPT_TEMPLATE
      .replace("{{targetRole}}", setupContext.targetRole || "Software Engineer")
      .replace("{{experienceLevel}}", setupContext.experienceLevel || "Not specified")
      .replace("{{interviewMode}}", setupContext.interviewType || "Voice Standard")
      .replace("{{companyMode}}", setupContext.companyType || "Standard")
      .replace("{{language}}", setupContext.preferredLanguage || "English")
      .replace("{{formattedTranscript}}", formattedTranscript)
      .replace("{{proctoringViolations}}", violations.length.toString())
      .replace("{{violationTimestamps}}", violationTimestamps || "None")
      .replace("{{submittedCode}}", sessionData.submittedCode || "None")
      .replace("{{codeExecuted}}", sessionData.codeExecuted ? "Yes" : "No")
      .replace("{{codeCorrect}}", sessionData.codeCorrect ? "Yes" : "No");

    let content: string | null = null;

    // Try 70B first, fall back to 8B if rate-limited or timed out
    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: GROQ_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });
      content = response.choices[0]?.message?.content || null;
    } catch (e: any) {
      console.warn("70B failed, falling back to 8B:", e?.message);
      const fallback = await groq.chat.completions.create({
        messages: [
          { role: "system", content: GROQ_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });
      content = fallback.choices[0]?.message?.content || null;
    }

    if (!content) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    let assessment: any;
    try {
      assessment = JSON.parse(content);
    } catch {
      console.error("JSON parse failed. Raw content:", content.substring(0, 500));
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    // Enrich with user data
    try {
      const { userId } = await auth();
      const user = await currentUser();
      assessment.candidateName = user?.fullName || "Candidate";
      assessment.sessionId = sessionId;

      const previousSessions = await getPreviousScores(userId || "guest", 4);
      assessment.scoreHistory = [
        ...previousSessions.map((s: any) => ({ score: s.overallScore, date: s.completedAt })),
        { score: assessment.overallScore || 0, date: new Date().toISOString() },
      ];

      if (assessment.overallScore) {
        await updateReadinessScore(userId || "guest", sessionId, assessment.overallScore);
      }
    } catch (enrichError) {
      console.warn("Could not enrich with user data:", enrichError);
    }

    // Persist to Firestore
    await db.collection("sessions").doc(sessionId).update({
      assessment,
      weakTopics: assessment.weakTopics || [],
      isCompleted: true,
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({ assessment });
  } catch (err: any) {
    console.error("GENERATE-REPORT ERROR:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
