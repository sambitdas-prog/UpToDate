import React, { useEffect, useState } from 'react';
import { 
  Sparkles, CheckCircle2, Zap, Shield, Eye, Bug, PenTool, Layout, Box, Star, Layers, 
  Navigation, ChevronRight, AlertTriangle, Compass, MapPin, Plus, Edit3, Trash2, Folder, 
  FileText, Settings, Search, User 
} from 'lucide-react';
import { getSwatches } from 'colorthief';

const IconMap = {
  zap: Zap,
  shield: Shield,
  eye: Eye,
  bug: Bug,
  tool: PenTool,
  layout: Layout,
  box: Box,
  star: Star,
  layers: Layers,
  plus: Plus,
  edit: Edit3,
  trash: Trash2,
  folder: Folder,
  file: FileText,
  settings: Settings,
  search: Search,
  user: User,
  check: CheckCircle2,
  navigation: Navigation,
  compass: Compass,
  pin: MapPin
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
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [data?.app_avatar]);

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
          The selected references have no differences. No release poster is needed for identical branches.
        </p>
      </div>
    );
  }

  const formatAppName = (name, repo) => {
    if (name && typeof name === 'string' && !['app', 'application', 'unknown', 'untitled', 'release update', 'git diff', 'update', 'release', 'aether'].includes(name.trim().toLowerCase())) {
      return name.trim();
    }
    if (repo && typeof repo === 'string') {
      return repo.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Application Update';
  };

  const appName = formatAppName(data.app_name, data.app_repo);
  const avatarUrl = data.app_avatar;
  const features = data.features || [];
  const explanationText = data.what_is_it || data.summary;
  const navSteps = Array.isArray(data.navigation_path)
    ? data.navigation_path
    : (typeof data.navigation_path === 'string'
        ? data.navigation_path.split(/->|→|>|:/).map(s => s.trim()).filter(Boolean)
        : ['Main Menu', 'Select Feature']);
  // Smart column vs grid layout optimization:
  // - 1 to 3 items: Use COLUMNS (grid-cols-1, grid-cols-2, or grid-cols-3) so all items sit across 1 row.
  // - 4 items: Use 2x2 GRID (grid-cols-2) when there is a good amount of information to share.
  // - 5 items: Use 6 columns where top row has 3 items (col-span-2) and bottom row has 2 items (col-span-3) for zero empty space.
  // - 6+ items: Use 3-column grid (grid-cols-3).
  const gridColsClass = features.length === 4 
    ? 'grid-cols-2' 
    : (features.length === 5 
        ? 'grid-cols-6' 
        : (features.length === 2 ? 'grid-cols-2' : (features.length === 1 ? 'grid-cols-1' : 'grid-cols-3')));

  const getColSpanClass = (idx, total) => {
    if (total === 5) {
      return idx < 3 ? 'col-span-2' : 'col-span-3';
    }
    return '';
  };

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

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 bg-white/[0.06] border border-white/10 px-4 py-2.5 rounded-2xl shadow-xl">
          {avatarUrl && !imgError ? (
            <img 
              src={avatarUrl} 
              alt={appName} 
              crossOrigin={avatarUrl.startsWith('data:') ? undefined : 'anonymous'}
              className="w-8 h-8 rounded-xl object-contain border border-white/20 shadow-sm bg-white p-0.5"
              onError={() => setImgError(true)}
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

      {/* a) The "What's New" Header (Feature-First) & b) The "What is it?" Section (Explanation) */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-6xl font-black text-transparent bg-clip-text leading-tight mb-3 tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.1)]"
            style={{ backgroundImage: `linear-gradient(to bottom right, #ffffff, ${hexToRgba(getThemeColor(1), 0.9)})` }}>
          {data.headline || data.title}
        </h1>
        {data.subheadline && (
          <h2 className="text-2xl font-bold text-white/80 mb-4 tracking-wide">{data.subheadline}</h2>
        )}
        <p className="text-xl text-white/70 leading-relaxed max-w-3xl font-light mb-8 drop-shadow-sm">
          {explanationText}
        </p>

        {/* Primary Main Screenshot or Mockup of Feature in Action */}
        {data.heroImageUrl && (
          <div className="w-full max-w-2xl mb-8 rounded-2xl border border-white/10 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)] relative group">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.05] to-transparent z-10"></div>
            <img 
              src={data.heroImageUrl} 
              alt="Feature Screenshot" 
              className="w-full h-auto object-cover" 
              crossOrigin={data.heroImageUrl.startsWith('data:') ? undefined : "anonymous"}
            />
          </div>
        )}
      </div>

      {/* c) The "What You Can Do" Grid (Capabilities) */}
      <div className="relative z-10 flex-1 w-full my-4">
        <div className={`grid gap-4 ${gridColsClass}`}>
          {features.map((feature, idx) => {
            const isObject = typeof feature === 'object';
            const title = isObject ? feature.title : feature;
            const description = isObject ? feature.description : '';
            const category = isObject ? feature.category : '';
            const hint = isObject ? feature.icon_hint?.toLowerCase() : 'check';
            const IconComponent = IconMap[hint] || CheckCircle2;
            
            // Assign a color from the palette to each feature card for variety
            const cardColor = getThemeColor(idx % brandColors.length);
            const colSpanClass = getColSpanClass(idx, features.length);

            return (
              <div 
                key={idx} 
                className={`flex flex-col gap-3 p-5 rounded-2xl bg-black/40 border shadow-2xl relative overflow-hidden ${colSpanClass}`}
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
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 text-white/70 border border-white/10">
                      {category}
                    </span>
                  )}
                </div>
                <div className="relative z-10 mt-1">
                  <h4 className="text-lg font-bold text-white mb-1 leading-snug tracking-tight">{title}</h4>
                  {description && <p className="text-sm text-white/60 leading-relaxed">{description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* d) The "How to Navigate" Section (Instructional Path) */}
      <div 
        className="relative z-10 w-full my-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-xl overflow-hidden flex flex-col gap-3"
        style={{ borderColor: hexToRgba(getThemeColor(0), 0.25) }}
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{ background: `radial-gradient(circle at left, ${hexToRgba(getThemeColor(0), 0.6)}, transparent 70%)` }}
        ></div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
          <Compass className="w-4 h-4" style={{ color: getThemeColor(0) }} />
          <span>How to Navigate</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {navSteps.map((step, sIdx) => (
            <React.Fragment key={sIdx}>
              <div 
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 border text-white font-semibold text-sm shadow-md"
                style={{ borderColor: sIdx === navSteps.length - 1 ? hexToRgba(getThemeColor(0), 0.6) : 'rgba(255,255,255,0.15)' }}
              >
                {sIdx === navSteps.length - 1 && (
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: getThemeColor(0) }} />
                )}
                <span>{step}</span>
              </div>
              {sIdx < navSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* e) Important Note/Warning Banner (Optional/Conditional) */}
      {data.warning_note && (
        <div className="relative z-10 w-full my-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-lg flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 text-sm font-medium leading-relaxed">
            <span className="font-bold text-amber-300 mr-1.5">Important Note:</span>
            {data.warning_note.replace(/^(?:Important )?Note:\s*/i, '')}
          </div>
        </div>
      )}

      {/* f) Footer */}
      <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-white/40">
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
