import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader2, Code, AlertTriangle, X, Sparkles, Zap, GitCompare, Upload } from 'lucide-react';
import Poster from './components/Poster';
import LoadingPoster from './components/LoadingPoster';

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);
const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

function App() {
  const [url, setUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    let cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // Parameter Rule: Check URL typo / format
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
      const apiUrl = import.meta.env.PROD ? '/api/analyze' : 'http://localhost:8000/api/analyze';
      const response = await fetch(apiUrl, {
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
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans flex flex-col justify-between transition-all duration-700">
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
      {/* Top-Right GitHub Link Button (Only visible on Home screen before generation) */}
      {!isExpanded && !loading && (
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed top-6 right-6 md:top-8 md:right-8 z-50 flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-full text-white/90 hover:text-white transition-all group shadow-lg backdrop-blur-md"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current group-hover:scale-110 transition-transform duration-300">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="font-semibold tracking-wide text-sm hidden sm:inline-block">GitHub</span>
        </a>
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

      {/* Main Container Area (Transitions between Split Screen Layouts) */}
      <main className="w-full min-h-screen flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className={`w-full max-w-7xl flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 relative z-10 transition-all duration-700 ease-in-out px-4`}>
        
        {/* Phase 1: Hero Section (Visible in Initial State, Left Side) */}
        {!isExpanded && (
          <div className="flex-1 relative z-10 text-left max-w-2xl animate-fade-in order-1 md:order-1">
            <div className="flex items-center justify-start gap-3 mb-6">
              <Code className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white tracking-tight drop-shadow-md">UpToDate</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 backdrop-blur-xl mb-6 shadow-inner">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-white/80 font-medium tracking-wide text-xs uppercase">AI Release Poster Generator</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-2xl">
              Turn Code Commits into <br className="hidden lg:block"/>
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Release Graphics</span>
            </h1>
            <p className="text-lg text-white/60 font-light leading-relaxed max-w-xl">
              Stop writing boring changelogs. Instantly transform your Git commits into stunning, shareable graphics that your users will actually want to read.
            </p>
          </div>
        )}

        {/* Form Card (Right Sidebar initially, Shifts Left in Phase 2) */}
        <div className={`w-full bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(255,255,255,0.05)] flex flex-col shrink-0 transition-all duration-700 ease-in-out ${isExpanded ? 'max-w-md md:mr-4 order-1 md:order-1' : 'max-w-lg order-2 md:order-2'}`}>
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

          <form onSubmit={handleAnalyze} className="space-y-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">GitHub Repository URL</label>
              <input 
                type="text" 
                required
                placeholder="https://github.com/owner/repo"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white shadow-inner text-white placeholder-white/30 transition-all"
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/80">Example Image URL (Optional)</label>
                <label className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Local
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <input 
                type="text" 
                placeholder="Paste image URL or upload..."
                className="w-full bg-black/50 border border-white/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white shadow-inner text-white placeholder-white/30 transition-all"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
              />
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
                <Poster key={posterData?.headline || 'poster'} ref={posterRef} data={{...posterData, heroImageUrl}} />
              )}
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Footer underneath, center aligned */}
      <footer className="w-full max-w-4xl mx-auto relative z-10 pt-8 pb-10 border-t border-white/10 text-center flex flex-col items-center justify-center gap-4 text-white/60 animate-fade-in">
        <div className="flex items-center justify-center gap-2 text-white font-bold text-lg tracking-tight">
          <Code className="w-5 h-5 text-purple-400" />
          <span>UpToDate</span>
        </div>

        <div className="space-y-1 text-sm font-medium">
          <p className="text-white/80">
            Designed and maintained by <span className="text-white font-semibold">Sambit Das</span>
          </p>
          <p className="text-white/50">Netaji Subhash Engineering College</p>
        </div>

        <div className="text-xs text-white/40 tracking-wide">
          All Rights Reserved | &copy; {new Date().getFullYear()}
        </div>

        <div className="flex items-center justify-center gap-6 pt-2">
          <a
            href="https://github.com/sambitdas-prog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white hover:scale-110 transition-all"
            aria-label="GitHub"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/sambit-das-806101382"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white hover:scale-110 transition-all"
            aria-label="LinkedIn"
          >
            <LinkedinIcon className="w-5 h-5" />
          </a>
          <a
            href="https://www.facebook.com/sambitdas244"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white hover:scale-110 transition-all"
            aria-label="Facebook"
          >
            <FacebookIcon className="w-5 h-5" />
          </a>
          <a
            href="https://www.instagram.com/somebitsss"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white hover:scale-110 transition-all"
            aria-label="Instagram"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
