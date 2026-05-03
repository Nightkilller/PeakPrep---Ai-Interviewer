"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { aiInterviewerConfig } from "@/constants";
import { saveTranscription } from "@/lib/actions/general.action";
import { useFaceTracker } from "@/hooks/useFaceTracker";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
});

const Whiteboard = dynamic(() => import("@/components/Whiteboard"), {
  ssr: false,
});

enum ConnectionState {
  IDLE = "IDLE",
  ESTABLISHING = "ESTABLISHING",
  CONNECTED = "CONNECTED",
  TERMINATED = "TERMINATED",
}

interface DialogEntry {
  role: "user" | "system" | "assistant";
  content: string;
}

const VoiceInterviewer = ({
  candidateName,
  userId,
  sessionId,
  mode,
  queryList,
  setupContext,
  autoStart = false,
}: VoiceAgentProps & { autoStart?: boolean }) => {
  const navigation = useRouter();
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.IDLE);
  const [dialogHistory, setDialogHistory] = useState<DialogEntry[]>([]);
  const dialogHistoryRef = useRef<DialogEntry[]>([]);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isProcessingResults, setIsProcessingResults] = useState(false);
  const [proctoringLog, setProctoringLog] = useState<{ timestamp: string; type: string; durationSeconds: number }[]>([]);
  const activeViolation = useRef<{ type: string; startTime: number } | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [codeState, setCodeState] = useState<{ code: string; executed: boolean; correct: boolean }>({ code: "", executed: false, correct: false });
  const [viewMode, setViewMode] = useState<"CODE" | "WHITEBOARD">("CODE");
  const whiteboardRef = useRef<any>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);

  // AV Controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { bodyLanguageScore } = useFaceTracker(videoPreviewRef.current, connectionState === "CONNECTED");

  const isCodingRound = setupContext?.codingRound === true;

  useEffect(() => {
    const handleConnectionEstablished = () => {
      console.log("VAPI: Call started successfully!");
      setConnectionState(ConnectionState.CONNECTED);
      const now = Date.now();
      setStartTime(now);
      startTimeRef.current = now;

      // Start camera for MediaPipe (and recording if enabled)
      startCameraAndRecording();
    };

    const handleConnectionClosed = () => {
      console.log("VAPI: Call ended");
      setConnectionState(ConnectionState.TERMINATED);
      setStartTime(null);
      setElapsedTime(0);
    };

    const handleIncomingMessage = (msg: Message) => {
      console.log("VAPI Message received:", msg.type, msg);
      if (msg.type === "transcript") {
        if (msg.role === "user") {
          if (msg.transcriptType === "partial") {
            setUserTranscript(msg.transcript);
          } else if (msg.transcriptType === "final") {
            setUserTranscript(msg.transcript);
            const dialogEntry = { role: msg.role, content: msg.transcript };
            setDialogHistory((previous) => [...previous, dialogEntry]);
          }
        } else {
          if (msg.transcriptType === "final") {
            const dialogEntry = { role: msg.role, content: msg.transcript };
            setDialogHistory((previous) => [...previous, dialogEntry]);
          }
        }
      }
    };

    const handleAgentSpeechStart = () => {
      setAgentSpeaking(true);
    };

    const handleAgentSpeechEnd = () => {
      setAgentSpeaking(false);
    };

    const handleConnectionError = (err: any) => {
      console.error("VAPI Connection error:", err);
      console.error("=== VAPI ERROR DETAILS ===");
      console.error("Full error JSON:", JSON.stringify(err, null, 2));
      console.error("Action:", err?.action);
      console.error("Error Message:", err?.errorMsg);
      console.error("Error:", err?.error);
      console.error("Call Client ID:", err?.callClientId);
      alert(`VAPI Error: ${err?.errorMsg || err?.error || err?.message || JSON.stringify(err)}`);
    };

    vapi.on("call-start", handleConnectionEstablished);
    vapi.on("call-end", handleConnectionClosed);
    vapi.on("message", handleIncomingMessage);
    vapi.on("speech-start", handleAgentSpeechStart);
    vapi.on("speech-end", handleAgentSpeechEnd);
    vapi.on("error", handleConnectionError);

    return () => {
      vapi.off("call-start", handleConnectionEstablished);
      vapi.off("call-end", handleConnectionClosed);
      vapi.off("message", handleIncomingMessage);
      vapi.off("speech-start", handleAgentSpeechStart);
      vapi.off("speech-end", handleAgentSpeechEnd);
      vapi.off("error", handleConnectionError);
    };
  }, []);

  useEffect(() => {
    dialogHistoryRef.current = dialogHistory;
    if (dialogHistory.length > 0) {
      setCurrentMessage(dialogHistory[dialogHistory.length - 1].content);
    }

    // Only auto-navigate for non-interview modes (generate)
    if (connectionState === ConnectionState.TERMINATED && mode !== "interview") {
      setTimeout(() => {
        navigation.push("/interview");
      }, 1000);
    }
  }, [dialogHistory, connectionState, navigation]);

  // Track proctoring violations when connected
  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;

    const handleViolationStart = (type: string) => {
      if (!activeViolation.current) {
        activeViolation.current = { type, startTime: Date.now() };
      }
    };

    const handleViolationEnd = () => {
      if (activeViolation.current && startTimeRef.current) {
        const violationType = activeViolation.current.type;
        const durationSeconds = Math.floor((Date.now() - activeViolation.current.startTime) / 1000);
        const elapsedSinceStart = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const mins = Math.floor(elapsedSinceStart / 60);
        const secs = elapsedSinceStart % 60;
        const timestamp = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        setProctoringLog(prev => [...prev, {
          timestamp,
          type: violationType,
          durationSeconds: Math.max(1, durationSeconds)
        }]);
        activeViolation.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolationStart('tab_switch');
      } else {
        handleViolationEnd();
      }
    };

    const handleBlur = () => {
      handleViolationStart('window_blur');
    };

    const handleFocus = () => {
      handleViolationEnd();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      handleViolationEnd(); // close any active violation if component unmounts or state changes
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [connectionState]);

  useEffect(() => {
    if (autoStart && connectionState === ConnectionState.IDLE) {
      const startInterview = async () => {
        setConnectionState(ConnectionState.ESTABLISHING);
        if (mode === "generate") {
          await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
            variableValues: {
              username: candidateName,
              userid: userId,
            },
          });
        } else {
          let structuredQueries = "";
          if (queryList) {
            structuredQueries = queryList
              .map((query) => `- ${query}`)
              .join("\n");
          }
          await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
            variableValues: {
              questions: structuredQueries,
              target_role: setupContext?.targetRole || "",
              company_type: setupContext?.companyType || "",
              interview_type: setupContext?.interviewType || "",
              coding_round: setupContext?.codingRound ? "Yes" : "No",
              difficulty: setupContext?.difficulty || "Adaptive",
              personality_mode: setupContext?.personalityMode || "Friendly HR",
              resume: [
                setupContext?.resumeText ? `Resume Content: ${setupContext.resumeText}` : "",
                setupContext?.detectedSkills?.length ? `Skills: ${setupContext.detectedSkills.join(", ")}` : "",
                setupContext?.keyTechnologies?.length ? `Key Technologies: ${setupContext.keyTechnologies.join(", ")}` : "",
                setupContext?.experienceLevel ? `Experience Level: ${setupContext.experienceLevel}` : "",
              ].filter(Boolean).join("\n"),
            },
          });
        }
      };
      startInterview();
    }
  }, [autoStart, connectionState, mode, candidateName, userId, queryList, setupContext]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (startTime && connectionState === ConnectionState.CONNECTED) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, connectionState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCritique = async () => {
    if (!whiteboardRef.current) return;
    setCritiqueLoading(true);
    try {
      const base64Image = await whiteboardRef.current.getCanvasImage();
      if (!base64Image) {
        setCritiqueLoading(false);
        return;
      }
      
      const response = await fetch("/api/critique-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await response.json();
      
      if (data.feedback) {
        vapi.send({
          type: "add-message",
          message: {
            role: "system",
            content: `The candidate just submitted a system design diagram for critique. Here is your analysis of their drawing. Please verbally provide this feedback to them in a natural, conversational way: ${data.feedback}`,
          },
        });
      }
    } catch (e) {
      console.error("Critique failed:", e);
    } finally {
      setCritiqueLoading(false);
    }
  };

  const initiateConnection = async () => {
    setConnectionState(ConnectionState.ESTABLISHING);

    try {
      if (mode === "generate") {
        console.log("Starting with workflow ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: candidateName,
            userid: userId,
          },
        });
      } else {
        let structuredQueries = "";
        if (queryList) {
          structuredQueries = queryList
            .map((query) => `- ${query}`)
            .join("\n");
        }

        console.log("Starting with aiInterviewerConfig");
        console.log("Mode:", mode);
        console.log("Questions:", structuredQueries);
        console.log("Setup Context:", setupContext);

        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            questions: structuredQueries,
            target_role: setupContext?.targetRole || "",
            company_type: setupContext?.companyType || "",
            interview_type: setupContext?.interviewType || "",
            coding_round: setupContext?.codingRound ? "Yes" : "No",
            difficulty: setupContext?.difficulty || "Adaptive",
            resume: [
              setupContext?.resumeText ? `Resume Content: ${setupContext.resumeText}` : "",
              setupContext?.detectedSkills?.length ? `Skills: ${setupContext.detectedSkills.join(", ")}` : "",
              setupContext?.keyTechnologies?.length ? `Key Technologies: ${setupContext.keyTechnologies.join(", ")}` : "",
              setupContext?.experienceLevel ? `Experience Level: ${setupContext.experienceLevel}` : "",
            ].filter(Boolean).join("\n"),
          },
        });
      }
      console.log("vapi.start completed");
    } catch (error) {
      console.error("VAPI START ERROR:", error);
      setConnectionState(ConnectionState.IDLE);
    }
  };

  const terminateConnection = async () => {
    setConnectionState(ConnectionState.TERMINATED);
    setIsProcessingResults(true); // Show processing indicator
    vapi.stop();



    // Clean up camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Save transcription to Firestore and THEN navigate to result
    const currentDialog = dialogHistoryRef.current;
    if (mode === "interview" && sessionId) {
      try {
        if (currentDialog.length > 0) {
          // Fire and forget so we can navigate immediately to the polling screen
          saveTranscription(
            sessionId,
            currentDialog,
            setupContext,
            proctoringLog,
            bodyLanguageScore,
            codeState.code,
            codeState.executed,
            codeState.correct
          ).catch(e => console.error("Background transcription error:", e));
        }
      } catch (error) {
        console.error("Failed to save transcription:", error);
      }
      // Navigate to result page regardless
      navigation.push(`/result/${sessionId}`);
    }
  };

  // --- Camera functions ---
  const startCameraAndRecording = async () => {
    try {
      // Audio is explicitly false to prevent stealing the microphone from Vapi's VAD. 
      // Vapi will handle its own mic stream for the AI conversation.
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;

      // Show camera preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Failed to start camera:", error);
    }
  };

  const latestAssistantMessage = dialogHistory
    .filter(entry => entry.role === "assistant")
    .slice(-1)[0]?.content || "";

  const latestUserMessage = dialogHistory
    .filter(entry => entry.role === "user")
    .slice(-1)[0]?.content || "";

  // Interview conversation panels (shared between coding and non-coding layouts)
  const interviewPanels = (
    <>
      {/* AI Interviewer Panel */}
      <div className={cn(
        "bg-white rounded-xl p-6 border border-[#1a1a1a]/15 flex flex-col card-lift",
        isCodingRound ? "flex-1" : "min-h-[150px] p-8"
      )}>
        <div className={cn("flex items-center gap-3", isCodingRound ? "mb-2" : "mb-4")}>
          <div className="relative">
            <div className={cn(
              "bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-lg flex items-center justify-center",
              isCodingRound ? "w-10 h-10" : "w-12 h-12"
            )}>
              <svg className={cn("text-[#16a34a]", isCodingRound ? "w-5 h-5" : "w-6 h-6")} fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                <circle cx="9" cy="10" r="1.5" />
                <circle cx="15" cy="10" r="1.5" />
              </svg>
            </div>
            {agentSpeaking && (
              <span className={cn(
                "absolute inset-0 rounded-lg border-2 border-[#16a34a] animate-ping",
                isCodingRound ? "w-10 h-10" : "w-12 h-12"
              )} />
            )}
          </div>
          <div>
            <h3 className={cn("font-bold text-[#1a1a1a]", isCodingRound ? "text-base" : "text-lg")}>AI Interviewer</h3>
            <p className="text-xs font-mono-accent text-[#6b6b6b]">PeakPrep Agent</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {connectionState === "CONNECTED" ? (
            <div className="space-y-3">
              <p className="text-[#6b6b6b] text-sm font-mono-accent">
                {agentSpeaking ? "● Speaking..." : "○ Listening..."}
              </p>
              {latestAssistantMessage && (
                <div className="bg-[#f5f0e8] rounded-lg p-3 border border-[#1a1a1a]/10">
                  <p className={cn("text-[#1a1a1a] leading-relaxed", isCodingRound ? "text-xs" : "text-sm")}>{latestAssistantMessage}</p>
                  <div className="text-right mt-1.5 text-xs text-[#999] font-mono-accent">{formatTime(elapsedTime)}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#999] text-sm font-mono-accent">Waiting to start...</p>
          )}
        </div>
      </div>

      {/* Camera & Controls Panel */}
      {connectionState === "CONNECTED" && (
        <div className={cn(
          "bg-white rounded-xl p-4 border border-[#1a1a1a]/15 flex flex-col card-lift",
          isCodingRound ? "shrink-0" : "col-span-1 md:col-span-2 max-w-lg mx-auto w-full"
        )}>
          {/* User Camera */}
          <div className="relative rounded-lg overflow-hidden bg-[#1a1a1a] aspect-video w-full mb-4 shadow-inner">
            {!isCameraOff ? (
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#999]">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l16 16" />
                </svg>
                <span className="text-sm font-mono-accent">Camera Off</span>
              </div>
            )}
            
            {/* Status Overlays */}
            <div className="absolute top-3 left-3 flex gap-2">

              {isMicMuted && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-[10px] font-bold text-white font-mono">MUTED</span>
                </div>
              )}
            </div>

            {/* Reaction Overlay */}
            {reaction && (
              <div className="absolute inset-0 flex items-center justify-center animate-bounce pointer-events-none">
                <span className="text-6xl drop-shadow-2xl">{reaction}</span>
              </div>
            )}
          </div>

          {/* AV Controls & Reactions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newMutedState = !isMicMuted;
                  setIsMicMuted(newMutedState);
                  vapi.setMuted(newMutedState);
                }}
                className={cn(
                  "p-2.5 rounded-lg transition-colors border shadow-sm",
                  isMicMuted 
                    ? "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20 hover:bg-[#dc2626]/20" 
                    : "bg-[#f5f0e8] text-[#1a1a1a] border-[#1a1a1a]/10 hover:bg-[#e8e3dc]"
                )}
                title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMicMuted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => {
                  const newCameraState = !isCameraOff;
                  setIsCameraOff(newCameraState);
                  if (streamRef.current) {
                    streamRef.current.getVideoTracks().forEach(track => {
                      track.enabled = !newCameraState;
                    });
                  }
                }}
                className={cn(
                  "p-2.5 rounded-lg transition-colors border shadow-sm",
                  isCameraOff 
                    ? "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20 hover:bg-[#dc2626]/20" 
                    : "bg-[#f5f0e8] text-[#1a1a1a] border-[#1a1a1a]/10 hover:bg-[#e8e3dc]"
                )}
                title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  {isCameraOff && <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
                </svg>
              </button>
            </div>

            {/* Reactions */}
            <div className="flex gap-1.5 bg-[#f5f0e8] p-1.5 rounded-lg border border-[#1a1a1a]/10">
              {['👍', '💡', '🤔', '🙌'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setReaction(emoji);
                    setTimeout(() => setReaction(null), 2000);
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white rounded hover:shadow-sm transition-all transform hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Panel (Subtitles) */}
      <div className={cn(
        "bg-white rounded-xl p-6 border border-[#1a1a1a]/15 flex flex-col card-lift",
        isCodingRound ? "flex-1" : "min-h-[300px] p-8"
      )}>
        <div className={cn("flex items-center gap-3", isCodingRound ? "mb-2" : "mb-4")}>
          <div className={cn(
            "bg-[#1a1a1a] rounded-lg flex items-center justify-center",
            isCodingRound ? "w-10 h-10" : "w-12 h-12"
          )}>
            <svg className={cn("text-white", isCodingRound ? "w-5 h-5" : "w-6 h-6")} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h3 className={cn("font-bold text-[#1a1a1a]", isCodingRound ? "text-base" : "text-lg")}>You</h3>
            <p className="text-xs font-mono-accent text-[#6b6b6b]">Candidate</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {connectionState === "CONNECTED" ? (
            <div className="space-y-3">
              <p className="text-[#6b6b6b] text-sm font-mono-accent">
                {userTranscript ? "● Speaking..." : "○ Start voice response..."}
              </p>
              {(userTranscript || latestUserMessage) && (
                <div className="bg-[#f5f0e8] rounded-lg p-3 border border-[#1a1a1a]/10">
                  <p className={cn("text-[#1a1a1a] leading-relaxed", isCodingRound ? "text-xs" : "text-sm")}>{userTranscript || latestUserMessage}</p>
                  <div className="text-right mt-1.5 text-xs text-[#999] font-mono-accent">{formatTime(elapsedTime)}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#999] text-sm font-mono-accent">Ready to respond...</p>
          )}
        </div>
      </div>
    </>
  );

  // Call-to-action buttons
  const actionButtons = (
    <div className={cn("flex flex-col items-center", isCodingRound ? "space-y-4" : "space-y-6")}>
      {isProcessingResults ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono-accent text-[#6b6b6b]">Processing your results...</span>
        </div>
      ) : connectionState !== "CONNECTED" ? (
        <button
          className={cn(
            "group relative bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-md transition-all transform hover:scale-[1.02] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed",
            isCodingRound ? "px-6 py-3 text-sm" : "px-10 py-4 text-base"
          )}
          onClick={() => initiateConnection()}
          disabled={connectionState === "ESTABLISHING"}
        >
          <span className={cn(
            connectionState === "ESTABLISHING" && "opacity-0"
          )}>
            {connectionState === "IDLE" || connectionState === "TERMINATED"
              ? "Start Interview"
              : "Connecting"}
          </span>
          {connectionState === "IDLE" || connectionState === "TERMINATED" ? (
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          ) : (
            <div className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1",
              connectionState !== "ESTABLISHING" && "hidden"
            )}>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          )}
        </button>
      ) : (
        <button
          className={cn(
            "bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold rounded-md transition-all transform hover:scale-[1.02]",
            isCodingRound ? "px-6 py-3 text-sm" : "px-10 py-4 text-base"
          )}
          onClick={() => terminateConnection()}
        >
          End Interview
        </button>
      )}
    </div>
  );

  // === CODING ROUND LAYOUT (split view) ===
  if (isCodingRound) {
    return (
      <div className="w-full flex flex-col items-center space-y-6">
        <div className="flex w-full max-w-[1400px] gap-5" style={{ height: "calc(100vh - 140px)" }}>
          {/* Left: Interview Panels */}
          <div className="w-[400px] shrink-0 flex flex-col gap-4 pr-2 h-full overflow-y-auto custom-scrollbar">
            {interviewPanels}
            <div className="shrink-0 py-3 pb-8">
              {actionButtons}
            </div>
          </div>

          {/* Right: Code Editor / Whiteboard toggle */}
          <div className="flex-1 min-w-0 flex flex-col gap-0">
            {/* Toggle Header */}
            <div className="flex items-center justify-between bg-[#1e1e1e] rounded-t-xl px-4 py-2 border-b border-white/10">
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("CODE")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                    viewMode === "CODE"
                      ? "bg-[#16a34a] text-white shadow"
                      : "text-white/50 hover:text-white"
                  )}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Code Editor
                </button>
                <button
                  onClick={() => setViewMode("WHITEBOARD")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                    viewMode === "WHITEBOARD"
                      ? "bg-[#16a34a] text-white shadow"
                      : "text-white/50 hover:text-white"
                  )}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 012.828 2.828L11.828 13.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
                  </svg>
                  System Design
                </button>
              </div>
              {/* Critique Button (only visible in Whiteboard mode) */}
              {viewMode === "WHITEBOARD" && (
                <button
                  onClick={handleCritique}
                  disabled={critiqueLoading || connectionState !== "CONNECTED"}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    critiqueLoading
                      ? "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                      : "bg-[#16a34a]/20 hover:bg-[#16a34a]/40 text-[#4ade80] border-[#16a34a]/30"
                  )}
                >
                  {critiqueLoading ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Get AI Critique
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Panel Content */}
            <div className="flex-1 min-h-0 rounded-b-xl overflow-hidden">
              {viewMode === "CODE" ? (
                <CodeEditor
                  preferredLanguage={setupContext?.preferredLanguage}
                  onCodeStateChange={setCodeState}
                />
              ) : (
                <div className="w-full h-full bg-white">
                  <Whiteboard ref={whiteboardRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }


  // === DEFAULT LAYOUT (no coding round) ===
  return (
    <div className="w-full flex flex-col items-center space-y-8">
      {/* Two Panels Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {interviewPanels}
      </div>

      {/* Call to Action */}
      {actionButtons}


    </div>
  );
};

export default VoiceInterviewer;
