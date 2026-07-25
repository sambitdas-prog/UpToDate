import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingPoster = () => {
  return (
    <div className="w-[800px] h-[550px] flex flex-col items-center justify-center bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(255,255,255,0.05)] relative overflow-hidden p-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      
      <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-6 drop-shadow-md" />
      
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight animate-pulse">Analyzing Codebase...</h3>
      <p className="text-white/60 text-lg max-w-md leading-relaxed text-center animate-pulse">
        AI is reviewing commits, extracting features, and generating your release poster.
      </p>
    </div>
  );
};

export default LoadingPoster;
