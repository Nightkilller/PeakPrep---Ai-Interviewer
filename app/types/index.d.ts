interface InterviewSession {
  id: string;
  position: string;
  experienceLevel: string;
  queryList: string[];
  technicalStack: string[];
  createdAt: string;
  userId: string;
  interviewType: string;
  isCompleted: boolean;
  proctoringLog?: { timestamp: string; type: string; durationSeconds: number }[];
  bodyLanguageScore?: number;
  transcript?: { role: string; content: string }[];
  completedAt?: string;
  setupContext?: {
    targetRole?: string;
    experienceLevel?: string;
    personalityMode?: string;
  };
  submittedCode?: string;
  codeExecuted?: boolean;
  codeCorrect?: boolean;
  weakTopics?: string[];
  assessment?: {
    candidateName: string;
    sessionId: string;
    generatedAt: string;
    overallScore: number;
    grade: string;
    readinessRating: number;
    verdictSummary: string;
    interviewDuration: number;
    totalQuestions: number;
    questionsAnswered: number;
    categoryScores: {
      category: string;
      score: number;
      level: string;
      comment: string;
    }[];
    strengths: string[];
    areasForImprovement: string[];
    questionBreakdown: {
      questionNumber: number;
      questionText: string;
      candidateAnswer: string;
      score: number;
      level: string;
      feedback: string;
      modelAnswer: string;
      keyMistake: string | null;
    }[];
    communicationAnalysis: {
      wordsPerMinute: number;
      targetWpm: number;
      fillerWords: { word: string; count: number }[];
      totalFillerCount: number;
      paceFeedback: string;
      clarityScore: number;
    };
    proctoringReport: {
      totalViolations: number;
      scoreDeduction: number;
      violations: { timestamp: string; type: string; durationSeconds: number }[];
      proctoringNote: string;
    };
    codeAnalysis?: {
      submitted: boolean;
      executedSuccessfully: boolean;
      correctnessScore: number;
      codeQualityFeedback: string;
      complexityStated: string;
      complexityCorrect: boolean;
      complexityActual: string;
    };
    weakTopics?: string[];
    studyRoadmap: {
      day: number;
      topic: string;
      reason: string;
      resource: string;
      practiceTarget: string;
    }[];
    salaryEstimate: {
      serviceCompanies: { min: number; max: number; currency: string };
      indianProduct: { min: number; max: number; currency: string };
      faang: { min: number; max: number; currency: string };
      salaryNote: string;
    };
    nextRecommendation: {
      suggestedMode: string;
      suggestedDifficulty: string;
      suggestedCompany: string;
      rationale: string;
      targetScore: number;
      estimatedReadyInWeeks: number;
    };
    scoreHistory: { score: number; date: string }[];
  };
  // Setup context fields
  targetRole?: string;
  companyType?: string;
  codingRound?: boolean;
  preferredLanguage?: string;
  recordInterview?: boolean;
  recordingUrl?: string;
  difficulty?: string;
  detectedSkills?: string[];
  keyTechnologies?: string[];
  profileLinks?: { platform: string; label: string; url: string }[];
  resumeText?: string;
}

interface PlacementDrive {
  id: string;
  company: string;
  examName: string;
  date: string; // ISO date
  logo: string; // emoji
  eligibility: string;
  packageRange: string;
  requiredReadiness: number;
  category: "service" | "product" | "faang";
  description: string;
}

interface Experience {
  id?: string;
  company: string;
  role: string;
  city: string;
  year: number;
  rounds: {
    name: string;
    description: string;
    questions: string[];
    difficulty: string;
  }[];
  difficulty: string;
  outcome: string;
  tips: string;
  submittedAt: string;
  submittedBy: string;
}

interface ReadinessProfile {
  userId: string;
  currentScore: number;
  history: { score: number; date: string; sessionId: string }[];
  totalSessions: number;
  streak: number;
  lastSessionDate: string;
}

interface WeaknessEntry {
  topic: string;
  failCount: number;
  totalAttempts: number;
  avgScore: number;
  lastSeen: string;
}

interface VoiceAgentProps {
  candidateName: string;
  userId?: string;
  sessionId?: string;
  mode: "generate" | "interview";
  queryList?: string[];
  // Setup context for AI prompt
  setupContext?: {
    targetRole?: string;
    companyType?: string;
    interviewType?: string;
    codingRound?: boolean;
    preferredLanguage?: string;
    recordInterview?: boolean;
    difficulty?: string;
    detectedSkills?: string[];
    keyTechnologies?: string[];
    experienceLevel?: string;
    resumeText?: string;
    personalityMode?: string;
  };
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface TechnologyIconProps {
  technicalStack: string[];
}

export type { RouteParams, VoiceAgentProps, InterviewSession, PlacementDrive, Experience, ReadinessProfile, WeaknessEntry, TechnologyIconProps };
