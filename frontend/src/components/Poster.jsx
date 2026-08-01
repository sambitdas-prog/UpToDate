import React, { useEffect, useState } from 'react';
import { 
  Sparkles, CheckCircle2, Zap, Shield, Eye, Bug, PenTool, Layout, Box, Star, Layers, 
  Navigation, ChevronRight, AlertTriangle, Compass, MapPin, Plus, Edit3, Trash2, Folder, 
  FileText, Settings, Search, User, X 
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
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(59, 130, 246, ${alpha})`;
  let clean = hex.slice(1);
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return `rgba(59, 130, 246, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Poster = React.forwardRef(({ data }, ref) => {
  const [brandColors, setBrandColors] = useState(() => {
    if (data?.app_palette && Array.isArray(data.app_palette) && data.app_palette.length > 0) {
      return data.app_palette;
    }
    return ['#3B82F6', '#8B5CF6', '#14B8A6', '#F59E0B'];
  });
  const [imgError, setImgError] = useState(false);
  const [removedIndices, setRemovedIndices] = useState([]);
  const [hideNavSection, setHideNavSection] = useState(false);
  const [hideWarningNote, setHideWarningNote] = useState(false);
  const [customHeadline, setCustomHeadline] = useState('');
  const [customSubheadline, setCustomSubheadline] = useState('');

  useEffect(() => {
    setImgError(false);
  }, [data?.app_avatar]);

  useEffect(() => {
    setRemovedIndices([]);
    setHideNavSection(false);
    setHideWarningNote(false);
  }, [data?.features, data?.navigation_path, data?.warning_note, data?.important_note, data?.relocation_notice]);

  useEffect(() => {
    setCustomHeadline(data?.headline || data?.title || "Weekly Release Update");
    setCustomSubheadline(String(data?.subheadline || (typeof data?.what_is_it === 'string' ? data.what_is_it : (typeof data?.summary === 'string' ? data.summary : '')) || ''));
  }, [data?.headline, data?.title, data?.subheadline, data?.what_is_it, data?.summary]);

  useEffect(() => {
    if (data?.app_palette && Array.isArray(data.app_palette) && data.app_palette.length > 0) {
      setBrandColors(data.app_palette);
      return;
    }
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
  }, [data?.app_palette, data?.app_avatar, imgError]);

  const primaryBrandColor = brandColors[0] || '#3B82F6';
  const getThemeColor = (index = 0) => brandColors[index % brandColors.length] || '#3B82F6';

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
  const features = rawFeatures
    .map((f, originalIndex) => ({ item: f, originalIndex }))
    .filter(({ item, originalIndex }) => item !== null && item !== undefined && !removedIndices.includes(originalIndex));
  const explanationText = typeof data.what_is_it === 'string' ? data.what_is_it : (typeof data.summary === 'string' ? data.summary : '');
  const navSteps = Array.isArray(data.navigation_path)
    ? data.navigation_path.filter(Boolean).map(s => String(s))
    : (typeof data.navigation_path === 'string'
        ? data.navigation_path.split(/->|→|>|:/).map(s => s.trim()).filter(Boolean)
        : null);

  const isMultiFeature = data.update_type === 'multi_feature' || 
    (!data.update_type && features.length >= 2);

  const primaryColor = brandColors[0] || '#3B82F6';
  const secondaryColor = brandColors.length > 1 ? brandColors[1] : primaryColor;

  return (
    <div 
      ref={ref}
      className="w-[640px] min-h-[960px] border border-white/15 rounded-3xl p-7 flex flex-col justify-between relative font-sans shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden text-left"
      style={{ 
        background: `radial-gradient(circle at 12% 10%, ${hexToRgba(primaryColor, 0.22)} 0%, transparent 42%), radial-gradient(circle at 88% 90%, ${hexToRgba(secondaryColor, 0.18)} 0%, transparent 45%), linear-gradient(165deg, #0d0f17 0%, #08090e 50%, #050609 100%)`,
        '--brand-color': primaryColor
      }}
    >
      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      ></div>

      {/* HEADER SECTION */}
      <div 
        className="relative z-10 flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg mb-6"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-xl bg-white/10 p-0.5 border border-white/20 overflow-hidden shadow-lg shrink-0"
            style={{ borderColor: hexToRgba(primaryColor, 0.5) }}
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
            <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest">APPLICATION</div>
            <div className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">{appName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.theme_keyword && (
            <span 
              className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/[0.06] text-white/90 border border-white/10 shadow-sm"
            >
              #{data.theme_keyword}
            </span>
          )}
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/[0.06] text-white/90 border border-white/10 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            <span>{isMultiFeature ? 'Multi-Feature Release' : 'Feature Release'}</span>
          </div>
        </div>
      </div>

      {/* SECONDARY LINES / TITLE AREA */}
      <div className="relative z-10 flex flex-col items-start text-left mb-6">
        <h1 
          contentEditable="plaintext-only"
          suppressContentEditableWarning={true}
          onBlur={(e) => {
            const val = e.currentTarget.textContent;
            if (val !== null && val !== undefined) {
              setCustomHeadline(val);
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
          }}
          title="Tap to rewrite headline"
          className="text-3xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-sm outline-none focus:outline-none focus:ring-0 cursor-text hover:text-white/95 transition-colors"
        >
          {customHeadline}
        </h1>
        {customSubheadline && (
          <p 
            contentEditable="plaintext-only"
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              const val = e.currentTarget.textContent;
              if (val !== null && val !== undefined) {
                setCustomSubheadline(val);
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData('text/plain');
              document.execCommand('insertText', false, text);
            }}
            title="Tap to rewrite description"
            className="text-sm text-white/85 leading-relaxed font-normal outline-none focus:outline-none focus:ring-0 cursor-text hover:text-white/95 transition-colors"
          >
            {customSubheadline}
          </p>
        )}

        {(() => {
          const images = data.importedImages && Array.isArray(data.importedImages) && data.importedImages.length > 0
            ? data.importedImages
            : (data.heroImageUrl && typeof data.heroImageUrl === 'string' ? [{ id: 'hero', url: data.heroImageUrl, orientation: 'landscape' }] : []);

          if (images.length === 0) return null;

          if (images.length === 1) {
            const img = images[0];
            const isPortrait = img.orientation === 'portrait';
            return (
              <div 
                className={`mt-4 rounded-xl border border-white/15 overflow-hidden shadow-2xl relative group mx-auto ${
                  isPortrait 
                    ? 'w-full max-w-[280px] aspect-[3/4]' 
                    : 'w-full max-h-60 aspect-[16/9]'
                }`}
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.05] to-transparent z-10"></div>
                <img 
                  src={img.url} 
                  alt={img.name || "Feature Screenshot"} 
                  className="w-full h-full object-cover" 
                  crossOrigin={img.url.startsWith('data:') ? undefined : "anonymous"}
                />
              </div>
            );
          }

          const isLandscapeLayout = images[0].orientation === 'landscape';
          return (
            <div 
              className={`w-full max-w-[520px] aspect-[4/3] mx-auto mt-4 rounded-xl border border-white/15 overflow-hidden shadow-2xl relative group flex ${
                isLandscapeLayout ? 'flex-col divide-y divide-white/15' : 'flex-row divide-x divide-white/15'
              }`}
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.05] to-transparent z-10"></div>
              {images.slice(0, 2).map((img, idx) => (
                <div key={img.id || idx} className="flex-1 min-w-0 min-h-0 relative overflow-hidden">
                  <img 
                    src={img.url} 
                    alt={img.name || `Feature Screenshot ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                    crossOrigin={img.url.startsWith('data:') ? undefined : "anonymous"}
                  />
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* FEATURE ROWS (STACKED ONE BY ONE VERTICALLY) */}
      <div className="relative z-10 flex-1 w-full flex flex-col gap-3 my-2 justify-start">
        {features.map(({ item: feature, originalIndex }) => {
          const isObject = feature && typeof feature === 'object';
          const title = isObject ? String(feature.title || '') : String(feature || '');
          const description = isObject ? String(feature.description || '') : '';
          const category = isObject ? String(feature.category || 'NEW') : 'NEW';
          const hint = isObject && feature.icon_hint ? String(feature.icon_hint).toLowerCase() : 'check';
          const IconComponent = IconMap[hint] || CheckCircle2;

          return (
            <div 
              key={originalIndex}
              className="group w-full flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 shadow-md relative overflow-hidden transition-all"
            >
              {/* Left Brand Accent Line */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 opacity-90"
                style={{ backgroundColor: primaryColor }}
              ></div>

              {/* Hover Remove Cross Button (invisible unless hovering, ignored by html2canvas PNG download) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRemovedIndices(prev => [...prev, originalIndex]);
                }}
                title="Remove this feature row from poster"
                data-html2canvas-ignore="true"
                className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-black/70 hover:bg-red-500/90 border border-white/15 hover:border-red-400 text-white/70 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Professional Category Badge */}
              <div 
                className="shrink-0 font-mono font-bold text-[10px] tracking-wider rounded-md border border-white/15 bg-white/[0.06] text-white/90 px-2.5 py-1 flex items-center gap-1.5 relative z-10 mt-0.5 shadow-sm"
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span>{category.toUpperCase()}</span>
              </div>

              {/* Title & Description Column */}
              <div className="flex-1 min-w-0 text-left relative z-10 pr-6">
                <h4 className="text-sm font-bold text-white leading-snug tracking-tight mb-1">{title}</h4>
                {description && (
                  <p className="text-xs text-white/75 leading-relaxed font-normal">{description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* REDESIGNED NAVIGATION PATH COMPONENT */}
      {!hideNavSection && navSteps && navSteps.length > 0 && (
        <div 
          className="group relative z-10 w-full my-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 shadow-xl overflow-hidden transition-all"
        >
          {/* Hover Close Button (ignored by PNG export) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHideNavSection(true);
            }}
            title="Remove 'How to Navigate' section from poster"
            data-html2canvas-ignore="true"
            className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-black/70 hover:bg-red-500/90 border border-white/15 hover:border-red-400 text-white/70 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Top Card Header */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/[0.06] border border-white/10 shadow-inner"
              >
                <Compass className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-white/90">
                How to Navigate
              </span>
            </div>
            <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider pr-6">
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                      isLast 
                        ? 'text-white bg-white/[0.12] border-white/25 shadow-md' 
                        : 'text-white/80 bg-white/[0.04] border-white/10'
                    }`}
                  >
                    {/* Step Index Pill */}
                    <span 
                      className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-mono font-black shrink-0"
                      style={{ 
                        backgroundColor: isLast ? primaryColor : 'rgba(255, 255, 255, 0.15)',
                        color: isLast ? '#000000' : '#ffffff'
                      }}
                    >
                      {sIdx + 1}
                    </span>

                    {/* Step Title */}
                    <span className="tracking-tight text-white">{step}</span>

                    {/* Target Pin on Final Step */}
                    {isLast && (
                      <MapPin className="w-3.5 h-3.5 shrink-0 ml-0.5" style={{ color: primaryColor }} />
                    )}
                  </div>

                  {sIdx < navSteps.length - 1 && (
                    <div className="flex items-center justify-center text-white/50 shrink-0 px-0.5">
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
      {(() => {
        const rawNote = data.warning_note || data.important_note || data.relocation_notice;
        if (!rawNote || hideWarningNote) return null;
        const noteText = typeof rawNote === 'string'
          ? rawNote.replace(/^(?:Important )?Note:\s*/i, '')
          : String(rawNote);

        return (
          <div className="group relative z-10 w-full my-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-lg flex items-start gap-2.5 transition-all">
            {/* Hover Close Button (ignored by PNG export) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setHideWarningNote(true);
              }}
              title="Remove 'Important Note' section from poster"
              data-html2canvas-ignore="true"
              className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-black/70 hover:bg-red-500/90 border border-white/15 hover:border-red-400 text-white/70 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 text-xs font-medium leading-relaxed pr-6">
              <span className="font-bold text-amber-300 mr-1.5">Important Note:</span>
              {noteText}
            </div>
          </div>
        );
      })()}

      {/* FOOTER */}
      <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10 flex justify-between items-center text-white/60">
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-white/90">{appName}</div>
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
          <div className="text-xs font-semibold tracking-wide text-white/70">Release Notes</div>
        </div>
        <div className="text-xs font-semibold text-white/70 bg-white/[0.06] px-3 py-1 rounded-full border border-white/10">
          Generated with <span className="font-bold text-white/90">UpToDate</span> • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
});

export default Poster;
