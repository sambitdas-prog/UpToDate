import React, { useState, useEffect } from 'react';
import { Sparkles, Code2, Bot, Layers, Loader2 } from 'lucide-react';

const STAGES = [
  {
    id: 1,
    title: "Connecting to GitHub & fetching code differences...",
    detail: "Retrieving commit logs, branch comparisons, and code changes",
    icon: Code2,
    color: "from-blue-500 to-cyan-400",
    glow: "#06b6d4",
    progress: 30
  },
  {
    id: 2,
    title: "AI Analysis & Dynamic Layout Generation...",
    detail: "Categorizing modifications, extraction of capabilities, and layout selection",
    icon: Bot,
    color: "from-purple-500 to-indigo-500",
    glow: "#8b5cf6",
    progress: 70
  },
  {
    id: 3,
    title: "Synthesizing Instructional Poster...",
    detail: "Applying dynamic color palettes, glassmorphism, and responsive styling",
    icon: Layers,
    color: "from-emerald-400 to-teal-500",
    glow: "#10b981",
    progress: 95
  }
];

export default function LoadingPoster() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStageIndex(1), 3500);
    const timer2 = setTimeout(() => setStageIndex(2), 8500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const currentStage = STAGES[stageIndex];
  const IconComponent = currentStage.icon;

  return (
    <div className="w-[640px] h-[960px] bg-black border border-white/20 rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative font-sans shadow-[0_16px_50px_rgba(0,0,0,0.9)] overflow-hidden">
      {/* Dynamic Animated Ambient Glow */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-25 animate-pulse transition-all duration-1000"
        style={{ backgroundColor: currentStage.glow }}
      ></div>
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-20 animate-pulse transition-all duration-1000"
        style={{ backgroundColor: currentStage.glow, animationDelay: '1s' }}
      ></div>

      {/* Glass Reflection & Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,transparent_70%)]"></div>

      {/* Top Header Bar Skeleton */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 bg-white/10 border border-white/15 backdrop-blur-xl px-3.5 py-2 rounded-xl shadow-lg">
          <div className="w-7 h-7 rounded-lg bg-white/20 animate-pulse"></div>
          <div className="w-28 h-4 bg-white/10 rounded-md animate-pulse"></div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl shadow-md bg-white/5 border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-white/40 animate-spin" />
          <div className="w-24 h-3.5 bg-white/10 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Main Skeleton Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-3 my-auto">
        {/* Title Skeletons */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-8 bg-white/10 rounded-xl w-3/4 animate-pulse"></div>
          <div className="h-4 bg-white/5 rounded-md w-1/2 animate-pulse"></div>
        </div>

        {/* Interactive Active Stage Indicator Card */}
        <div className="w-full max-w-xl mx-auto p-4 rounded-xl bg-white/[0.06] border border-white/15 backdrop-blur-2xl shadow-xl transition-all duration-500 text-left">
          <div className="flex items-center gap-3 mb-2.5">
            <div className={`p-2.5 rounded-xl bg-gradient-to-r ${currentStage.color} text-white shadow-md animate-bounce shrink-0`}>
              <IconComponent className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-white font-bold text-sm truncate">
                  {currentStage.title}
                </span>
                <span className="text-[10px] font-mono font-semibold text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 shrink-0 ml-2">
                  Step {currentStage.id} of 3
                </span>
              </div>
              <p className="text-xs text-white/60 font-light truncate">
                {currentStage.detail}
              </p>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className={`h-full bg-gradient-to-r ${currentStage.color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.4)]`}
              style={{ width: `${currentStage.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Capability Cards Skeleton Grid */}
        <div className="flex flex-col gap-2.5 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-md">
              <div className="w-16 h-5 rounded-lg bg-white/10 animate-pulse shrink-0"></div>
              <div className="space-y-1 flex-1">
                <div className="h-3.5 bg-white/10 rounded w-1/2 animate-pulse"></div>
                <div className="h-3 bg-white/5 rounded w-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="relative z-10 pt-2.5 border-t border-white/10 flex justify-between items-center text-white/40">
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white/50" />
          <span className="font-medium text-white/60 text-xs">Generating AI Release Poster...</span>
        </div>
        <div className="text-white/40 font-mono text-xs">Step {currentStage.id}/3</div>
      </div>
    </div>
  );
}
