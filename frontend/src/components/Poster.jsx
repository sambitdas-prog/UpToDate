import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Zap, Shield, Eye, Bug, PenTool, Layout, Box, Star, Layers } from 'lucide-react';
import { getSwatches } from 'colorthief';

const IconMap = {
  zap: Zap,
  shield: Shield,
  eye: Eye,
  bug: Bug,
  tool: PenTool,
  layout: Layout,
  box: Box,
  star: Star
};

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Poster = React.forwardRef(({ data }, ref) => {
  const [brandColors, setBrandColors] = useState(['#3B82F6', '#8B5CF6', '#14B8A6', '#F59E0B']);

  useEffect(() => {
    const sourceUrl = data?.heroImageUrl || data?.app_avatar;
    if (sourceUrl) {
      const img = new Image();
      if (!sourceUrl.startsWith('data:')) {
        img.crossOrigin = 'Anonymous';
      }
      img.onload = async () => {
        try {
          const swatches = await getSwatches(img);
          if (swatches) {
            const extractedColors = [
              swatches.Vibrant?.color.hex(),
              swatches.LightVibrant?.color.hex(),
              swatches.DarkVibrant?.color.hex(),
              swatches.Muted?.color.hex()
            ].filter(Boolean);

            if (extractedColors.length > 0) {
              // Ensure we have enough colors by repeating if necessary
              setBrandColors(extractedColors);
            }
          }
        } catch (e) {
          console.error("ColorThief failed", e);
        }
      };
      img.src = sourceUrl;
    }
  }, [data?.heroImageUrl, data?.app_avatar]);

  const getThemeColor = (idx) => brandColors[idx % brandColors.length];
  const primaryBrandColor = getThemeColor(0);

  if (!data) {
    return (
      <div 
        ref={ref}
        className="w-[800px] h-[550px] flex items-center justify-center bg-[#050505] border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] relative overflow-hidden p-12"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none"></div>
        {/* Tech Grid Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ 
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        ></div>
        <p className="text-white/40 text-xl font-medium tracking-wide">No release data generated yet.</p>
      </div>
    );
  }

  if (data?.no_diff) {
    return (
      <div 
        ref={ref}
        className="w-[800px] h-[550px] flex flex-col items-center justify-center bg-[#050505] border border-cyan-500/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] relative overflow-hidden p-12 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_60%)] pointer-events-none"></div>
        {/* Tech Grid Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ 
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        ></div>
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center mb-6 shadow-inner relative z-10">
          <CheckCircle2 className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight relative z-10">Branches are Identical</h3>
        <p className="text-white/60 text-lg max-w-md leading-relaxed relative z-10">
          No release poster needed as the contents of both branches are identical.
        </p>
      </div>
    );
  }

  const appName = data.app_name || 'Application Update';
  const avatarUrl = data.app_avatar;
  const features = data.features || [];

  return (
    <div 
      ref={ref}
      className="w-[800px] min-h-[800px] h-auto bg-black border border-white/20 rounded-3xl p-10 flex flex-col justify-between relative font-sans shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden"
      style={{ '--brand-color': primaryBrandColor, '--brand-color-1': getThemeColor(0), '--brand-color-2': getThemeColor(1), '--brand-color-3': getThemeColor(2), '--brand-color-4': getThemeColor(3), borderColor: 'rgba(255, 255, 255, 0.2)' }}
    >
      {/* Premium Ambient Background (Canvas Safe) */}
      <div className="absolute inset-0 pointer-events-none bg-[#030303]"></div>

      {/* Complex Scattering Glows */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{ 
          background: `
            radial-gradient(circle at 15% 0%, ${hexToRgba(getThemeColor(0), 0.3)} 0%, transparent 50%),
            radial-gradient(circle at 85% 20%, ${hexToRgba(getThemeColor(1), 0.25)} 0%, transparent 45%),
            radial-gradient(circle at 50% 100%, ${hexToRgba(getThemeColor(2), 0.2)} 0%, transparent 60%),
            radial-gradient(circle at 0% 70%, ${hexToRgba(getThemeColor(3), 0.15)} 0%, transparent 40%)
          ` 
        }}
      ></div>

      {/* Tech Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ 
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Glass Reflection & Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,transparent_70%)]"></div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]"></div>
      <div className="absolute inset-0 pointer-events-none border-t border-white/[0.08] rounded-3xl"></div>

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 bg-white/[0.06] border border-white/10 px-4 py-2.5 rounded-2xl shadow-xl">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={appName} 
              crossOrigin="anonymous"
              className="w-8 h-8 rounded-xl object-cover border border-white/20 shadow-sm bg-white"
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

        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-[0_4px_16px_rgba(0,0,0,0.5)] bg-opacity-10"
          style={{ backgroundColor: hexToRgba(primaryBrandColor, 0.15), borderColor: hexToRgba(primaryBrandColor, 0.3) }}
        >
          <Sparkles className="w-4 h-4" style={{ color: primaryBrandColor }} />
          <span className="font-bold tracking-wider uppercase text-xs" style={{ color: primaryBrandColor }}>
            New Release Update
          </span>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-6xl font-black text-transparent bg-clip-text leading-tight mb-4 tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.1)]"
            style={{ backgroundImage: `linear-gradient(to bottom right, #ffffff, ${hexToRgba(getThemeColor(1), 0.9)})` }}>
          {data.headline || data.title}
        </h1>
        {data.subheadline && (
          <h2 className="text-2xl font-bold text-white/80 mb-4 tracking-wide">{data.subheadline}</h2>
        )}
        <p className="text-xl text-white/70 leading-relaxed max-w-3xl font-light mb-8 drop-shadow-sm">
          {data.summary}
        </p>

        {/* Optional Hero Image */}
        {data.heroImageUrl && (
          <div className="w-full max-w-2xl mb-10 rounded-2xl border border-white/10 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)] relative group">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.05] to-transparent z-10"></div>
            <img 
              src={data.heroImageUrl} 
              alt="Hero Screenshot" 
              className="w-full h-auto object-cover" 
              crossOrigin={data.heroImageUrl.startsWith('data:') ? undefined : "anonymous"}
            />
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="relative z-10 flex-1 w-full my-4">
        <div className={`grid gap-4 ${features.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {features.map((feature, idx) => {
            const isObject = typeof feature === 'object';
            const title = isObject ? feature.title : feature;
            const description = isObject ? feature.description : '';
            const category = isObject ? feature.category : '';
            const hint = isObject ? feature.icon_hint?.toLowerCase() : 'check';
            const IconComponent = IconMap[hint] || CheckCircle2;
            
            // Assign a color from the palette to each feature card for variety
            const cardColor = getThemeColor(idx % brandColors.length);
            const isOddLast = features.length % 2 !== 0 && idx === features.length - 1 && features.length > 1;

            return (
              <div 
                key={idx} 
                className={`flex flex-col gap-3 p-5 rounded-2xl bg-black/40 border shadow-2xl relative overflow-hidden ${isOddLast ? 'col-span-2' : ''}`}
                style={{ borderColor: hexToRgba(cardColor, 0.2) }}
              >
                {/* Subtle card internal glow */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{ background: `radial-gradient(circle at top right, ${hexToRgba(cardColor, 0.5)}, transparent 65%)` }}
                ></div>
                {/* Top edge reflection */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div className="flex items-center gap-3 relative z-10">
                  <div 
                    className="p-2 rounded-xl border border-white/5 shadow-inner"
                    style={{ backgroundColor: hexToRgba(cardColor, 0.15) }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: cardColor }} />
                  </div>
                  {category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/60 text-white/70 border border-white/5">
                      {category}
                    </span>
                  )}
                </div>
                <div className="relative z-10 mt-1">
                  <h4 className="text-lg font-bold text-white mb-1.5 leading-snug tracking-tight">{title}</h4>
                  {description && <p className="text-sm text-white/60 leading-relaxed">{description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-white/40">
        <div className="flex items-center gap-2">
          <div className="text-base font-bold text-white/80">{appName}</div>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
          <div className="text-sm font-medium tracking-wide">Release Notes</div>
        </div>
        <div className="text-xs font-medium text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          Generated with <span className="font-bold text-white/80">UpToDate</span> • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
});

export default Poster;
