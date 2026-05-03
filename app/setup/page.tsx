"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    FileText,
    CheckCircle2,
    ChevronDown,
    Sparkles,
    ArrowRight,
    Loader2,
    X,
    Code2,
    Briefcase,
    Building2,
    Cpu,
    Link2,
    Plus,
    Trash2,
    MessageSquareText,
    BarChart3,
    Video,
} from "lucide-react";

const profilePlatforms = [
    { value: "leetcode", label: "LeetCode", color: "#FFA116" },
    { value: "codechef", label: "CodeChef", color: "#5B4638" },
    { value: "codeforces", label: "Codeforces", color: "#1F8ACB" },
    { value: "hackerrank", label: "HackerRank", color: "#2EC866" },
    { value: "linkedin", label: "LinkedIn", color: "#0A66C2" },
    { value: "github", label: "GitHub", color: "#1a1a1a" },
    { value: "portfolio", label: "Portfolio", color: "#16a34a" },
    { value: "other", label: "Other", color: "#6b6b6b" },
];

interface ProfileLink {
    platform: string;
    label: string;
    color: string;
    url: string;
}
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { createSession } from "@/lib/actions/general.action";

const targetRoles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "ML Engineer",
    "DevOps Engineer",
    "Mobile Developer",
    "QA Engineer",
    "Cloud Architect",
    "Product Manager",
];

const companyTypes = [
    "Product-Based (FAANG, etc.)",
    "Service-Based",
    "Startup",
    "Enterprise / Corporate",
    "Government / Public Sector",
];

const interviewTypes = [
    "Technical",
    "Behavioral",
    "System Design",
    "Technical + Coding",
    "Full Loop (All Rounds)",
];

const programmingLanguages = [
    "JavaScript / TypeScript",
    "Python",
    "Java",
    "C++",
    "Go",
    "Rust",
    "C#",
    "Ruby",
    "Swift",
    "Kotlin",
];

