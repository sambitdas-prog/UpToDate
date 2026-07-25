import React from 'react';
import { Sparkles, CheckCircle2, Layers } from 'lucide-react';

const Poster = React.forwardRef(({ data }, ref) => {
  if (!data) {
    return (
      <div 
        ref={ref}
        className="w-[800px] h-[550px] flex items-center justify-center bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(255,255,255,0.05)] relative overflow-hidden p-12"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
        <p className="text-white/50 text-xl font-medium tracking-wide">No release data generated yet.</p>
      </div>
    );
  }

  if (data?.no_diff) {
    return (
      <div 
        ref={ref}
        className="w-[800px] h-[550px] flex flex-col items-center justify-center bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(255,255,255,0.05)] relative overflow-hidden p-12 text-center"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Branches are Identical</h3>
        <p className="text-white/60 text-lg max-w-md leading-relaxed">
          No release poster needed as the contents of both branches are identical.
        </p>
      </div>
    );
  }

  const primaryColor = data.theme?.primary_color || '#3B82F6';
  const secondaryColor = data.theme?.secondary_color || '#8B5CF6';
  const themeName = data.theme?.theme_name || 'Modern Neon';
  const appName = data.app_name || 'Application Update';
  const avatarUrl = data.app_avatar;

  return (
    <div 
      ref={ref}
      className="w-[800px] min-h-[800px] h-auto bg-black border border-white/20 rounded-3xl p-10 flex flex-col justify-between relative font-sans shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-magical-reveal"
    >
      {/* Dynamic Background Glow Blobs */}
      <div 
        className="absolute top-[-15%] left-[-15%] w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-35 transition-all duration-700"
        style={{ backgroundColor: primaryColor }}
      ></div>
      <div 
        className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-30 transition-all duration-700"
        style={{ backgroundColor: secondaryColor }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 pointer-events-none"></div>

      {/* Header Bar: App Identity & Release Badge */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-8">
        {/* App Identity (Logo & Name) */}
        <div className="flex items-center gap-3 bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-lg">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={appName} 
              crossOrigin="anonymous"
              className="w-8 h-8 rounded-xl object-cover border border-white/20 shadow-sm"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-white font-bold text-lg tracking-tight drop-shadow-md">
            {appName}
          </span>
        </div>

        {/* Release Update Badge */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl shadow-md"
          style={{ 
            backgroundColor: `${primaryColor}18`, 
            borderColor: `${primaryColor}50` 
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
          <span className="font-bold tracking-wider uppercase text-xs" style={{ color: primaryColor }}>
            New Release Update
          </span>
        </div>
      </div>

      {/* Release Title & Summary */}
      <div className="relative z-10">
        <h1 className="text-5xl font-black text-white leading-tight mb-5 tracking-tight drop-shadow-2xl">
          {data.title}
        </h1>
        
        <p className="text-xl text-white/75 leading-relaxed max-w-2xl font-light">
          {data.summary}
        </p>
      </div>

      {/* Features List */}
      <div className="relative z-10 flex-1 my-8 flex flex-col justify-center">
        <div className="space-y-4">
          {(data.features || []).map((feature, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border backdrop-blur-md transition-all shadow-md"
              style={{ 
                borderColor: `${primaryColor}30`,
                boxShadow: `0 4px 20px ${primaryColor}08`
              }}
            >
              <div 
                className="p-1.5 rounded-xl shrink-0 mt-0.5"
                style={{ backgroundColor: `${primaryColor}25` }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <p className="text-xl text-white/90 leading-snug">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-white/40">
        <div className="text-base font-bold text-white/80">
          {appName}
        </div>
        <div className="text-xs font-medium text-white/50">
          Generated with <span className="font-bold text-white/70">UpToDate</span> • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
});

export default Poster;
