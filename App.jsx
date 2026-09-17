import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Play, Sparkles, Music, Video, Image as ImageIcon, 
  Youtube, Instagram, Check, Copy, RefreshCw, Zap, Layers, 
  Film, FileAudio, FileImage, ShieldCheck, History, Terminal, 
  ExternalLink, Volume2, Globe, Search, Trash2, CheckCircle2, 
  AlertCircle, ArrowRight, Share2, Sliders, Moon, Sun, Info, Link as LinkIcon
} from 'lucide-react';

const PLATFORM_CONFIG = {
  youtube: {
    name: 'YouTube',
    color: 'from-red-600 to-rose-500',
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: Youtube,
    domains: ['youtube.com', 'youtu.be']
  },
  tiktok: {
    name: 'TikTok',
    color: 'from-cyan-400 via-teal-500 to-pink-500',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    icon: Video,
    domains: ['tiktok.com', 'vm.tiktok.com']
  },
  instagram: {
    name: 'Instagram',
    color: 'from-purple-600 via-pink-600 to-amber-500',
    badge: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    icon: Instagram,
    domains: ['instagram.com', 'instagr.am']
  },
  twitter: {
    name: 'X / Twitter',
    color: 'from-slate-700 to-slate-900',
    badge: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    icon: Globe,
    domains: ['twitter.com', 'x.com']
  },
  generic: {
    name: 'Universal Media',
    color: 'from-indigo-600 to-purple-600',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: LinkIcon,
    domains: []
  }
};

