"use server";

import { db } from "@/firebase/admin";
import Groq from "groq-sdk";
import { updateReadinessScore } from "@/lib/actions/readiness.action";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function createSession(data: {
  targetRole: string;
  companyType: string;
  interviewType: string;
  codingRound: boolean;
  preferredLanguage: string;
  recordInterview: boolean;
  difficulty: string;
  personalityMode: string;
  detectedSkills: string[];
  keyTechnologies: string[];
  experienceLevel: string;
  resumeText: string;
  profileLinks: { platform: string; label: string; url: string }[];
}): Promise<string> {
  const { userId } = await auth();
  const sessionRef = await db.collection("sessions").add({
    userId: userId || "guest",
    position: data.targetRole,
    interviewType: data.interviewType,
    technicalStack: [...data.detectedSkills, ...data.keyTechnologies],
    experienceLevel: data.experienceLevel,
    queryList: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
    // Setup context for AI prompt
    targetRole: data.targetRole,
    companyType: data.companyType,
    codingRound: data.codingRound,
    preferredLanguage: data.preferredLanguage,
    recordInterview: data.recordInterview,
    difficulty: data.difficulty,
    personalityMode: data.personalityMode,
    detectedSkills: data.detectedSkills,
    keyTechnologies: data.keyTechnologies,
    resumeText: data.resumeText,
    profileLinks: data.profileLinks,
  });

  return sessionRef.id;
}

export async function getSessionById(id: string): Promise<any | null> {
  const sessionDoc = await db.collection("sessions").doc(id).get();

  if (!sessionDoc.exists) return null;

  return { id: sessionDoc.id, ...sessionDoc.data() };
}

export async function getPreviousScores(userId: string, limit: number = 4) {
  const snapshot = await db.collection("sessions")
    .where("userId", "==", userId)
    .where("isCompleted", "==", true)
    .orderBy("completedAt", "asc") // Get oldest to newest
    .get();

  const sessions = snapshot.docs.map(doc => doc.data());
  // Take the last `limit` sessions
  const recentSessions = sessions.slice(-limit);
  
  return recentSessions.map(s => ({
    overallScore: s.assessment?.overallScore || s.assessment?.score || 0,
    completedAt: s.completedAt
  }));
}

export async function saveTranscription(
  sessionId: string,
  transcript: { role: string; content: string }[],
  setupContext?: {
    targetRole?: string;
    companyType?: string;
    interviewType?: string;
    codingRound?: boolean;
    preferredLanguage?: string;
    experienceLevel?: string;
  },
  proctoringLog?: { timestamp: string; type: string; durationSeconds: number }[],
  bodyLanguageScore?: number,
  submittedCode?: string,
  codeExecuted?: boolean,
  codeCorrect?: boolean
) {
  let assessment = null;
  try {
    if (transcript && transcript.length > 0) {
      assessment = await analyzeTranscript(
        sessionId,
        transcript,
        setupContext,
        proctoringLog,
        submittedCode,
        codeExecuted,
        codeCorrect
      );
    }
  } catch (error) {
    console.error("Failed to analyze transcript:", error);
  }

  // Update readiness score if we have an assessment
  if (assessment?.overallScore) {
    try {
      const { userId } = await auth();
      await updateReadinessScore(userId || "guest", sessionId, assessment.overallScore);
    } catch (err) {
      console.error("Failed to update readiness score:", err);
    }
  }

  await db.collection("sessions").doc(sessionId).update({
    transcript,
    assessment,
    weakTopics: assessment?.weakTopics || [],
    proctoringLog: proctoringLog || [],
    bodyLanguageScore: bodyLanguageScore || 0,
    submittedCode: submittedCode || "",
    codeExecuted: codeExecuted || false,
    codeCorrect: codeCorrect || false,
    isCompleted: true,
    completedAt: new Date().toISOString(),
  });
}

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

Return ONLY a valid JSON object with this exact structure. No markdown. No text outside JSON.
Generate the feedback in English:

