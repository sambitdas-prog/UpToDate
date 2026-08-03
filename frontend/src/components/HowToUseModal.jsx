import React, { useState, useEffect } from 'react';
import { X, HelpCircle, GitBranch, Sparkles, Sliders, Share2, Lightbulb } from 'lucide-react';

export default function HowToUseModal({ isOpen, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 280);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen && !isClosing) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing]);

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 ${
        isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-2xl bg-[#0a0a0a] border border-white/20 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col gap-6 max-h-[88vh] overflow-hidden ${
          isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.2)]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                How To Use This Tool
              </h3>
              <p className="text-xs md:text-sm text-white/60 mt-0.5">
                A simple step-by-step guide to generating your release posters.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-sm text-white/80 leading-relaxed custom-scrollbar">

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-3 text-purple-400 font-semibold text-base">
                <span className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                  1
                </span>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  <h4>Choose Your Input Method</h4>
                </div>
              </div>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed pl-10">
                You can generate release posters using two simple modes:
              </p>
              <ul className="pl-10 space-y-1.5 text-xs text-white/60 list-disc list-inside">
                <li>
                  <strong className="text-white/90">Auto Mode:</strong> Paste any public GitHub repository link (e.g., <code className="bg-white/10 px-1.5 py-0.5 rounded text-purple-300 font-mono">https://github.com/facebook/react</code>).
                </li>
                <li>
                  <strong className="text-white/90">Manual Mode:</strong> Compare two Git branches (like <code className="bg-white/10 px-1 py-0.5 rounded text-purple-300 font-mono">main</code> vs <code className="bg-white/10 px-1 py-0.5 rounded text-purple-300 font-mono">develop</code>) or upload screenshots of your commit history.
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-3 text-cyan-400 font-semibold text-base">
                <span className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0">
                  2
                </span>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <h4>Generate Release Highlights</h4>
                </div>
              </div>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed pl-10">
                Click the <strong className="text-white">"Generate Release Poster"</strong> button. The tool automatically analyzes code commits and categorizes changes into clear groups: <span className="text-cyan-300 font-medium">New Features</span>, <span className="text-red-300 font-medium">Bug Fixes</span>, <span className="text-purple-300 font-medium">Performance</span>, and <span className="text-amber-300 font-medium">Security Updates</span>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-3 text-emerald-400 font-semibold text-base">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
                  3
                </span>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <h4>Customize Features & Style</h4>
                </div>
              </div>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed pl-10">
                In the feature selection popup:
              </p>
              <ul className="pl-10 space-y-1.5 text-xs text-white/60 list-disc list-inside">
                <li>Check or uncheck features to select what appears on the poster.</li>
                <li>Edit version numbers, project title, and tagline.</li>
                <li>Select from visual themes (Dark Modern, Minimalist, Cyberpunk, etc.).</li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-3 text-amber-400 font-semibold text-base">
                <span className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
                  4
                </span>
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <h4>Download & Share</h4>
                </div>
              </div>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed pl-10">
                Preview your generated poster in real time! Click <strong className="text-white">"Download Poster"</strong> to save the image file, or click <strong className="text-white">"Share Release Poster"</strong> to copy rich release captions and post directly to LinkedIn, X (Twitter), Facebook, or WhatsApp.
              </p>
            </div>

          </div>

          {/* Useful Tips */}
          <div className="bg-gradient-to-br from-purple-500/10 via-amber-500/10 to-transparent border border-white/10 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-base">
              <Lightbulb className="w-4 h-4" />
              <h4>Pro Tips for Best Results</h4>
            </div>
            <ul className="space-y-2 text-xs text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Use Descriptive Commit Messages:</strong> Writing clear commit messages helps the tool generate clear and accurate feature bullet points.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Public GitHub Repos:</strong> Make sure the GitHub URL points to a public repository so the analysis can fetch the commit log.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Try Different Themes:</strong> Experiment with visual themes to match your project branding before exporting your poster image.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Footer Button */}
        <div className="pt-4 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all shadow-lg cursor-pointer active:scale-95"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