export default function SetupPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Resume state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
    const [experienceLevel, setExperienceLevel] = useState("");
    const [keyTechnologies, setKeyTechnologies] = useState<string[]>([]);
    const [resumeText, setResumeText] = useState("");
    const [parseError, setParseError] = useState("");
    const [atsScore, setAtsScore] = useState<number | null>(null);

    // Preferences state
    const [targetRole, setTargetRole] = useState("");
    const [companyType, setCompanyType] = useState("");
    const [interviewType, setInterviewType] = useState("");
    const [codingRound, setCodingRound] = useState(false);
    const [preferredLanguage, setPreferredLanguage] = useState("");
    const [difficulty, setDifficulty] = useState("Adaptive");
    const [personalityMode, setPersonalityMode] = useState("Friendly HR");

    // Profile links state
    const [profileLinks, setProfileLinks] = useState<ProfileLink[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [profileUrl, setProfileUrl] = useState("");
    const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Dropdown open states
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
    const [interviewTypeDropdownOpen, setInterviewTypeDropdownOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);

    const handleFileUpload = async (file: File) => {
        setUploadedFile(file);
        setIsAnalyzing(true);
        setAnalysisComplete(false);
        setParseError("");

        try {
            const formData = new FormData();
            formData.append("resume", file);

            const res = await fetch("/api/parse-resume", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to parse resume");
            }

            setDetectedSkills(data.detectedSkills);
            setKeyTechnologies(data.keyTechnologies);
            setExperienceLevel(data.experienceLevel);
            setAtsScore(data.atsScore);
            setResumeText(data.resumeText || "");
            setAnalysisComplete(true);
        } catch (error: any) {
            console.error("Resume parse error:", error);
            setParseError(error.message || "Failed to analyze resume. Please try again.");
            setUploadedFile(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    const removeFile = () => {
        setUploadedFile(null);
        setIsAnalyzing(false);
        setAnalysisComplete(false);
        setDetectedSkills([]);
        setKeyTechnologies([]);
        setExperienceLevel("");
        setResumeText("");
        setParseError("");
        setAtsScore(null);
    };

    const addProfileLink = () => {
        if (!selectedPlatform || !profileUrl.trim()) return;
        const platform = profilePlatforms.find((p) => p.value === selectedPlatform);
        if (!platform) return;
        setProfileLinks((prev) => [
            ...prev,
            {
                platform: platform.value,
                label: platform.label,
                color: platform.color,
                url: profileUrl.trim(),
            },
        ]);
        setSelectedPlatform("");
        setProfileUrl("");
    };

    const removeProfileLink = (index: number) => {
        setProfileLinks((prev) => prev.filter((_, i) => i !== index));
    };

    const isFormComplete =
        analysisComplete && targetRole && companyType && interviewType;

    const calculateLinkBonus = () => {
        let bonus = 0;
        profileLinks.forEach(link => {
            // Give points for competitive programming profiles based on theoretical problems solved
            if (link.platform === "leetcode") bonus += 8; 
            if (link.platform === "codeforces") bonus += 12;
            if (link.platform === "hackerrank") bonus += 5;
            if (link.platform === "github") bonus += 5;
        });
        return bonus;
    };

    const displayAtsScore = atsScore !== null ? Math.min(99, atsScore + calculateLinkBonus()) : null;

    return (
        <div className="min-h-screen relative bg-[#f5f0e8] noise-bg grid-bg">
            <Navbar />

            {/* Hero Section */}
            <section className="px-4 sm:px-8 lg:px-16 pt-36 pb-16 max-w-7xl mx-auto relative z-10">
                <ScrollReveal>
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-md mb-6">
                                <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                                <span className="font-mono-accent text-[#16a34a] text-xs">
                                    Interview Setup
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-6 leading-tight">
                                Set Up Your{" "}
                                <span className="text-[#16a34a]">Interview</span>
                            </h1>
                            <p className="text-lg text-[#6b6b6b] max-w-xl leading-relaxed">
                                Upload your resume and configure your interview preferences to
                                begin your personalized AI assessment.
                            </p>
                        </div>
                        {/* Abstract tech graphic */}
                        <div className="hidden lg:flex items-center justify-center w-64 h-64">
                            <div className="relative">
                                <div className="w-48 h-48 rounded-2xl border-2 border-[#16a34a]/20 bg-[#16a34a]/5 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-xl border-2 border-[#16a34a]/30 bg-white flex items-center justify-center">
                                        <Cpu className="w-16 h-16 text-[#16a34a]/60" />
                                    </div>
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center animate-float">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#1a1a1a] rounded-md flex items-center justify-center">
                                    <Code2 className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            <div className="border-t border-[#1a1a1a]/10 mx-4 sm:mx-8 lg:mx-16"></div>

            {/* Step 1: Resume Upload */}
            <section className="px-4 sm:px-8 lg:px-16 py-20 max-w-7xl mx-auto relative z-10">
                <ScrollReveal>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#16a34a] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            1
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-[#1a1a1a]">
                                Upload Your Resume
                            </h2>
                            <p className="text-[#6b6b6b] text-sm mt-1">
                                Your resume will be analyzed to personalize your interview
                                questions.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={100}>
                    <div className="bg-white rounded-xl border border-[#1a1a1a]/15 p-8 card-lift">
                        {parseError && (
                            <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <X className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-red-600 text-sm font-medium">
                                    {parseError}
                                </span>
                            </div>
                        )}
                        {!uploadedFile ? (
                            <div
                                className="border-2 border-dashed border-[#1a1a1a]/20 rounded-xl p-12 text-center cursor-pointer hover:border-[#16a34a]/50 hover:bg-[#16a34a]/5 transition-all"
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.doc"
                                    className="hidden"
                                    onChange={handleFileInput}
                                />
                                <Upload className="w-12 h-12 text-[#6b6b6b] mx-auto mb-4" />
                                <p className="text-lg font-bold text-[#1a1a1a] mb-2">
                                    Drag & Drop your resume here
                                </p>
                                <p className="text-[#6b6b6b] text-sm mb-4">
                                    or click to browse files
                                </p>
                                <span className="inline-block px-4 py-2 bg-[#f5f0e8] text-[#6b6b6b] text-xs font-mono-accent rounded-md">
                                    PDF, DOCX supported
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* File Preview */}
                                <div className="flex items-center justify-between p-4 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#16a34a]/10 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-[#16a34a]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#1a1a1a] text-sm">
                                                {uploadedFile.name}
                                            </p>
                                            <p className="text-[#6b6b6b] text-xs font-mono-accent">
                                                {(uploadedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {analysisComplete && (
                                            <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
                                        )}
                                        {isAnalyzing && (
                                            <Loader2 className="w-5 h-5 text-[#16a34a] animate-spin" />
                                        )}
                                        <button
                                            onClick={removeFile}
                                            className="w-8 h-8 rounded-md hover:bg-[#1a1a1a]/10 flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4 text-[#6b6b6b]" />
                                        </button>
                                    </div>
                                </div>

                                {/* Analysis */}
                                {isAnalyzing && (
                                    <div className="flex items-center gap-3 p-4 bg-[#16a34a]/5 border border-[#16a34a]/20 rounded-lg">
                                        <Loader2 className="w-5 h-5 text-[#16a34a] animate-spin" />
                                        <span className="text-[#16a34a] text-sm font-bold">
                                            Analyzing Resume…
                                        </span>
                                    </div>
                                )}

                                {analysisComplete && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-4 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/10">
                                            <p className="text-xs font-mono-accent text-[#6b6b6b] mb-3">
                                                ✔ Skills Detected
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {detectedSkills.map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="px-3 py-1 bg-white text-[#1a1a1a] text-xs font-bold rounded-md border border-[#1a1a1a]/10"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/10">
                                            <p className="text-xs font-mono-accent text-[#6b6b6b] mb-3">
                                                ✔ Experience Level
                                            </p>
                                            <span className="px-3 py-1 bg-[#16a34a]/10 text-[#16a34a] text-sm font-bold rounded-md">
                                                {experienceLevel}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/10">
                                            <p className="text-xs font-mono-accent text-[#6b6b6b] mb-3">
                                                ✔ ATS Score
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-sm font-bold rounded-md ${
                                                    displayAtsScore && displayAtsScore >= 80 ? 'bg-[#16a34a]/10 text-[#16a34a]' :
                                                    displayAtsScore && displayAtsScore >= 50 ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {displayAtsScore ? `${displayAtsScore}/100` : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/10">
                                            <p className="text-xs font-mono-accent text-[#6b6b6b] mb-3">
                                                ✔ Key Technologies
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {keyTechnologies.map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="px-3 py-1 bg-white text-[#1a1a1a] text-xs font-bold rounded-md border border-[#1a1a1a]/10"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollReveal>
            </section>

            <div className="border-t border-[#1a1a1a]/10 mx-4 sm:mx-8 lg:mx-16"></div>

            {/* Step 2: Interview Preferences */}
            <section className="px-4 sm:px-8 lg:px-16 py-20 max-w-7xl mx-auto relative z-10">
                <ScrollReveal>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#16a34a] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            2
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-[#1a1a1a]">
                                Interview Preferences
                            </h2>
                            <p className="text-[#6b6b6b] text-sm mt-1">
                                Configure your interview to match your target role and company.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={100}>
                    <div className="bg-white rounded-xl border border-[#1a1a1a]/15 p-8 card-lift">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-10">
                                {/* Target Role */}
                                <div>
                                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                                        <Briefcase className="w-4 h-4 inline mr-2 text-[#16a34a]" />
                                        Target Role
                                    </label>
                                    <div className="relative">
                                        <button
                                            className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/15 rounded-lg text-left flex items-center justify-between hover:border-[#16a34a]/40 transition-colors"
                                            onClick={() => {
                                                setRoleDropdownOpen(!roleDropdownOpen);
                                                setCompanyDropdownOpen(false);
                                                setLangDropdownOpen(false);
                                            }}
                                        >
                                            <span
                                                className={
                                                    targetRole ? "text-[#1a1a1a]" : "text-[#999]"
                                                }
                                            >
                                                {targetRole || "Select a role..."}
                                            </span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-[#6b6b6b] transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                        {roleDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#1a1a1a]/15 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                                                {targetRoles.map((role) => (
                                                    <button
                                                        key={role}
                                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#16a34a]/10 hover:text-[#16a34a] transition-colors"
                                                        onClick={() => {
                                                            setTargetRole(role);
                                                            setRoleDropdownOpen(false);
                                                        }}
                                                    >
                                                        {role}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Company Type */}
                                <div>
                                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                                        <Building2 className="w-4 h-4 inline mr-2 text-[#16a34a]" />
                                        Target Company Type
                                    </label>
                                    <div className="relative">
                                        <button
                                            className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/15 rounded-lg text-left flex items-center justify-between hover:border-[#16a34a]/40 transition-colors"
                                            onClick={() => {
                                                setCompanyDropdownOpen(!companyDropdownOpen);
                                                setRoleDropdownOpen(false);
                                                setLangDropdownOpen(false);
                                            }}
                                        >
                                            <span
                                                className={
                                                    companyType ? "text-[#1a1a1a]" : "text-[#999]"
                                                }
                                            >
                                                {companyType || "Select company type..."}
                                            </span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-[#6b6b6b] transition-transform ${companyDropdownOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                        {companyDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#1a1a1a]/15 rounded-lg shadow-lg z-20">
                                                {companyTypes.map((type) => (
                                                    <button
                                                        key={type}
                                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#16a34a]/10 hover:text-[#16a34a] transition-colors"
                                                        onClick={() => {
                                                            setCompanyType(type);
                                                            setCompanyDropdownOpen(false);
                                                        }}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Interview Type */}
                                <div>
                                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                                        <MessageSquareText className="w-4 h-4 inline mr-2 text-[#16a34a]" />
                                        Interview Type
                                    </label>
                                    <div className="relative">
                                        <button
                                            className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/15 rounded-lg text-left flex items-center justify-between hover:border-[#16a34a]/40 transition-colors"
                                            onClick={() => {
                                                setInterviewTypeDropdownOpen(!interviewTypeDropdownOpen);
                                                setRoleDropdownOpen(false);
                                                setCompanyDropdownOpen(false);
                                                setLangDropdownOpen(false);
                                            }}
                                        >
                                            <span
                                                className={
                                                    interviewType ? "text-[#1a1a1a]" : "text-[#999]"
                                                }
                                            >
                                                {interviewType || "Select interview type..."}
                                            </span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-[#6b6b6b] transition-transform ${interviewTypeDropdownOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                        {interviewTypeDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#1a1a1a]/15 rounded-lg shadow-lg z-20">
                                                {interviewTypes.map((type) => (
                                                    <button
                                                        key={type}
                                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#16a34a]/10 hover:text-[#16a34a] transition-colors"
                                                        onClick={() => {
                                                            setInterviewType(type);
                                                            setInterviewTypeDropdownOpen(false);
                                                        }}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Coding Round Toggle */}
                                <div>
                                    <label className="block text-sm font-bold text-[#1a1a1a] mb-3">
                                        <Code2 className="w-4 h-4 inline mr-2 text-[#16a34a]" />
                                        Coding Round Included?
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            className={`relative w-14 h-7 rounded-full transition-colors ${codingRound ? "bg-[#16a34a]" : "bg-[#1a1a1a]/20"
                                                }`}
                                            onClick={() => setCodingRound(!codingRound)}
                                        >
                                            <div
                                                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${codingRound
                                                    ? "translate-x-7"
                                                    : "translate-x-0.5"
                                                    }`}
                                            ></div>
                                        </button>
                                        <span className="text-sm text-[#6b6b6b] font-mono-accent">
                                            {codingRound ? "YES" : "NO"}
                                        </span>
                                    </div>
                                </div>

                                {/* Preferred Language (shown when coding toggle is on) */}
                                {codingRound && (
                                    <div className="p-6 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/10 transition-all">
                                        <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                                            Preferred Programming Language
                                        </label>
                                        <div className="relative">
                                            <button
                                                className="w-full px-4 py-3 bg-white border border-[#1a1a1a]/15 rounded-lg text-left flex items-center justify-between hover:border-[#16a34a]/40 transition-colors"
                                                onClick={() => {
                                                    setLangDropdownOpen(!langDropdownOpen);
                                                    setRoleDropdownOpen(false);
                                                    setCompanyDropdownOpen(false);
                                                }}
                                            >
                                                <span
                                                    className={
                                                        preferredLanguage
                                                            ? "text-[#1a1a1a]"
                                                            : "text-[#999]"
                                                    }
                                                >
                                                    {preferredLanguage || "Select language..."}
                                                </span>
                                                <ChevronDown
                                                    className={`w-4 h-4 text-[#6b6b6b] transition-transform ${langDropdownOpen ? "rotate-180" : ""}`}
                                                />
                                            </button>
                                            {langDropdownOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#1a1a1a]/15 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                                                    {programmingLanguages.map((lang) => (
                                                        <button
                                                            key={lang}
                                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#16a34a]/10 hover:text-[#16a34a] transition-colors"
                                                            onClick={() => {
                                                                setPreferredLanguage(lang);
                                                                setLangDropdownOpen(false);
                                                            }}
                                                        >
                                                            {lang}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!codingRound && (
                                    <div className="p-6 bg-[#f5f0e8]/50 rounded-lg border border-dashed border-[#1a1a1a]/10 text-center">
                                        <Code2 className="w-8 h-8 text-[#1a1a1a]/20 mx-auto mb-2" />
                                        <p className="text-[#999] text-sm">
                                            Enable coding round to configure language
                                        </p>
                                    </div>
                                )}

                                {/* Difficulty Level - always visible */}
                                <div>
                                    <label className="block text-sm font-bold text-[#1a1a1a] mb-3">
                                        <BarChart3 className="w-4 h-4 inline mr-2 text-[#16a34a]" />
                                        Difficulty Level
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Easy", "Medium", "Hard", "Adaptive"].map((level) => (
                                            <label
                                                key={level}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer border text-sm font-bold transition-all ${difficulty === level
                                                    ? "border-[#16a34a] bg-[#16a34a]/10 text-[#16a34a]"
                                                    : "border-[#1a1a1a]/15 bg-[#f5f0e8] text-[#1a1a1a] hover:border-[#16a34a]/30"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="difficulty"
                                                    className="hidden"
                                                    checked={difficulty === level}
                                                    onChange={() => setDifficulty(level)}
                                                />
                                                {level}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Interviewer Personality */}
                                <div>
                                    <label className="block text-sm font-bold text-[#1a1a1a] mb-3">
                                        <Briefcase className="w-4 h-4 inline mr-2 text-[#16a34a]" />
                                        Interviewer Personality
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Friendly HR", "Aggressive Senior", "Silent Evaluator", "Speed Gunner"].map((mode) => (
                                            <label
                                                key={mode}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer border text-sm font-bold transition-all ${personalityMode === mode
                                                    ? "border-[#16a34a] bg-[#16a34a]/10 text-[#16a34a]"
                                                    : "border-[#1a1a1a]/15 bg-[#f5f0e8] text-[#1a1a1a] hover:border-[#16a34a]/30"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="personalityMode"
                                                    className="hidden"
                                                    checked={personalityMode === mode}
                                                    onChange={() => setPersonalityMode(mode)}
                                                />
                                                {mode}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            <div className="border-t border-[#1a1a1a]/10 mx-4 sm:mx-8 lg:mx-16"></div>

            {/* Step 3: Profile Links */}
            <section className="px-4 sm:px-8 lg:px-16 py-20 max-w-7xl mx-auto relative z-10">
                <ScrollReveal>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#16a34a] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            3
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-[#1a1a1a]">
                                Profile Links
                            </h2>
                            <p className="text-[#6b6b6b] text-sm mt-1">
                                Add links to your coding profiles for a more comprehensive assessment.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={100}>
                    <div className="bg-white rounded-xl border border-[#1a1a1a]/15 p-8 card-lift">
                        {/* Add Link Form */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Platform Dropdown */}
                            <div className="relative w-full sm:w-56">
                                <button
                                    className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/15 rounded-lg text-left flex items-center justify-between hover:border-[#16a34a]/40 transition-colors"
                                    onClick={() => {
                                        setPlatformDropdownOpen(!platformDropdownOpen);
                                        setRoleDropdownOpen(false);
                                        setCompanyDropdownOpen(false);
                                        setLangDropdownOpen(false);
                                    }}
                                >
                                    <span className={selectedPlatform ? "text-[#1a1a1a]" : "text-[#999]"}>
                                        {selectedPlatform
                                            ? profilePlatforms.find((p) => p.value === selectedPlatform)?.label
                                            : "Select platform..."}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-[#6b6b6b] transition-transform ${platformDropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </button>
                                {platformDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#1a1a1a]/15 rounded-lg shadow-lg z-20">
                                        {profilePlatforms.map((platform) => (
                                            <button
                                                key={platform.value}
                                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#16a34a]/10 hover:text-[#16a34a] transition-colors flex items-center gap-3"
                                                onClick={() => {
                                                    setSelectedPlatform(platform.value);
                                                    setPlatformDropdownOpen(false);
                                                }}
                                            >
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: platform.color }}
                                                ></span>
                                                {platform.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* URL Input */}
                            <div className="flex-1">
                                <input
                                    type="url"
                                    value={profileUrl}
                                    onChange={(e) => setProfileUrl(e.target.value)}
                                    placeholder="Paste your profile link here..."
                                    className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#1a1a1a]/15 rounded-lg text-sm text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:border-[#16a34a]/50 transition-colors"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") addProfileLink();
                                    }}
                                />
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={addProfileLink}
                                disabled={!selectedPlatform || !profileUrl.trim()}
                                className={`px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${selectedPlatform && profileUrl.trim()
                                    ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                                    : "bg-[#1a1a1a]/10 text-[#999] cursor-not-allowed"
                                    }`}
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>

                        {/* Added Links List */}
                        {profileLinks.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-[#1a1a1a]/10 space-y-3">
                                <p className="text-xs font-mono-accent text-[#6b6b6b] mb-3">
                                    Added Profiles ({profileLinks.length})
                                </p>
                                {profileLinks.map((link, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-[#f5f0e8] rounded-lg border border-[#1a1a1a]/10 group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: link.color }}
                                            ></span>
                                            <span className="text-sm font-bold text-[#1a1a1a] shrink-0">
                                                {link.label}
                                            </span>
                                            <Link2 className="w-3 h-3 text-[#999] shrink-0" />
                                            <span className="text-sm text-[#6b6b6b] truncate">
                                                {link.url}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeProfileLink(index)}
                                            className="w-8 h-8 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {profileLinks.length === 0 && (
                            <div className="mt-6 pt-6 border-t border-[#1a1a1a]/10 text-center py-6">
                                <Link2 className="w-8 h-8 text-[#1a1a1a]/15 mx-auto mb-2" />
                                <p className="text-[#999] text-sm">
                                    No profiles added yet. Add your coding profiles above.
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollReveal>
            </section>

            {/* Start Interview */}
            <section className="px-4 sm:px-8 lg:px-16 py-20 max-w-7xl mx-auto relative z-10">
                <ScrollReveal>
                    <div className="flex flex-col items-center justify-center text-center">
                        <button
                            onClick={async () => {
                                setIsSaving(true);
                                try {
                                    const sessionId = await createSession({
                                        targetRole,
                                        companyType,
                                        interviewType,
                                        codingRound,
                                        preferredLanguage,
                                        recordInterview: false,
                                        difficulty,
                                        personalityMode,
                                        detectedSkills,
                                        keyTechnologies,
                                        experienceLevel,
                                        resumeText,
                                        profileLinks: profileLinks.map((l) => ({
                                            platform: l.platform,
                                            label: l.label,
                                            url: l.url,
                                        })),
                                    });
                                    router.push(`/interview/${sessionId}`);
                                } catch (error) {
                                    console.error("Failed to create session:", error);
                                    setIsSaving(false);
                                }
                            }}
                            disabled={!isFormComplete || isSaving}
                            className={`group px-14 py-5 text-lg font-bold rounded-xl transition-all transform flex items-center gap-3 ${isFormComplete
                                ? "bg-[#16a34a] text-white hover:bg-[#15803d] hover:scale-[1.02] shadow-lg shadow-[#16a34a]/20"
                                : "bg-[#1a1a1a]/10 text-[#999] cursor-not-allowed"
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Preparing Interview...
                                </>
                            ) : (
                                <>
                                    Start Your Interview
                                    <ArrowRight
                                        className={`w-5 h-5 transition-transform ${isFormComplete ? "group-hover:translate-x-1" : ""}`}
                                    />
                                </>
                            )}
                        </button>
                        {!isFormComplete && (
                            <p className="text-[#999] text-xs font-mono-accent mt-4">
                                Complete all fields above to begin
                            </p>
                        )}
                    </div>
                </ScrollReveal>
            </section>

            {/* Footer */}
            <footer className="px-4 sm:px-8 lg:px-16 py-10 text-center border-t border-[#1a1a1a]/10 relative z-10">
                <p className="text-[#999] text-xs font-mono-accent">
                    © 2026 PeakPrep – AI Interview Platform
                </p>
            </footer>
        </div>
    );
}