Full JSON schema — implement exactly
{
"candidateName": "string",
"sessionId": "string",
"generatedAt": "ISO timestamp string",
"overallScore": 0,
"grade": "A+ | A | B+ | B | C+ | C | D | F",
"readinessRating": 0,
"verdictSummary": "string (3-5 sentence honest overall assessment paragraph — be specific, name actual questions and answers)",
"interviewDuration": 0,
"totalQuestions": 0,
"questionsAnswered": 0,
"categoryScores": [
{
"category": "Technical Knowledge",
"score": 0,
"level": "Excellent | Good | Average | Poor",
"comment": "1 sentence specific observation"
},
{ "category": "Problem Solving", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": "" },
{ "category": "Code Quality", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": "" },
{ "category": "Communication", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": "" },
{ "category": "Confidence", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": "" },
{ "category": "Complexity Accuracy", "score": 0, "level": "Excellent | Good | Average | Poor", "comment": "" }
],
"strengths": ["string", "string", "string", "string"],
"areasForImprovement": ["string", "string", "string", "string"],
"questionBreakdown": [
{
"questionNumber": 0,
"questionText": "exact question the AI asked",
"candidateAnswer": "2-3 sentence summary of what candidate said",
"score": 0,
"level": "Excellent | Good | Average | Poor",
"feedback": "2 sentence specific critique of this answer",
"modelAnswer": "what a 10/10 answer would include — be detailed and technical",
"keyMistake": "single most important thing they got wrong — null if answered well"
}
],
"communicationAnalysis": {
"wordsPerMinute": 0,
"targetWpm": 145,
"fillerWords": [
{ "word": "basically", "count": 0 },
{ "word": "umm", "count": 0 },
{ "word": "like", "count": 0 },
{ "word": "you know", "count": 0 },
{ "word": "sort of", "count": 0 }
],
"totalFillerCount": 0,
"paceFeedback": "1 sentence on speaking pace",
"clarityScore": 0
},
"proctoringReport": {
"totalViolations": 0,
"scoreDeduction": 0,
"violations": [
{ "timestamp": "MM:SS", "type": "tab_switch | window_blur", "durationSeconds": 0 }
],
"proctoringNote": "1-2 sentence summary of proctoring behavior"
},
"codeAnalysis": {
"submitted": false,
"executedSuccessfully": false,
"correctnessScore": 0,
"codeQualityFeedback": "2 sentences on code quality, naming, structure",
"complexityStated": "what candidate said the Big-O was",
"complexityCorrect": false,
"complexityActual": "the real Big-O of their submitted solution"
},
"studyRoadmap": [
{
"day": 1,
"topic": "string",
"reason": "why this topic — reference specific failure in interview",
"resource": "specific free resource name (book/playlist/website)",
"practiceTarget": "concrete action e.g. solve 5 LeetCode mediums on DP"
}
],
"salaryEstimate": {
"serviceCompanies": { "min": 0, "max": 0, "currency": "LPA" },
"indianProduct": { "min": 0, "max": 0, "currency": "LPA" },
"faang": { "min": 0, "max": 0, "currency": "LPA" },
"salaryNote": "1 sentence explaining what to improve to reach next tier"
},
"nextRecommendation": {
"suggestedMode": "exact mode name from: Voice Standard | Coding Round | Debug Round | System Design | Company FAANG | Company Indian Product | Company Service | Resume Deep Dive | Concept Teach-Back | Rapid Fire",
"suggestedDifficulty": "Easy | Medium | Hard | Adaptive",
"suggestedCompany": "string",
"rationale": "2 sentence explanation for this recommendation",
"targetScore": 0,
"estimatedReadyInWeeks": 0
},
"scoreHistory": [],
"weakTopics": ["string — list 3-5 specific technical topics where the candidate showed weakness, e.g. Dynamic Programming, Graphs, System Design, Recursion, etc."]
}
`;

async function analyzeTranscript(
  sessionId: string,
  transcript: { role: string; content: string }[],
  setupContext?: {
    targetRole?: string;
    experienceLevel?: string;
    interviewType?: string;
    companyType?: string;
    preferredLanguage?: string;
  },
  proctoringLog?: { timestamp: string; type: string; durationSeconds: number }[],
  submittedCode?: string,
  codeExecuted?: boolean,
  codeCorrect?: boolean
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("GROQ_API_KEY is not set. Skipping transcript analysis.");
    return null;
  }

  const groq = new Groq({ apiKey });

  const formattedTranscript = transcript
    .map((e) => `${e.role === "assistant" ? "INTERVIEWER" : "CANDIDATE"}: ${e.content}`)
    .join("\n");

  const violations = proctoringLog || [];
  const violationTimestamps = violations
    .map((v) => `${v.type} at ${v.timestamp}`)
    .join(", ");

  const userPrompt = GROQ_USER_PROMPT_TEMPLATE
    .replace('{{targetRole}}', setupContext?.targetRole || "Software Engineer")
    .replace('{{experienceLevel}}', setupContext?.experienceLevel || "Not specified")
    .replace('{{interviewMode}}', setupContext?.interviewType || "Voice Standard")
    .replace('{{companyMode}}', setupContext?.companyType || "Standard")
    .replace('{{language}}', setupContext?.preferredLanguage || "English/TypeScript")
    .replace('{{formattedTranscript}}', formattedTranscript)
    .replace('{{proctoringViolations}}', violations.length.toString())
    .replace('{{violationTimestamps}}', violationTimestamps || "None")
    .replace('{{submittedCode}}', submittedCode || 'None')
    .replace('{{codeExecuted}}', codeExecuted ? 'Yes' : 'No')
    .replace('{{codeCorrect}}', codeCorrect ? 'Yes' : 'No');

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: GROQ_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const assessment = JSON.parse(content);
      
      // Merge scoreHistory from previous sessions before saving
      const { userId } = await auth();
      const user = await currentUser();
      const previousSessions = await getPreviousScores(userId || "guest", 4);
      
      assessment.scoreHistory = [
        ...previousSessions.map(s => ({ score: s.overallScore, date: s.completedAt })),
        { score: assessment.overallScore, date: new Date().toISOString() }
      ];
      
      // Override candidate name and session id for correctness
      assessment.candidateName = user?.fullName || "Candidate"; 
      assessment.sessionId = sessionId;

      return assessment;
    }
    return null;
  } catch (error) {
    console.error("Error calling Groq API or parsing JSON:", error);
    // Fallback logic could be implemented here
    return null;
  }
}


export async function getTranscription(sessionId: string) {
  const doc = await db.collection("sessions").doc(sessionId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    transcript: (data?.transcript || []) as { role: string; content: string }[],
    position: (data?.position || "") as string,
    interviewType: (data?.interviewType || "") as string,
    completedAt: (data?.completedAt || "") as string,
    technicalStack: (data?.technicalStack || []) as string[],
    assessment: data?.assessment || null,
    proctoringLog: (data?.proctoringLog || []) as any[],
    bodyLanguageScore: data?.bodyLanguageScore || 0,
    recordingUrl: (data?.recordingUrl || "") as string,
    submittedCode: (data?.submittedCode || "") as string,
  };
}

export async function saveRecordingUrl(sessionId: string, recordingUrl: string) {
  await db.collection("sessions").doc(sessionId).update({
    recordingUrl,
  });
}
