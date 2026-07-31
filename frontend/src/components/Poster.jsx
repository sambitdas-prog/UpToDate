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
    if (!data?.app_avatar || imgError) return;
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = data.app_avatar;
      img.onload = async () => {
        try {
          const swatches = await getSwatches(img, 4);
          if (swatches && Array.isArray(swatches) && swatches.length > 0) {
            const hexColors = swatches.map(rgb => 
              Array.isArray(rgb) ? `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}` : '#3B82F6'
            );
            setBrandColors(hexColors);
          }
        } catch (e) {
          console.warn("Color extraction failed, using defaults", e);
        }
      };
      img.onerror = () => {
        setImgError(true);
      };
    } catch (e) {
      console.warn("Avatar image error", e);
    }
  }, [data?.app_avatar, imgError]);

  const primaryBrandColor = brandColors[0];
  const getThemeColor = (index = 0) => brandColors[index % brandColors.length];

  if (!data) {
    return (
      <div 
        ref={ref}
        className="w-[640px] h-[960px] flex items-center justify-center bg-[#050505] border border-white/10 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.9)] relative overflow-hidden p-12"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none"></div>
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
        className="w-[640px] h-[960px] flex flex-col items-center justify-center bg-[#050505] border border-cyan-500/20 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.9)] relative overflow-hidden p-12 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_60%)] pointer-events-none"></div>
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
        <p className="text-white/60 text-base max-w-md leading-relaxed relative z-10">
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
  const rawFeatures = Array.isArray(data.features) ? data.features : [];
  const features = rawFeatures.filter(f => f !== null && f !== undefined);
  const explanationText = typeof data.what_is_it === 'string' ? data.what_is_it : (typeof data.summary === 'string' ? data.summary : '');
  const navSteps = Array.isArray(data.navigation_path)
    ? data.navigation_path.filter(Boolean).map(s => String(s))
    : (typeof data.navigation_path === 'string'
        ? data.navigation_path.split(/->|→|>|:/).map(s => s.trim()).filter(Boolean)
        : null);

  const isMultiFeature = data.update_type === 'multi_feature' || 
    (!data.update_type && features.length >= 2);

  return (
    <div 
      ref={ref}
      className="w-[640px] min-h-[960px] bg-black border border-white/20 rounded-3xl p-7 flex flex-col justify-between relative font-sans shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden text-left"
      style={{ 
        '--brand-color': primaryBrandColor, 
        '--brand-color-1': getThemeColor(0), 
        '--brand-color-2': getThemeColor(1), 
        '--brand-color-3': getThemeColor(2), 
        '--brand-color-4': getThemeColor(3), 
        borderColor: 'rgba(255, 255, 255, 0.2)' 
      }}
    >
      {/* Ambient Radial Background Glows */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-30"
        style={{ backgroundColor: getThemeColor(0) }}
      ></div>
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-25"
        style={{ backgroundColor: getThemeColor(1) }}
      ></div>

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      ></div>

      {/* HEADER SECTION */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-xl bg-white/10 p-0.5 border border-white/20 overflow-hidden shadow-lg shrink-0"
            style={{ borderColor: hexToRgba(getThemeColor(0), 0.5) }}
          >
            {!imgError && avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={appName} 
                className="w-full h-full object-cover rounded-[10px]" 
                crossOrigin="Anonymous"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white font-bold text-base">
                {appName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">APPLICATION</div>
            <div className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">{appName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.theme_keyword && (
            <span 
              className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/15 shadow-sm backdrop-blur-md"
              style={{ borderColor: hexToRgba(getThemeColor(0), 0.4) }}
            >
              #{data.theme_keyword}
            </span>
          )}
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white border border-white/20 shadow-sm backdrop-blur-md"
            style={{ borderColor: hexToRgba(getThemeColor(1), 0.5), backgroundColor: hexToRgba(getThemeColor(1), 0.15) }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: getThemeColor(1) }} />
            <span>{isMultiFeature ? 'Multi-Feature Release' : 'Feature Release'}</span>
          </div>
        </div>
      </div>

      {/* SECONDARY LINES / TITLE AREA */}
      <div className="relative z-10 flex flex-col items-start text-left mb-6">
        <h1 
          className="text-3xl font-black text-transparent bg-clip-text leading-tight mb-2 tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.1)]"
          style={{ backgroundImage: `linear-gradient(to bottom right, #ffffff, ${hexToRgba(getThemeColor(1), 0.95)})` }}
        >
          {data.headline || data.title || "Weekly Release Update"}
        </h1>
        {(data.subheadline || explanationText) && (
          <p className="text-sm text-white/75 leading-relaxed font-normal drop-shadow-sm">
            {String(data.subheadline || explanationText)}
          </p>
        )}

        {data.heroImageUrl && typeof data.heroImageUrl === 'string' && (
          <div className="w-full max-h-48 mt-4 rounded-xl border border-white/10 overflow-hidden shadow-2xl relative group">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.05] to-transparent z-10"></div>
            <img 
              src={data.heroImageUrl} 
              alt="Feature Screenshot" 
              className="w-full h-full object-cover" 
              crossOrigin={data.heroImageUrl.startsWith('data:') ? undefined : "anonymous"}
            />
          </div>
        )}
      </div>

      {/* FEATURE ROWS (STACKED ONE BY ONE VERTICALLY) */}
      <div className="relative z-10 flex-1 w-full flex flex-col gap-3 my-2 justify-start">
        {features.map((feature, idx) => {
          const isObject = feature && typeof feature === 'object';
          const title = isObject ? String(feature.title || '') : String(feature || '');
          const description = isObject ? String(feature.description || '') : '';
          const category = isObject ? String(feature.category || 'NEW') : 'NEW';
          const hint = isObject && feature.icon_hint ? String(feature.icon_hint).toLowerCase() : 'check';
          const IconComponent = IconMap[hint] || CheckCircle2;
          const rowColor = getThemeColor(idx % brandColors.length);

          return (
            <div 
              key={idx}
              className="w-full flex items-start gap-3.5 p-3.5 rounded-xl bg-black/50 border shadow-md relative overflow-hidden transition-all"
              style={{ borderColor: hexToRgba(rowColor, 0.3) }}
            >
              {/* Left Accent Color Bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5 opacity-90"
                style={{ backgroundColor: rowColor }}
              ></div>
              <div 
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{ background: `linear-gradient(to right, ${hexToRgba(rowColor, 0.6)}, transparent 60%)` }}
              ></div>

              {/* Category Badge Pill */}
              <div 
                className="shrink-0 font-mono font-bold text-[10px] tracking-wider rounded-lg border px-2.5 py-1 flex items-center gap-1.5 relative z-10 mt-0.5"
                style={{ backgroundColor: hexToRgba(rowColor, 0.15), borderColor: hexToRgba(rowColor, 0.4), color: rowColor }}
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>{category.toUpperCase()}</span>
              </div>

              {/* Title & Description Column */}
              <div className="flex-1 min-w-0 text-left relative z-10">
                <h4 className="text-sm font-bold text-white leading-snug tracking-tight mb-1">{title}</h4>
                {description && (
                  <p className="text-xs text-white/60 leading-relaxed">{description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* REDESIGNED NAVIGATION PATH COMPONENT */}
      {navSteps && navSteps.length > 0 && (
        <div 
          className="relative z-10 w-full my-3 p-4 rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/15 shadow-2xl overflow-hidden transition-all"
          style={{ borderColor: hexToRgba(getThemeColor(0), 0.35) }}
        >
          {/* Subtle Ambient Gradient Glow */}
          <div 
            className="absolute -top-12 -left-12 w-40 h-40 rounded-full blur-2xl pointer-events-none opacity-20"
            style={{ backgroundColor: getThemeColor(0) }}
          ></div>

          {/* Top Card Header */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center justify-center w-6 h-6 rounded-lg border shadow-inner"
                style={{ backgroundColor: hexToRgba(getThemeColor(0), 0.2), borderColor: hexToRgba(getThemeColor(0), 0.5) }}
              >
                <Compass className="w-3.5 h-3.5" style={{ color: getThemeColor(0) }} />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-white/90">
                How to Navigate
              </span>
            </div>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              Step-by-step path
            </span>
          </div>

          {/* Full-Width Step Flow Container */}
          <div className="w-full flex flex-wrap items-center gap-2">
            {navSteps.map((step, sIdx) => {
              const isLast = sIdx === navSteps.length - 1;
              return (
                <React.Fragment key={sIdx}>
                  <div 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md ${
                      isLast 
                        ? 'text-white bg-white/15 shadow-lg' 
                        : 'text-white/80 bg-black/50 border-white/10 hover:border-white/20'
                    }`}
                    style={{ 
                      borderColor: isLast ? hexToRgba(getThemeColor(0), 0.8) : 'rgba(255,255,255,0.12)',
                      backgroundColor: isLast ? hexToRgba(getThemeColor(0), 0.25) : undefined
                    }}
                  >
                    {/* Step Index Pill */}
                    <span 
                      className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-mono font-black shrink-0"
                      style={{ 
                        backgroundColor: isLast ? getThemeColor(0) : 'rgba(255,255,255,0.15)',
                        color: isLast ? '#000' : '#fff'
                      }}
                    >
                      {sIdx + 1}
                    </span>

                    {/* Step Title */}
                    <span className="tracking-tight">{step}</span>

                    {/* Target Pin on Final Step */}
                    {isLast && (
                      <MapPin className="w-3.5 h-3.5 shrink-0 ml-0.5" style={{ color: getThemeColor(0) }} />
                    )}
                  </div>

                  {sIdx < navSteps.length - 1 && (
                    <div className="flex items-center justify-center text-white/30 shrink-0 px-0.5">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* WARNING NOTE (IF PRESENT) */}
      {data.warning_note && (
        <div className="relative z-10 w-full my-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-lg flex items-start gap-2.5">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 text-xs font-medium leading-relaxed">
            <span className="font-bold text-amber-300 mr-1.5">Important Note:</span>
            {typeof data.warning_note === 'string'
              ? data.warning_note.replace(/^(?:Important )?Note:\s*/i, '')
              : String(data.warning_note)}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10 flex justify-between items-center text-white/40">
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-white/80">{appName}</div>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
          <div className="text-xs font-medium tracking-wide text-white/50">Release Notes</div>
        </div>
        <div className="text-xs font-medium text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          Generated with <span className="font-bold text-white/80">UpToDate</span> • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
});

export default Poster;
