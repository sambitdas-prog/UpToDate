import React, { useEffect, useState, useImperativeHandle, useCallback, useRef } from 'react';
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

const Poster = React.forwardRef(({ data, actionsRef, onHistoryUpdate }, ref) => {
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
  const [manualNoteAdded, setManualNoteAdded] = useState(false);
  const [customNoteText, setCustomNoteText] = useState('');
  const [customHeadline, setCustomHeadline] = useState('');
  const [customSubheadline, setCustomSubheadline] = useState('');
  const [customAppName, setCustomAppName] = useState('');
  const [customNavSteps, setCustomNavSteps] = useState([]);

  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isUndoingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const [historyVersion, setHistoryVersion] = useState(0);

  const stateRef = useRef();
  stateRef.current = {
    removedIndices, hideNavSection, hideWarningNote, manualNoteAdded,
    customNoteText, customHeadline, customSubheadline, customAppName, customNavSteps
  };

  // Initialize history on mount or data change
  useEffect(() => {
    isInitializedRef.current = false;
    const timer = setTimeout(() => {
      historyRef.current = [stateRef.current];
      historyIndexRef.current = 0;
      isUndoingRef.current = false;
      isInitializedRef.current = true;
      setHistoryVersion(v => v + 1);
    }, 500); // Wait for initial hydration to settle
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // only reset history when the entire poster data object changes

  // Track state changes
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
      return;
    }
    
    const currentSnapshot = stateRef.current;
    const prevSnapshot = historyRef.current[historyIndexRef.current];
    if (!prevSnapshot) return;

    if (JSON.stringify(currentSnapshot) !== JSON.stringify(prevSnapshot)) {
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(currentSnapshot);
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
      setHistoryVersion(v => v + 1);
    }
  }, [
    removedIndices, hideNavSection, hideWarningNote, manualNoteAdded,
    customNoteText, customHeadline, customSubheadline, customAppName, customNavSteps
  ]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoingRef.current = true;
      historyIndexRef.current -= 1;
      const prevState = historyRef.current[historyIndexRef.current];

      setRemovedIndices(prevState.removedIndices);
      setHideNavSection(prevState.hideNavSection);
      setHideWarningNote(prevState.hideWarningNote);
      setManualNoteAdded(prevState.manualNoteAdded);
      setCustomNoteText(prevState.customNoteText);
      setCustomHeadline(prevState.customHeadline);
      setCustomSubheadline(prevState.customSubheadline);
      setCustomAppName(prevState.customAppName);
      setCustomNavSteps(prevState.customNavSteps);
      
      setHistoryVersion(v => v + 1);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoingRef.current = true;
      historyIndexRef.current += 1;
      const nextState = historyRef.current[historyIndexRef.current];

      setRemovedIndices(nextState.removedIndices);
      setHideNavSection(nextState.hideNavSection);
      setHideWarningNote(nextState.hideWarningNote);
      setManualNoteAdded(nextState.manualNoteAdded);
      setCustomNoteText(nextState.customNoteText);
      setCustomHeadline(nextState.customHeadline);
      setCustomSubheadline(nextState.customSubheadline);
      setCustomAppName(nextState.customAppName);
      setCustomNavSteps(nextState.customNavSteps);
      
      setHistoryVersion(v => v + 1);
    }
  }, []);

  useEffect(() => {
    if (onHistoryUpdate) {
      onHistoryUpdate({
        canUndo: historyIndexRef.current > 0,
        canRedo: historyIndexRef.current < historyRef.current.length - 1 && historyIndexRef.current !== -1
      });
    }
  }, [historyVersion, onHistoryUpdate]);

  useImperativeHandle(actionsRef, () => ({
    undo: handleUndo,
    redo: handleRedo
  }), [handleUndo, handleRedo]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in a contenteditable or input
      if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmdKey && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if (cmdKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);
  useEffect(() => {
    setImgError(false);
  }, [data?.app_avatar]);

  useEffect(() => {
    const rawNote = data?.warning_note || data?.important_note || data?.relocation_notice;
    if (rawNote) {
      const clean = typeof rawNote === 'string' ? rawNote.replace(/^(?:Important )?Note:\s*/i, '') : String(rawNote);
      setCustomNoteText(clean);
      setManualNoteAdded(false);
    } else {
      setCustomNoteText('');
      setManualNoteAdded(false);
    }
  }, [data?.warning_note, data?.important_note, data?.relocation_notice]);

  useEffect(() => {
    setRemovedIndices([]);
    setHideNavSection(false);
    setHideWarningNote(false);
    setManualNoteAdded(false);
  }, [data?.features, data?.navigation_path, data?.warning_note, data?.important_note, data?.relocation_notice]);

  useEffect(() => {
    setCustomHeadline(data?.headline || data?.title || "Weekly Release Update");
    setCustomSubheadline(String(data?.subheadline || (typeof data?.what_is_it === 'string' ? data.what_is_it : (typeof data?.summary === 'string' ? data.summary : '')) || ''));
  }, [data?.headline, data?.title, data?.subheadline, data?.what_is_it, data?.summary]);

  const formatAppNameHelper = (name, repo) => {
    if (name && typeof name === 'string' && !['app', 'application', 'unknown', 'untitled', 'release update', 'git diff', 'update', 'release', 'aether'].includes(name.trim().toLowerCase())) {
      return name.trim();
    }
    if (repo && typeof repo === 'string') {
      return repo.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Application Update';
  };

  useEffect(() => {
    setCustomAppName(formatAppNameHelper(data?.app_name, data?.app_repo));
  }, [data?.app_name, data?.app_repo]);

  useEffect(() => {
    let steps = [];
    if (Array.isArray(data?.navigation_path)) {
      steps = data.navigation_path.filter(Boolean).map(s => String(s));
    } else if (typeof data?.navigation_path === 'string') {
      steps = data.navigation_path.split(/->|→|>|:/).map(s => s.trim()).filter(Boolean);
    }
    setCustomNavSteps(steps);
  }, [data?.navigation_path]);

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
        className="w-[640px] h-[960px] flex items-center justify-center bg-[#050505] border border-white/10 rounded-none shadow-[0_16px_50px_rgba(0,0,0,0.9)] relative overflow-hidden p-12"
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
        className="w-[640px] h-[960px] flex flex-col items-center justify-center bg-[#050505] border border-cyan-500/20 rounded-none shadow-[0_16px_50px_rgba(0,0,0,0.9)] relative overflow-hidden p-12 text-center"
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

  const appName = customAppName || formatAppNameHelper(data.app_name, data.app_repo);
  const avatarUrl = data.app_avatar;
  const rawFeatures = Array.isArray(data.features) ? data.features : [];
  const features = rawFeatures
    .map((f, originalIndex) => ({ item: f, originalIndex }))
    .filter(({ item, originalIndex }) => item !== null && item !== undefined && !removedIndices.includes(originalIndex));
  const explanationText = typeof data.what_is_it === 'string' ? data.what_is_it : (typeof data.summary === 'string' ? data.summary : '');
  const navSteps = customNavSteps;

  const isMultiFeature = data.update_type === 'multi_feature' || 
    (!data.update_type && features.length >= 2);

  const primaryColor = brandColors[0] || '#3B82F6';
  const secondaryColor = brandColors.length > 1 ? brandColors[1] : primaryColor;

  const autoNote = data?.warning_note || data?.important_note || data?.relocation_notice;
  const isAutoFetchedNote = Boolean(autoNote);
  const isNoteVisible = !hideWarningNote && (isAutoFetchedNote || manualNoteAdded);

  const handleAddManualNote = () => {
    if (isNoteVisible) return;
    setManualNoteAdded(true);
    setHideWarningNote(false);
    if (!customNoteText) {
      setCustomNoteText('Type important note here...');
    }
    setTimeout(() => {
      const el = document.querySelector('[data-important-note-edit]');
      if (el) {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 50);
  };

  return (
    <div className="relative w-[640px]">
      {/* Floating Add Important Notes Button (outside poster container so it scrolls with it and is ignored by PNG export) */}
      <button
        type="button"
        onClick={handleAddManualNote}
        disabled={isNoteVisible}
        title={
          isNoteVisible
            ? "Important Notes section is already added"
            : "Add Important Notes section manually"
        }
        data-html2canvas-ignore="true"
        className={`group/float absolute -left-12 sm:-left-14 md:-left-16 bottom-28 z-40 flex items-center gap-2 h-10 rounded-full px-3 transition-all duration-300 shadow-xl border ${
          isNoteVisible
            ? 'bg-zinc-800 border-zinc-700/60 text-zinc-500 cursor-not-allowed opacity-60 pointer-events-none'
            : 'bg-white hover:bg-amber-500/20 border-white/40 hover:border-amber-500/50 text-black hover:text-amber-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] cursor-pointer'
        }`}
      >
        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-serif italic font-extrabold text-sm shrink-0 transition-colors ${
          isNoteVisible
            ? 'bg-zinc-700/50 text-zinc-500'
            : 'bg-black group-hover/float:bg-amber-500 text-white group-hover/float:text-black'
        }`}>
          i
        </span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover/float:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold tracking-tight">
          Add Important Notes
        </span>
      </button>

      <div 
        ref={ref}
        className="w-[640px] min-h-[960px] border border-white/15 rounded-none p-7 flex flex-col justify-between relative font-sans shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden text-left"
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
            <div
              contentEditable="plaintext-only"
              suppressContentEditableWarning={true}
              onBlur={(e) => setCustomAppName(e.currentTarget.textContent.trim() || appName)}
              className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/40 rounded px-1 -ml-1 transition-all cursor-text"
              title="Click to edit application name"
            >
              {appName}
            </div>
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
                    className={`group/step relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                      isLast 
                        ? 'text-white bg-white/[0.12] border-white/25 shadow-md' 
                        : 'text-white/80 bg-white/[0.04] border-white/10'
                    }`}
                  >
                    {/* Hover close button to delete this step */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomNavSteps(prev => prev.filter((_, i) => i !== sIdx));
                      }}
                      title="Remove step"
                      data-html2canvas-ignore="true"
                      className="absolute -top-1.5 -right-1.5 z-20 w-4 h-4 rounded-full bg-black/85 hover:bg-red-500 border border-white/20 text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover/step:opacity-100 transition-opacity cursor-pointer shadow"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>

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

                    {/* Editable Step Title */}
                    <span
                      contentEditable="plaintext-only"
                      suppressContentEditableWarning={true}
                      data-step-index={sIdx}
                      onKeyDown={(e) => {
                        if (e.key === ',' || e.key === 'Enter' || (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey))) {
                          e.preventDefault();
                          const currentVal = e.currentTarget.textContent.trim() || 'Step';
                          setCustomNavSteps(prev => {
                            const next = [...prev];
                            next[sIdx] = currentVal;
                            next.splice(sIdx + 1, 0, 'New Step');
                            return next;
                          });
                          setTimeout(() => {
                            const el = document.querySelector(`[data-step-index="${sIdx + 1}"]`);
                            if (el) {
                              el.focus();
                              const range = document.createRange();
                              range.selectNodeContents(el);
                              const sel = window.getSelection();
                              sel.removeAllRanges();
                              sel.addRange(range);
                            }
                          }, 30);
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent.trim() || 'Step';
                        setCustomNavSteps(prev => {
                          const next = [...prev];
                          next[sIdx] = val;
                          return next;
                        });
                      }}
                      className="tracking-tight text-white outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/40 rounded px-1 -ml-1 transition-all cursor-text"
                    >
                      {step}
                    </span>

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

      {/* WARNING NOTE (IF PRESENT OR ADDED MANUALLY) */}
      {!hideWarningNote && (isAutoFetchedNote || manualNoteAdded) && (
        <div className="group relative z-10 w-full my-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-lg flex items-start gap-2.5 transition-all">
          {/* Hover Close Button (ignored by PNG export) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHideWarningNote(true);
              setManualNoteAdded(false);
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
            <span
              contentEditable="plaintext-only"
              suppressContentEditableWarning={true}
              data-important-note-edit
              onBlur={(e) => {
                setCustomNoteText(e.currentTarget.textContent.trim());
              }}
              className="outline-none focus:bg-amber-500/10 focus:ring-1 focus:ring-amber-400/50 rounded px-1 -ml-1 transition-all cursor-text text-amber-200"
            >
              {customNoteText || (isAutoFetchedNote ? '' : 'Type important note here...')}
            </span>
          </div>
        </div>
      )}

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
    </div>
  );
});

export default Poster;
