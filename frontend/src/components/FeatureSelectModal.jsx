import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  Sparkles, 
  Layers, 
  Trash2, 
  ArrowRight,
  CheckCircle2,
  Wrench,
  Zap,
  Shield,
  Code2,
  Sparkle,
  X
} from 'lucide-react';

const IconMap = {
  check: CheckCircle2,
  wrench: Wrench,
  zap: Zap,
  shield: Shield,
  code: Code2,
  sparkle: Sparkle,
};

const categoryColors = {
  NEW: '#22d3ee',      // Bright Cyan/Teal
  FIX: '#f87171',      // Vibrant Coral Red
  PERF: '#c084fc',     // Bright Purple/Violet
  POLISH: '#60a5fa',   // Bright Blue/Sky
  SECURITY: '#fbbf24', // Vibrant Amber/Gold
  REFACTOR: '#34d399', // Bright Emerald Green
};

export default function FeatureSelectModal({
  isOpen,
  features = [],
  onContinue,
  onClear,
  onClose,
}) {
  const [selectedIndices, setSelectedIndices] = useState([]);

  // When modal opens or features list updates, select all features by default
  useEffect(() => {
    if (isOpen && features && features.length > 0) {
      setSelectedIndices(features.map((_, i) => i));
    }
  }, [isOpen, features]);

  if (!isOpen || !features || features.length === 0) return null;

  const toggleSelection = (index) => {
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
  };

  const handleSelectAll = () => {
    setSelectedIndices(features.map((_, i) => i));
  };

  const handleClear = () => {
    setSelectedIndices([]);
    if (onClear) onClear();
  };

  const handleContinue = () => {
    if (selectedIndices.length === 0) return;
    onContinue(selectedIndices);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/75 animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col gap-6 max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Section */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Select Features for Poster
                <Sparkles className="w-4 h-4 text-white/80" />
              </h3>
              <p className="text-xs md:text-sm text-white/60 mt-0.5">
                We fetched <span className="text-white font-semibold">{features.length}</span> features from your commits. Choose which ones to keep in your poster:
              </p>
            </div>
          </div>

          {/* Right Area: Selection Counter Pill & Simple Close Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-semibold">
              {selectedIndices.length} / {features.length} selected
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl border border-white/10 hover:border-white/30 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Features Selection Area with generous horizontal padding so borders NEVER get clipped/cut out */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1 -mx-2.5 flex flex-col gap-3 max-h-[52vh] custom-scrollbar">
          {features.map((feature, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const isObject = feature && typeof feature === 'object';
            const title = isObject ? String(feature.title || '') : String(feature || '');
            const description = isObject ? String(feature.description || '') : '';
            const category = isObject ? String(feature.category || 'NEW').toUpperCase() : 'NEW';
            const hint = isObject && feature.icon_hint ? String(feature.icon_hint).toLowerCase() : 'check';
            const IconComponent = IconMap[hint] || CheckCircle2;
            const badgeColor = categoryColors[category] || '#22d3ee';

            return (
              <div
                key={idx}
                onClick={() => toggleSelection(idx)}
                className={`w-full flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-white/[0.12] border-white/65 shadow-[0_0_25px_rgba(255,255,255,0.08)]'
                    : 'bg-white/[0.045] border-white/20 hover:border-white/35 hover:bg-white/[0.065]'
                }`}
              >
                {/* Left Checkbox Icon */}
                <div className="shrink-0 mt-0.5">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-white" />
                  ) : (
                    <Square className="w-5 h-5 text-white/60" />
                  )}
                </div>

                {/* Colourful Category Badge Pill representing feature type */}
                <div
                  className="shrink-0 font-mono font-bold text-[10px] tracking-wider rounded-lg border px-2.5 py-1 flex items-center gap-1.5 mt-0.5"
                  style={{
                    backgroundColor: `${badgeColor}25`,
                    borderColor: `${badgeColor}70`,
                    color: badgeColor,
                  }}
                >
                  <IconComponent className="w-3.5 h-3.5 shrink-0" style={{ color: badgeColor }} />
                  <span>{category}</span>
                </div>

                {/* Title & Description Row Content */}
                <div className="flex-1 min-w-0 text-left">
                  <h4 className={`text-sm font-bold leading-snug tracking-tight mb-1 ${
                    isSelected ? 'text-white' : 'text-white/95'
                  }`}>
                    {title}
                  </h4>
                  {description && (
                    <p className={`text-xs leading-relaxed ${
                      isSelected ? 'text-white/80' : 'text-white/75'
                    }`}>
                      {description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Buttons Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {/* Left Buttons Group: Select All & Clear */}
          <div className="flex items-center gap-2.5">
            {/* 1) Select All Button */}
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-white/90 hover:text-white hover:bg-white/10 font-medium text-sm transition-all flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4 text-white/80" />
              Select All
            </button>

            {/* 2) Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-white/90 hover:text-white hover:bg-white/10 font-medium text-sm transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-white/60" />
              Clear
            </button>
          </div>

          {/* Right Button: Continue */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedIndices.length === 0}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              selectedIndices.length > 0
                ? 'bg-white hover:bg-white/90 text-black shadow-lg shadow-white/10 active:scale-[0.98]'
                : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
