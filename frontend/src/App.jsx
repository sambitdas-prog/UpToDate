import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader2, Code, AlertTriangle, X, Sparkles, Zap, GitCompare } from 'lucide-react';
import { Download, Loader2, Code, AlertTriangle, X, Sparkles } from 'lucide-react';
import Poster from './components/Poster';
import LoadingPoster from './components/LoadingPoster';

function App() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  const [baseBranch, setBaseBranch] = useState('main');
  const [compareBranch, setCompareBranch] = useState('develop');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [posterData, setPosterData] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isExpanded, setIsExpanded] = useState(false);
  
  const posterRef = useRef(null);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 4500);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    let cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // Parameter Rule: Check URL typo / format
    // Parameter Rule 3: Check URL typo / format
    const githubMatch = cleanUrl.match(/github\.com[:/]([^/]+)\/([^/\s?#]+)/);
    if (!cleanUrl || !githubMatch || !githubMatch[1] || !githubMatch[2]) {
      showToast("The URL of the Repository is not valid. Please enter a valid Repository URL.");
      return;
    }

    // Manual mode validations
    if (mode === 'manual') {
      if (!baseBranch.trim() || !compareBranch.trim()) {
        showToast("Both base and head branches are required for manual mode.");
        return;
      }
      if (baseBranch.trim().toLowerCase() === compareBranch.trim().toLowerCase()) {
        showToast("Compare branch and base branch must be different.");
        return;
      }
    // Parameter Rule 1: Check if base branch and compare branch are identical
    if (baseBranch.trim().toLowerCase() === compareBranch.trim().toLowerCase()) {
      showToast("Compare branch and base branch must be different.");
      return;
    }

    // Trigger Phase 2 transition choreography (Form Shift & Shrink + Poster Reveal)
    if (!isExpanded) {
      setIsExpanded(true);
    }

    setLoading(true);
    setPosterData(null);

    const payload = {
      repo_url: cleanUrl,
      url: cleanUrl,
      base_branch: mode === 'manual' ? baseBranch.trim() : null,
      head_branch: mode === 'manual' ? compareBranch.trim() : null,
      compare_branch: mode === 'manual' ? compareBranch.trim() : null,
    };

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.detail || 'Failed to analyze repository';
        showToast(errorMsg);
        throw new Error(errorMsg);
      }

      const dataStr = await response.json();
      const data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
      
      setPosterData(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (posterRef.current && posterData && !posterData.no_diff) {
      try {
        const dataUrl = await toPng(posterRef.current, { 
          quality: 0.95,
          pixelRatio: 2,
          cacheBust: true,
        });
        const link = document.createElement('a');
        const fileName = posterData?.app_repo ? `${posterData.app_repo}-release-poster.png` : 'release-poster.png';
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to download image', err);
        setError(`Failed to generate image download: ${err?.message || 'Rendering error'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden overflow-x-hidden font-sans flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-700">
      {/* Top-Left Home Button (Only visible in Split View) */}
      {isExpanded && (
        <button
          onClick={() => {
            setIsExpanded(false);
            setPosterData(null);
            setError('');
          }}
          className="fixed top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2.5 text-white/80 hover:text-white transition-all group animate-fade-in"
        >
          <Code className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-bold tracking-tight drop-shadow-md">UpToDate</span>
        </button>
      )}
      {/* Top-Right Toast Notification Pop-up */}
      {toast.visible && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in max-w-md bg-black/90 backdrop-blur-2xl border border-red-500/50 text-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(255,0,0,0.2)] flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-sm font-medium leading-relaxed pr-2">
            {toast.message}
          </div>
          <button 
            onClick={() => setToast({ visible: false, message: '' })} 
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Background Flares / Light Reflections */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[128px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[128px] pointer-events-none animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }}></div>

      {/* Phase 1: Hero Section (Visible in Initial Centered State) */}
      {!isExpanded && (
        <div className="relative z-10 text-center max-w-2xl mb-10 animate-fade-in px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Code className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white tracking-tight drop-shadow-md">UpToDate</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 backdrop-blur-xl mb-6 shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-white/80 font-medium tracking-wide text-xs uppercase">AI Release Poster Generator</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-2xl">
            Turn Code Commits into <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Release Graphics</span>
          </h1>
          <p className="text-lg text-white/60 font-light leading-relaxed">
            Generate beautiful release posters from your GitHub code diffs using AI.
          </p>
        </div>
      )}

      {/* Main Container Area (Transitions between Centered Layout & Split Screen Layout) */}
      <div className={`w-full max-w-7xl flex flex-col ${isExpanded ? 'md:flex-row items-center justify-center' : 'items-center justify-center'} gap-6 md:gap-8 relative z-10 transition-all duration-700 ease-in-out`}>
        
        {/* Form Card (Center in Phase 1, Shifts & Shrinks to Left Sidebar in Phase 2/3) */}
        <div className={`w-full bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(255,255,255,0.05)] flex flex-col shrink-0 transition-all duration-700 ease-in-out ${isExpanded ? 'max-w-md md:mr-4' : 'max-w-lg'}`}>
          {isExpanded && (
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-semibold text-white/80">Configure Analysis</span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-white/60 border border-white/10 uppercase tracking-wider">
                Split View
              </span>
            </div>
          )}

          {/* Mode Switcher Segmented Control */}
          <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10 mb-5 w-full mx-auto">
            <button
              type="button"
              onClick={() => { setMode('auto'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                mode === 'auto'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Auto-Detection
            </button>
            <button
              type="button"
              onClick={() => { setMode('manual'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                mode === 'manual'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              Compare Branches
            </button>
          </div>

        <div className={`w-full bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_rgba(255,255,255,0.05)] flex flex-col shrink-0 transition-all duration-700 ease-in-out ${isExpanded ? 'max-w-md md:mr-4' : 'max-w-xl'}`}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-md">
              <Code className="w-7 h-7 text-white" />
              UpToDate
            </h1>
            {isExpanded && (
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-full text-white/60 border border-white/10">
                Split Mode
              </span>
            )}
          </div>

          {isExpanded && (
            <p className="text-white/60 text-xs mb-6 leading-relaxed">
              Generate beautiful release posters from your GitHub code diffs using AI.
            </p>
          )}

          <form onSubmit={handleAnalyze} className="space-y-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">GitHub Repository URL</label>
              <input 
                type="text" 
                required
                placeholder="https://github.com/owner/repo"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white shadow-inner text-white placeholder-white/30 transition-all"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white shadow-inner text-white placeholder-white/30 transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {mode === 'auto' && (
                <p className="mt-2 text-xs text-white/50 flex items-center gap-1.5">
                  <span>ℹ️</span> We'll automatically analyze recent commits from the default branch.
                </p>
              )}
            </div>

            {mode === 'manual' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Base Branch</label>
                  <input 
                    type="text" 
                    required
                    placeholder="main"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white shadow-inner text-white placeholder-white/30 transition-all"
                    value={baseBranch}
                    onChange={(e) => setBaseBranch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Compare Branch</label>
                  <input 
                    type="text" 
                    required
                    placeholder="develop"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white shadow-inner text-white placeholder-white/30 transition-all"
                    value={compareBranch}
                    onChange={(e) => setCompareBranch(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Base Branch</label>
                <input 
                  type="text" 
                  required
                  placeholder="main"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white shadow-inner text-white placeholder-white/30 transition-all"
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Compare Branch</label>
                <input 
                  type="text" 
                  required
                  placeholder="develop"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white shadow-inner text-white placeholder-white/30 transition-all"
                  value={compareBranch}
                  onChange={(e) => setCompareBranch(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Codebase'}
            </button>

            {error && (
              <div className="p-4 bg-white/5 border border-red-500/50 rounded-xl text-red-400 text-sm backdrop-blur-md">
                {error}
              </div>
            )}
          </form>

          {posterData && !posterData.no_diff && isExpanded && (
            <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in">
              <button 
                onClick={handleDownload}
                disabled={loading}
                className="w-full bg-transparent border border-white hover:bg-white hover:text-black text-white font-semibold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Poster (PNG)
              </button>
            </div>
          )}
        </div>

        {/* Phase 2 & 3: Right Preview Area (Appears with Scale-Up Pop-up animation when isExpanded = true) */}
        {isExpanded && (
          <div className={`flex-1 flex items-center justify-center relative z-10 w-full overflow-x-hidden max-h-screen p-4 md:p-8 animate-popup-scale ${posterData && !posterData.no_diff && !loading ? 'overflow-y-auto' : 'overflow-hidden'}`}>
            <div className="origin-top md:origin-center transform scale-[0.45] sm:scale-[0.55] lg:scale-[0.65] xl:scale-[0.75] 2xl:scale-[0.85] transition-transform my-auto">
              {loading ? (
                <LoadingPoster />
              ) : (
                <Poster key={posterData?.title || 'poster'} ref={posterRef} data={posterData} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