// Sample links to allow instant testing
const SAMPLE_LINKS = [
  {
    title: 'TikTok Viral Dance (No Watermark)',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@creator/video/729104812391',
    mockData: {
      title: 'Neon Beats Cyberpunk Dance Choreography 2026',
      author: '@cyber_vibes',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      duration: '00:45',
      views: '2.4M',
      likes: '412K',
      thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
      type: 'video',
      formats: [
        { label: 'Video HD (No Watermark)', quality: '1080p Ultra', ext: 'MP4', size: '24.8 MB', type: 'video', watermark: false },
        { label: 'Video SD (Original)', quality: '720p', ext: 'MP4', size: '12.4 MB', type: 'video', watermark: true },
        { label: 'Audio Only (Soundtrack)', quality: '320 kbps', ext: 'MP3', size: '3.2 MB', type: 'audio' }
      ]
    }
  },
  {
    title: 'YouTube 4K Lo-Fi Chill Mix',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    mockData: {
      title: 'Midnight Coding & Study Chill Beats - 24/7 Lo-Fi Station',
      author: 'Cyber Beats Official',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      duration: '03:45:20',
      views: '18.9M',
      likes: '1.2M',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      type: 'video',
      formats: [
        { label: '4K Ultra HD', quality: '2160p (60fps)', ext: 'MP4', size: '420.5 MB', type: 'video' },
        { label: 'Full HD', quality: '1080p (60fps)', ext: 'MP4', size: '145.2 MB', type: 'video' },
        { label: 'HD Ready', quality: '720p', ext: 'MP4', size: '68.1 MB', type: 'video' },
        { label: 'Audio High Quality', quality: '320 kbps HQ', ext: 'MP3', size: '9.8 MB', type: 'audio' },
        { label: 'Audio Medium', quality: '192 kbps', ext: 'M4A', size: '5.4 MB', type: 'audio' }
      ]
    }
  },
  {
    title: 'Instagram Aesthetics Carousel',
    platform: 'instagram',
    url: 'https://www.instagram.com/p/Cz1894xLq9/',
    mockData: {
      title: 'Tokyo Cyberpunk Aesthetic Photo Collection Vol. 9',
      author: '@tokyo_afterhours',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      duration: 'Carousel (4 Photos)',
      views: '94K',
      likes: '28.5K',
      thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
      type: 'carousel',
      gallery: [
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800&auto=format&fit=crop&q=80'
      ],
      formats: [
        { label: 'Download All Photos (.ZIP)', quality: 'Original 4K', ext: 'ZIP', size: '18.4 MB', type: 'image_batch' },
        { label: 'Extract Audio Track', quality: '320 kbps', ext: 'MP3', size: '2.8 MB', type: 'audio' }
      ]
    }
  }
];

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState('generic');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaResult, setMediaResult] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('single'); // 'single', 'batch', 'audio', 'history'
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState([]);
  const [toast, setToast] = useState(null);
  const [audioCutRange, setAudioCutRange] = useState([0, 100]);
  const [activeFormatFilter, setActiveFormatFilter] = useState('all'); // 'all', 'video', 'audio', 'image'

  const terminalEndRef = useRef(null);

  // Helper for adding terminal logs
  const addLog = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, msg, type }]);
  };

  useEffect(() => {
    if (showLogs && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showLogs]);

  // Toast auto-dismiss
  const showToastNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!urlInput.trim()) {
      setDetectedPlatform('generic');
      return;
    }
    const lower = urlInput.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      setDetectedPlatform('youtube');
    } else if (lower.includes('tiktok.com')) {
      setDetectedPlatform('tiktok');
    } else if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
      setDetectedPlatform('instagram');
    } else if (lower.includes('twitter.com') || lower.includes('x.com')) {
      setDetectedPlatform('twitter');
    } else {
      setDetectedPlatform('generic');
    }
  }, [urlInput]);

  const handleExtractMedia = async (overrideUrl = null) => {
  const targetUrl = overrideUrl || urlInput;
  if (!targetUrl.trim()) return;

  setIsLoading(true);
  setMediaResult(null);

  try {
    // Memanggil mesin download Cobalt
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        videoQuality: '1080',
      }),
    });

    const data = await response.json();

    if (data.url || data.picker) {
      const downloadLink = data.url || (data.picker && data.picker[0]?.url);
      
      setMediaResult({
        title: `Media Terdeteksi dari Link`,
        author: 'Verified Creator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        duration: 'Original',
        views: 'Live',
        likes: 'N/A',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        type: 'video',
        formats: [
          {
            label: 'Download Direct File (HD / Original)',
            quality: 'Best Quality',
            ext: 'MP4 / MP3',
            size: 'Direct Stream',
            type: 'video',
            downloadUrl: downloadLink
          }
        ]
      });
    } else {
      alert('Gagal mengambil media. Pastikan link publik.');
    }
  } catch (error) {
    console.error(error);
    alert('Terjadi kesalahan koneksi ke server download.');
  } finally {
    setIsLoading(false);
  }
};


    // Check if sample link matches
    const matchedSample = SAMPLE_LINKS.find((s) => targetUrl.toLowerCase().includes(s.platform));

    setTimeout(() => {
      addLog(`[HEADER] Bypassing cloudflare bot protection...`, 'warn');
    }, 400);

    setTimeout(() => {
      addLog(`[METADATA] Extracted media stream info successfully!`, 'success');
    }, 900);

    setTimeout(() => {
      setIsLoading(false);
      if (matchedSample) {
        setMediaResult(matchedSample.mockData);
      } else {
        // Fallback generated mock data for custom links
        setMediaResult({
          title: `Extracted Media from ${targetUrl.slice(0, 30)}...`,
          author: '@web_creator',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          duration: '02:15',
          views: '154K',
          likes: '12.8K',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          type: 'video',
          formats: [
            { label: 'Video HD (1080p)', quality: '1080p', ext: 'MP4', size: '45.2 MB', type: 'video' },
            { label: 'Video SD (720p)', quality: '720p', ext: 'MP4', size: '22.1 MB', type: 'video' },
            { label: 'High Audio (MP3)', quality: '320 kbps', ext: 'MP3', size: '5.6 MB', type: 'audio' },
            { label: 'Cover Thumbnail Image', quality: 'Original HD', ext: 'JPG', size: '1.2 MB', type: 'image' }
          ]
        });
      }
      showToastNotification('Media links generated! Choose your preferred format.');
    }, 1400);
  };

  const startDownload = (format) => {
    setDownloadProgress({
      title: mediaResult?.title || 'Downloading File',
      format: format.label,
      ext: format.ext,
      percent: 0,
      speed: '0.0 MB/s',
      downloaded: '0 MB',
      total: format.size
    });

    addLog(`[DOWNLOAD_START] Requesting format ${format.ext} - ${format.quality}...`);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 8;
      const currentMb = ((parseFloat(format.size) * progress) / 100).toFixed(1);
      const randomSpeed = (Math.random() * 4 + 8).toFixed(1);

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setTimeout(() => {
          // Trigger actual synthetic file download
          const blob = new Blob([`Dummy media content generated by OmniStream for ${mediaResult?.title}`], { type: 'text/plain' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${(mediaResult?.title || 'download').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format.ext.toLowerCase()}`;
          link.click();

          // Add to history
          const newItem = {
            id: Date.now(),
            title: mediaResult?.title || 'Media File',
            platform: detectedPlatform,
            format: format.ext,
            quality: format.quality,
            date: new Date().toLocaleDateString(),
            thumbnail: mediaResult?.thumbnail
          };
          setHistory((prev) => [newItem, ...prev]);

          setDownloadProgress(null);
          showToastNotification(`Downloaded successfully as .${format.ext.toLowerCase()}!`);
          addLog(`[COMPLETED] File saved to storage.`, 'success');
        }, 600);
      } else {
        setDownloadProgress((prev) => prev ? {
          ...prev,
          percent: progress,
          speed: `${randomSpeed} MB/s`,
          downloaded: `${currentMb} MB`
        } : null);
      }
    }, 250);
  };

  const pasteSample = (sample) => {
    setUrlInput(sample.url);
    handleExtractMedia(sample.url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl animate-bounce text-sm font-medium">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                OmniStream
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                v2.6 Vibe Edition
              </span>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            {[
              { id: 'single', label: 'Single Link', icon: Zap },
              { id: 'batch', label: 'Batch Grabber', icon: Layers },
              { id: 'audio', label: 'Audio Studio', icon: Music },
              { id: 'history', label: 'History', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'history' && history.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-purple-500 text-[10px] text-white flex items-center justify-center font-bold">
                      {history.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showLogs
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Dev Logs</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Mobile Navigation Pills */}
        <div className="flex md:hidden overflow-x-auto gap-2 mb-6 pb-2 scrollbar-none">
          {[
            { id: 'single', label: 'Single Downloader', icon: Zap },
            { id: 'batch', label: 'Batch Mode', icon: Layers },
            { id: 'audio', label: 'Audio Studio', icon: Music },
            { id: 'history', label: 'History', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {}
        {activeTab === 'single' && (
          <div className="space-y-8">
            {/* Hero Input Box Section */}
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl overflow-hidden">
              {/* Background Glow Highlights */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Download Videos, Songs & Images <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                    In Highest Quality, Anywhere
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Paste links from YouTube, TikTok (No Watermark), Instagram Reels, Twitter/X, and Soundcloud.
                </p>
              </div>

              {/* Main URL Input Form */}
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                  <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-2xl">
                    <div className="pl-3 pr-2 text-slate-400">
                      {React.createElement(PLATFORM_CONFIG[detectedPlatform].icon, {
                        className: 'w-6 h-6 text-purple-400'
                      })}
                    </div>

                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleExtractMedia()}
                      placeholder="Paste YouTube, TikTok, or Instagram link here..."
                      className="w-full bg-transparent px-3 py-3 text-slate-100 placeholder-slate-500 focus:outline-none text-sm sm:text-base"
                    />

                    {urlInput && (
                      <button
                        onClick={() => setUrlInput('')}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleExtractMedia()}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/25 shrink-0 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Parsing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Fetch Media</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Supported Platform Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="text-xs text-slate-500 mr-2">Supported:</span>
                  {Object.entries(PLATFORM_CONFIG).filter(([k]) => k !== 'generic').map(([key, item]) => {
                    const Icon = item.icon;
                    return (
                      <span key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium ${item.badge}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {item.name}
                      </span>
                    );
                  })}
                </div>

                {/* Quick Preset Buttons for Instant Testing */}
                <div className="pt-4 border-t border-slate-800/80">
                  <p className="text-center text-xs text-slate-400 mb-3 font-medium flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Vibe Test (Click to test downloader):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SAMPLE_LINKS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => pasteSample(sample)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-left transition text-xs text-slate-300 hover:text-white group"
                      >
                        <Play className="w-3 h-3 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="truncate">{sample.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {}
            {mediaResult && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail / Gallery Display */}
                  <div className="md:w-1/3 shrink-0">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 group aspect-video md:aspect-square bg-slate-950">
                      <img
                        src={mediaResult.thumbnail}
                        alt="Media Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-200 text-xs font-semibold border border-slate-700">
                          {mediaResult.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Information */}
                  <div className="md:w-2/3 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${PLATFORM_CONFIG[detectedPlatform].badge}`}>
                          {PLATFORM_CONFIG[detectedPlatform].name}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Direct Link Verified
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-2 leading-snug">
                        {mediaResult.title}
                      </h2>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <img src={mediaResult.avatar} className="w-6 h-6 rounded-full" alt="avatar" />
                          <span className="font-semibold text-slate-200">{mediaResult.author}</span>
                        </div>
                        <span>•</span>
                        <span>{mediaResult.views} views</span>
                        <span>•</span>
                        <span>{mediaResult.likes} likes</span>
                      </div>
                    </div>

                    {/* Image Gallery Grid if Carousel */}
                    {mediaResult.gallery && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400">Extracted Carousel Images ({mediaResult.gallery.length}):</p>
                        <div className="grid grid-cols-4 gap-2">
                          {mediaResult.gallery.map((img, i) => (
                            <img key={i} src={img} className="rounded-lg h-16 w-full object-cover border border-slate-800 hover:border-purple-500 transition cursor-pointer" alt="gallery item" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Format Filter Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <span className="text-xs font-semibold text-slate-400 mr-2">Filter Format:</span>
                      {[
                        { id: 'all', label: 'All Formats' },
                        { id: 'video', label: 'Video (MP4)' },
                        { id: 'audio', label: 'Audio (MP3)' }
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setActiveFormatFilter(filter.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                            activeFormatFilter === filter.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Available Download Formats List */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Download className="w-4 h-4 text-purple-400" />
                    Available Download Options:
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mediaResult.formats
                      .filter((f) => activeFormatFilter === 'all' || f.type.includes(activeFormatFilter))
                      .map((fmt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl transition group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`p-2.5 rounded-xl ${
                              fmt.type.includes('audio')
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : fmt.type.includes('image')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                              {fmt.type.includes('audio') ? (
                                <FileAudio className="w-5 h-5" />
                              ) : fmt.type.includes('image') ? (
                                <FileImage className="w-5 h-5" />
                              ) : (
                                <Film className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-100">{fmt.label}</span>
                                {fmt.watermark === false && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-1.5 py-0.5 rounded">
                                    No WM
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{fmt.quality} • {fmt.ext} • {fmt.size}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => startDownload(fmt)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 group-hover:bg-purple-600 text-slate-200 group-hover:text-white rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'batch' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-purple-400" /> Multi-Link Batch Extractor
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Enter multiple links (one per line) to process and download all media at once.
              </p>
            </div>

            <textarea
              rows={6}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Paste URLs here, one per line:&#10;https://www.tiktok.com/@user/video/12345&#10;https://www.youtube.com/watch?v=abcde&#10;https://www.instagram.com/p/xyz123"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />

            <div className="flex justify-end">
              <button
                onClick={() => {
                  const urls = batchInput.split('\n').filter((u) => u.trim());
                  if (urls.length === 0) {
                    showToastNotification('Please enter at least one URL', 'error');
                    return;
                  }
                  showToastNotification(`Processing ${urls.length} links in batch queue!`);
                  setBatchResults(urls.map((u, i) => ({
                    url: u,
                    status: 'Ready',
                    title: `Extracted Batch Item #${i + 1}`,
                    size: '15.4 MB'
                  })));
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition"
              >
                <Zap className="w-4 h-4" /> Start Batch Processing
              </button>
            </div>

            {batchResults.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-300">Batch Queue ({batchResults.length} items):</h3>
                <div className="space-y-2">
                  {batchResults.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="truncate text-slate-300">{item.url}</span>
                      </div>
                      <button
                        onClick={() => showToastNotification(`Downloading ${item.title}...`)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white rounded-lg font-semibold shrink-0"
                      >
                        Download Zip
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'audio' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Music className="w-6 h-6 text-amber-400" /> Audio Extractor & Cutter Studio
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Convert video links into high-bitrate MP3/WAV audio tracks and trim start/end times.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-300">1. Select Audio Bitrate Quality:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['320 kbps (HQ)', '192 kbps (Std)', '128 kbps (Fast)'].map((bitrate, i) => (
                    <button
                      key={i}
                      className={`p-3 rounded-xl border text-xs font-bold ${
                        i === 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {bitrate}
                    </button>
                  ))}
                </div>

                <label className="text-xs font-bold text-slate-300 block pt-2">2. Format Output:</label>
                <div className="flex gap-2">
                  {['MP3', 'WAV', 'M4A', 'FLAC'].map((ext, i) => (
                    <button
                      key={i}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                        i === 0 ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      .{ext}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" /> Audio Trim Range (Simulation)
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Start: 00:00</span>
                    <span>End: 03:45</span>
                  </div>
                  <input type="range" className="w-full accent-purple-500" />
                </div>
                <button
                  onClick={() => showToastNotification('Audio conversion started!')}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold rounded-xl text-xs"
                >
                  Convert & Extract Audio Only
                </button>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'history' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-indigo-400" /> Download History
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Recently downloaded media saved in local session.
                </p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    showToastNotification('History cleared!');
                  }}
                  className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <History className="w-12 h-12 mx-auto opacity-30" />
                <p className="text-sm">No download history yet. Fetch media to build your list!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-4">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} className="w-12 h-12 rounded-xl object-cover" alt="thumb" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                          {item.format}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
                        <p className="text-xs text-slate-400">{item.format} • {item.quality} • {item.date}</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-semibold px-3 py-1 rounded-full">
                      Saved
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {}
        {downloadProgress && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Download className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Downloading File</h3>
                    <p className="text-xs text-slate-400">{downloadProgress.format}</p>
                  </div>
                </div>
                <span className="text-xl font-black text-purple-400">{downloadProgress.percent}%</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>{downloadProgress.downloaded} / {downloadProgress.total}</span>
                  <span>{downloadProgress.speed}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center">
                Please wait while the server stitches high-definition streams...
              </div>
            </div>
          </div>
        )}

        {}
        {showLogs && (
          <div className="mt-8 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> OmniStream Engine Console
              </span>
              <button onClick={() => setLogs([])} className="hover:text-white">Clear Logs</button>
            </div>
            <div className="h-40 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin">
              {logs.length === 0 && (
                <p className="text-slate-600 italic">No logs generated yet. Perform an action to see backend responses...</p>
              )}
              {logs.map((log, i) => (
                <div key={i} className={`flex items-start gap-2 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warn' ? 'text-amber-400' :
                  log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                  <span className="text-slate-600">[{log.timestamp}]</span>
                  <span>{log.msg}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-900 py-8 text-center text-xs text-slate-500 space-y-2">
        <p>OmniStream — Vibe Coding All-In-One Media Extractor Engine</p>
        <p className="text-slate-600">Supports YouTube MP4/MP3, TikTok No-Watermark, Instagram Reels & Carousel, Twitter HD media.</p>
      </footer>
    </div>
  );
}
