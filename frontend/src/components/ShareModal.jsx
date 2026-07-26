import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { shareToPlatform, getPlatformIntentUrl, generateShareCaption, openInNewTab } from '../utils/shareUtils';

const WhatsappIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const platformNames = {
  whatsapp: 'WhatsApp',
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
};

export default function ShareModal({
  isOpen,
  onClose,
  shareImageUrl,
  isGenerating,
  posterData,
  repoUrl,
  onToast,
}) {
  const [sharingPlatform, setSharingPlatform] = useState(null);
  const [pendingPlatform, setPendingPlatform] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!pendingPlatform) {
      setCountdown(0);
      return;
    }
    setCountdown(4);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pendingPlatform]);

  if (!isOpen) return null;

  const handleShareClick = (platform) => {
    setPendingPlatform(platform);
  };

  const handleConfirmShare = async (platform, isLinkClick = false) => {
    setSharingPlatform(platform);
    try {
      await shareToPlatform(platform, {
        dataUrl: shareImageUrl,
        posterData,
        repoUrl,
        onToast,
        skipOpen: isLinkClick,
      });
    } catch (err) {
      console.error(`Failed sharing to ${platform}:`, err);
      if (onToast) {
        onToast(`Could not share to ${platform}`);
      }
    } finally {
      setSharingPlatform(null);
      setPendingPlatform(null);
    }
  };

  const handleContinueClick = async (platform) => {
    // 1. First: Copy image to clipboard while current document is 100% focused
    await handleConfirmShare(platform, true);

    // 2. Second: Open new platform tab after clipboard copy completes
    const targetUrl = repoUrl || (posterData?.app_repo ? `https://github.com/${posterData.app_repo}` : 'https://github.com');
    const caption = generateShareCaption(posterData, repoUrl);
    const intentUrl = getPlatformIntentUrl(platform, caption, targetUrl);

    if (intentUrl) {
      openInNewTab(intentUrl);
    }
  };

  const handleCloseModal = () => {
    setPendingPlatform(null);
    setSharingPlatform(null);
    setCountdown(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Important Sharing Notice Popup Overlay */}
        {pendingPlatform && (
          <div className="absolute inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col justify-between animate-fade-in border border-amber-500/30">
            {/* Top Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white tracking-tight">Important Sharing Notice</h4>
                <p className="text-xs text-white/60">Please read before continuing to {platformNames[pendingPlatform]}</p>
              </div>
            </div>

            {/* Notice Body */}
            <div className="flex flex-col gap-3.5 my-auto py-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                <p className="font-semibold text-sm text-white flex items-center gap-2">
                  <span className="text-amber-400">⚠️</span> Why images & text aren't directly attached:
                </p>
                <p className="text-xs text-white/70 leading-relaxed">
                  Due to browser security restrictions and social platform anti-spam policies, web links cannot directly upload local image files or pre-fill custom text from a URL.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2">
                <p className="font-semibold text-sm text-emerald-300 flex items-center gap-2">
                  <span className="text-emerald-400">✨</span> What to do once {platformNames[pendingPlatform]} opens:
                </p>
                <ul className="text-xs text-white/80 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    Your <strong>formatted caption</strong> and <strong>poster image</strong> are automatically copied to your clipboard.
                  </li>
                  <li>
                    Simply click inside the message/post box and press <strong>Ctrl + V</strong> (or <strong>Cmd + V</strong> on Mac) to paste your caption and attach the graphic!
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-white/50">
                {countdown > 0 ? `Please read (${countdown}s remaining)` : 'Ready to proceed'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPendingPlatform(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                {countdown > 0 ? (
                  <button
                    type="button"
                    disabled
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg opacity-50 cursor-not-allowed bg-white text-black"
                  >
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Continue in {countdown}s...</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleContinueClick(pendingPlatform)}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg bg-white text-black hover:bg-white/90 cursor-pointer"
                  >
                    <span>Continue to {platformNames[pendingPlatform]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Share Release Update
            </h3>
            <p className="text-xs md:text-sm text-white/60 mt-0.5">
              Share your AI-generated release graphic alongside a rich caption.
            </p>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Container */}
        <div className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px] max-h-[380px] overflow-hidden relative group">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 text-white/70 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span className="text-sm font-medium">Preparing graphic for sharing...</span>
            </div>
          ) : shareImageUrl ? (
            <img
              src={shareImageUrl}
              alt="Release Poster Preview"
              className="max-h-[340px] w-auto object-contain rounded-lg shadow-lg border border-white/10"
            />
          ) : (
            <div className="py-12 text-white/40 text-sm">
              No preview available
            </div>
          )}
        </div>

        {/* Bottom Section: Social Platform Action Buttons */}
        <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Select platform to share
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* WhatsApp */}
            <button
              onClick={() => handleShareClick('whatsapp')}
              disabled={isGenerating || sharingPlatform === 'whatsapp'}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-[#25D366]/30 bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {sharingPlatform === 'whatsapp' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <WhatsappIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              )}
              <span>WhatsApp</span>
            </button>

            {/* X (Twitter) */}
            <button
              onClick={() => handleShareClick('twitter')}
              disabled={isGenerating || sharingPlatform === 'twitter'}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white text-white hover:text-black font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {sharingPlatform === 'twitter' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              )}
              <span>X (Twitter)</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleShareClick('linkedin')}
              disabled={isGenerating || sharingPlatform === 'linkedin'}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/15 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {sharingPlatform === 'linkedin' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LinkedinIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              )}
              <span>LinkedIn</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleShareClick('facebook')}
              disabled={isGenerating || sharingPlatform === 'facebook'}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {sharingPlatform === 'facebook' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FacebookIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              )}
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
