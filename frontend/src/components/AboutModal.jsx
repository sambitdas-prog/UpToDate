import React, { useState, useEffect } from 'react';
import { X, Info, Sparkles, Target, Users, Zap, CheckCircle2 } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
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
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                About This Tool
              </h3>
              <p className="text-xs md:text-sm text-white/60 mt-0.5">
                Learn what UpToDate is, why it was created, and who can use it.
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
          
          {/* Section 1: What is UpToDate */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-base">
              <Sparkles className="w-4 h-4" />
              <h4>What is UpToDate?</h4>
            </div>
            <p className="text-white/70">
              <strong>UpToDate</strong> is a web application designed to transform boring software updates and Git commit logs into eye-catching, visual release posters. Instead of writing long plain-text changelogs that nobody reads, UpToDate creates professional graphics that bring your code updates to life.
            </p>
          </div>

          {/* Section 2: Purpose of This Tool */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <Target className="w-4 h-4" />
              <h4>Purpose of This Tool</h4>
            </div>
            <ul className="space-y-2 text-white/70">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <span><strong>Make Release Notes Visual & Engaging:</strong> Help creators and teams communicate new features using striking images rather than dense text.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <span><strong>Save Precious Time:</strong> Automatically extract key updates from public GitHub repositories or commit logs without manual writing.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <span><strong>Seamless Social Sharing:</strong> Instantly share high-quality release announcements on LinkedIn, X (Twitter), Facebook, and WhatsApp.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Who Can Use This Tool? */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-base">
              <Users className="w-4 h-4" />
              <h4>Who Can Use This Tool?</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white/70">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-1">
                <h5 className="font-semibold text-white text-sm">👨‍💻 Software Developers</h5>
                <p className="text-xs text-white/60 leading-relaxed">
                  Showcase your newest features, bug fixes, and performance enhancements to colleagues, clients, and followers.
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-1">
                <h5 className="font-semibold text-white text-sm">🌐 Open Source Maintainers</h5>
                <p className="text-xs text-white/60 leading-relaxed">
                  Keep contributors and community members informed whenever you publish a new software version.
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-1">
                <h5 className="font-semibold text-white text-sm">📊 Product Managers & Marketers</h5>
                <p className="text-xs text-white/60 leading-relaxed">
                  Announce new product releases to users in an easy-to-understand visual format without complex jargon.
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-1">
                <h5 className="font-semibold text-white text-sm">🎓 Students & Hobbyists</h5>
                <p className="text-xs text-white/60 leading-relaxed">
                  Highlight personal portfolio projects, hackathon achievements, and side project milestones visually.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Key Highlights */}
          <div className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-base">
              <Zap className="w-4 h-4" />
              <h4>Why You'll Love It</h4>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              UpToDate combines AI intelligence with modern graphic design to make release communications effortless, professional, and accessible to everyone regardless of technical background.
            </p>
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
