"use client";

import Link from "next/link";
import { Mic, Brain, Target, Server } from "lucide-react";
import Logo from "@/components/Logo";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";

const features = [
  {
    icon: Mic,
    title: "Longer Interviews",
    desc: "Handles longer conversations without breaking context",
  },
  {
    icon: Brain,
    title: "Artificial Intelligence",
    desc: "Enables Context-aware evaluation of the interviewee's performance",
  },
  {
    icon: Target,
    title: "Personalized Feedback",
    desc: "Detailed improvement insights as per the conversation",
  },
  {
    icon: Server,
    title: "Scalable Architecture",
    desc: "Handles 1000+ sessions at scale with several types of different interview domains",
  },
];

const stats = [
  { value: "1000+", label: "Concurrent Interviews" },
  { value: "250k", label: "Max Token Handling" },
  { value: "90%+", label: "Scenario Coverage" },
  { value: "50%", label: "Faster Preparation" },
];

export default function Home() {
  return (
    <div className="min-h-screen relative bg-[#f5f0e8] noise-bg grid-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 lg:px-16 pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 max-w-7xl mx-auto z-10">
        <div className="text-center space-y-6 mb-16">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-md mb-4">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
              <span className="font-mono-accent text-[#16a34a] text-xs">AI-Powered Mock Interviews</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={50}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#1a1a1a] tracking-tight leading-tight">
              Practice.{" "}
              <span className="text-[#16a34a]">Improve.</span>
              <br />
              Get Hired.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="font-mono-accent text-[#6b6b6b] max-w-2xl mx-auto">
              A voice-powered AI interview platform with adaptive follow-up questioning and intelligent feedback.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className="text-[#999] text-sm">
              50+ interview scenarios. AI-powered feedback. No BS.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/setup"
                className="px-8 py-4 bg-[#16a34a] text-white font-bold rounded-md hover:bg-[#15803d] transition-all transform hover:scale-[1.02] flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-white/80"></span>
                Set Up Your Interview
              </Link>

            </div>
          </ScrollReveal>
          <ScrollReveal delay={250}>
            <p className="text-[#999] text-xs font-mono-accent mt-4">
              ✓ Setup takes less than 60 seconds. Start practicing now.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#1a1a1a]/10 mx-4 sm:mx-8 lg:mx-16"></div>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 sm:px-8 lg:px-16 py-16 sm:py-24 max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <p className="font-mono-accent text-[#6b6b6b] text-center mb-4 text-xs">Simple 3-step process</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] text-center mb-12 sm:mb-16">
            How It <span className="text-[#16a34a]">Works</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal delay={0}>
            <div className="bg-white rounded-xl p-8 border border-[#1a1a1a]/15 card-lift h-full text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#16a34a] text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="w-16 h-16 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-full flex items-center justify-center mx-auto mb-6 mt-2">
                <Target className="w-8 h-8 text-[#16a34a]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                Choose Your Role
              </h3>
              <p className="text-[#6b6b6b] text-sm leading-relaxed">
                Select your target job role, experience level, and the specific skills you want to practice.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="bg-white rounded-xl p-8 border border-[#1a1a1a]/15 card-lift h-full text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#16a34a] text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="w-16 h-16 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-full flex items-center justify-center mx-auto mb-6 mt-2">
                <Mic className="w-8 h-8 text-[#16a34a]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                Start Interview
              </h3>
              <p className="text-[#6b6b6b] text-sm leading-relaxed">
                Engage in a realistic voice-based interview with our AI interviewer that adapts to your responses.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="bg-white rounded-xl p-8 border border-[#1a1a1a]/15 card-lift h-full text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#16a34a] text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="w-16 h-16 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-full flex items-center justify-center mx-auto mb-6 mt-2">
                <Brain className="w-8 h-8 text-[#16a34a]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                AI Feedback
              </h3>
              <p className="text-[#6b6b6b] text-sm leading-relaxed">
                Receive detailed, personalized feedback on your performance with actionable improvement tips.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#1a1a1a]/10 mx-4 sm:mx-8 lg:mx-16"></div>

      {/* Features Section */}
      <section id="features" className="px-4 sm:px-8 lg:px-16 py-16 sm:py-24 max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <p className="font-mono-accent text-[#6b6b6b] text-center mb-4 text-xs">What makes PeakPrep different</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] text-center mb-12 sm:mb-16">
            The Future of <span className="text-[#16a34a]">Interviews</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 100}>
              <div className="bg-white rounded-xl p-8 border border-[#1a1a1a]/15 card-lift h-full">
                <div className="w-14 h-14 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#16a34a]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#6b6b6b] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>


      {/* Footer */}
      <footer className="px-4 sm:px-8 lg:px-16 pt-12 sm:pt-16 pb-8 border-t border-[#1a1a1a]/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            {/* Brand */}
            <div className="md:max-w-sm">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <Logo className="w-8 h-8" />
                <span className="text-lg font-bold text-[#1a1a1a]">PeakPrep</span>
              </Link>
              <p className="text-[#999] text-sm leading-relaxed">
                AI-powered interview platform. Practice smarter, interview better.
              </p>
            </div>

            {/* Links Container */}
            <div className="flex flex-col sm:flex-row gap-12 sm:gap-24">
              {/* Product */}
              <div>
                <h4 className="font-mono-accent text-[#1a1a1a] font-semibold mb-4 text-xs">Product</h4>
                <ul className="space-y-2.5 list-none">
                  <li><Link href="/interview" className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors text-sm">Mock Interview</Link></li>
                  <li><Link href="/#features" className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors text-sm">Features</Link></li>
                  <li><Link href="/enterprise" className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors text-sm">Enterprise</Link></li>
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h4 className="font-mono-accent text-[#1a1a1a] font-semibold mb-4 text-xs">Connect</h4>
                <div className="flex gap-3">
                  <a href="https://github.com/Nightkilller" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md border border-[#1a1a1a]/15 flex items-center justify-center text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#1a1a1a]/40 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </a>
                  <a href="https://www.linkedin.com/in/aditya-gupta-267b2b2ab/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md border border-[#1a1a1a]/15 flex items-center justify-center text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#1a1a1a]/40 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                  <a href="https://twitter.com/AdityaG15164379" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md border border-[#1a1a1a]/15 flex items-center justify-center text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#1a1a1a]/40 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Divider + Copyright */}
          <div className="border-t border-[#1a1a1a]/10 pt-8">
            <div className="flex justify-center items-center">
              <p className="text-[#999] text-xs font-mono-accent text-center">
                © 2026 PeakPrep - Made with ❤️ by Aditya Gupta
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
