import React, { useState, useEffect } from 'react';
import { GitCompare, Sparkles, Wand2, Loader2, Compass, ChevronRight } from 'lucide-react';

const STAGES = [
  {
    id: 1,
    title: 'Connecting to GitHub & fetching code differences...',
    detail: 'Retrieving commit logs, branch comparisons, and code changes',
    icon: GitCompare,
    progress: 32,
    color: 'from-blue-500 to-cyan-400',
    glow: 'rgba(59, 130, 246, 0.3)'
  },
  {
    id: 2,
    title: 'Analyzing feature delta & navigation path with AI...',
    detail: 'Extracting single feature capabilities, UI navigation breadcrumbs, and explanation',
    icon: Sparkles,
    progress: 72,
    color: 'from-purple-500 to-indigo-400',
    glow: 'rgba(168, 85, 247, 0.3)'
  },
  {
    id: 3,
    title: 'Synthesizing instructional layout & rendering poster...',
    detail: 'Styling capabilities grid, navigation path badge, and ambient lighting',
    icon: Wand2,
    progress: 95,
    color: 'from-pink-500 to-rose-400',
    glow: 'rgba(244, 63, 94, 0.3)'
  }
];

export default function LoadingPoster() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStageIndex(1), 4500);
    const timer2 = setTimeout(() => setStageIndex(2), 11000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const currentStage = STAGES[stageIndex];
  const IconComponent = currentStage.icon;

  return (
    <div className="w-[800px] min-h-[800px] h-auto bg-black border border-white/20 rounded-3xl p-10 flex flex-col justify-between relative font-sans shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Dynamic Animated Ambient Glow */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-30 animate-pulse transition-all duration-1000"
        style={{ backgroundColor: currentStage.glow }}
      ></div>
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-20 animate-pulse transition-all duration-1000"
        style={{ backgroundColor: currentStage.glow, animationDelay: '1s' }}
      ></div>

      {/* Glass Reflection & Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,transparent_70%)]"></div>
      <div className="absolute inset-0 pointer-events-none border-t border-white/[0.08] rounded-3xl"></div>

      {/* Top Header Bar Skeleton */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-white/20 animate-pulse"></div>
          <div className="w-32 h-6 bg-white/10 rounded-md animate-pulse"></div>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl shadow-md bg-white/5 border-white/20">
          <Sparkles className="w-4 h-4 text-white/40 animate-spin" />
          <div className="w-28 h-4 bg-white/10 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* a) What's New Header & b) What is it? Explanation Skeleton */}
      <div className="relative z-10 flex flex-col items-center text-center my-2">
        <div className="h-14 bg-white/10 rounded-2xl w-4/5 animate-pulse mb-3"></div>
        <div className="h-8 bg-white/10 rounded-2xl w-2/5 animate-pulse mb-4"></div>
        <div className="h-5 bg-white/5 rounded-lg w-full max-w-3xl animate-pulse mb-2"></div>
        <div className="h-5 bg-white/5 rounded-lg w-2/3 max-w-3xl animate-pulse mb-6"></div>

        {/* Interactive Active Stage Indicator Card (Hero Screenshot Area) */}
        <div className="w-full max-w-2xl my-4 p-6 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-2xl shadow-2xl transition-all duration-500 text-left">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${currentStage.color} text-white shadow-lg animate-bounce`}>
              <IconComponent className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-lg tracking-tight">
                  {currentStage.title}
                </span>
                <span className="text-xs font-mono font-semibold text-white/60 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  Step {currentStage.id} of 3
                </span>
              </div>
              <p className="text-sm text-white/60 font-light">
                {currentStage.detail}
              </p>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className={`h-full bg-gradient-to-r ${currentStage.color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,255,255,0.5)]`}
              style={{ width: `${currentStage.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* c) What You Can Do Grid Skeleton (3-Column Layout) */}
      <div className="relative z-10 flex-1 w-full my-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse"></div>
                <div className="w-16 h-4 rounded-full bg-white/10 animate-pulse"></div>
              </div>
              <div className="mt-1">
                <div className="h-5 bg-white/10 rounded-md w-3/4 animate-pulse mb-2"></div>
                <div className="h-4 bg-white/5 rounded-md w-full animate-pulse mb-1"></div>
                <div className="h-4 bg-white/5 rounded-md w-5/6 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* d) How to Navigate Section Skeleton */}
      <div className="relative z-10 w-full my-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-xl overflow-hidden flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
          <Compass className="w-4 h-4 text-white/40 animate-spin" />
          <span>How to Navigate</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {[1, 2, 3].map((step, sIdx) => (
            <React.Fragment key={sIdx}>
              <div className="h-8 w-32 rounded-xl bg-white/10 border border-white/15 animate-pulse"></div>
              {sIdx < 2 && (
                <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* f) Footer Skeleton */}
      <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-white/40">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-white/40" />
          <span className="font-medium text-white/60 text-sm">Generating AI Release Poster...</span>
        </div>
        <div className="text-white/40 font-mono text-xs">Step {currentStage.id}/3</div>
      </div>
    </div>
  );
}
