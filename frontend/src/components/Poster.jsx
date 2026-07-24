import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const Poster = React.forwardRef(({ data }, ref) => {
  if (!data) {
    return (
      <div 
        ref={ref}
        className="w-[800px] min-h-[800px] flex items-center justify-center bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(255,255,255,0.05)] relative overflow-hidden p-12"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
        <p className="text-white/50 text-xl font-medium tracking-wide">No release data generated yet.</p>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className="w-[800px] min-h-[800px] h-auto bg-black border border-white/20 rounded-3xl p-12 flex flex-col justify-between relative font-sans shadow-[0_8px_32px_rgba(255,255,255,0.1)] overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/20 backdrop-blur-xl mb-8 shadow-inner">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-white font-semibold tracking-widest uppercase text-sm">New Release Update</span>
        </div>
        
        <h1 className="text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight drop-shadow-2xl">
          {data.title}
        </h1>
        
        <p className="text-xl text-white/70 leading-relaxed max-w-2xl font-light">
          {data.summary}
        </p>
      </div>

      <div className="relative z-10 flex-1 my-8 flex flex-col justify-center">
        <div className="space-y-4">
          {data.features.map((feature, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(255,255,255,0.02)]"
            >
              <CheckCircle2 className="w-7 h-7 text-white shrink-0 mt-0.5 drop-shadow-md" />
              <p className="text-xl text-white/90 leading-snug">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
        <div className="text-white/40 text-base">
          <span className="font-bold text-white/70">UpToDate</span> Release Generator
        </div>
        <div className="text-white/40 text-sm font-medium">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
});

export default Poster;
