"use client";

import { Volume2, Square } from "lucide-react";
import { useState, useEffect } from "react";

export default function TTSButton({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      setIsSupported(true);
    }
    
    return () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  if (!isSupported || !text) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors border ${
        isPlaying 
          ? "bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/30" 
          : "bg-[#1a1a1a]/5 text-[#6b6b6b] border-[#1a1a1a]/10 hover:bg-[#1a1a1a]/10 hover:text-[#1a1a1a]"
      }`}
    >
      {isPlaying ? (
        <>
          <Square className="w-3 h-3" fill="currentColor" />
          Stop Audio
        </>
      ) : (
        <>
          <Volume2 className="w-3 h-3" />
          Play Model Answer
        </>
      )}
    </button>
  );
}
