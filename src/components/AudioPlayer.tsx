import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const [showDesktopPrompt, setShowDesktopPrompt] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    
    // Show desktop prompt on mobile after 5 seconds
    if (mobile) {
      const timer = setTimeout(() => {
        setShowDesktopPrompt(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Audio will only start on explicit user interaction per browser policy
  // The audio button click will trigger it on both mobile and desktop

  const handleCanPlay = () => {
    if (!audioReady) setAudioReady(true);
  };

  const handleLoadedData = () => {
    if (!audioReady) setAudioReady(true);
  };

  const toggleAudio = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        setAutoplayAttempted(true);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const audioSrc = isMobile
    ? '/audio/Carnival_of_Venice_Chad_Gratts.mobile.mp3'
    : '/audio/Carnival_of_Venice_Chad_Gratts.mp3';

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        onCanPlayThrough={handleCanPlay}
        onLoadedData={handleLoadedData}
        onLoadedMetadata={() => {
          if (isMobile && !audioReady) setAudioReady(true);
        }}
      >
        <source src={audioSrc} type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleAudio}
        disabled={!audioReady}
        className={`fixed z-50 flex items-center gap-2 glass-card border-2 border-accent/40 font-mono text-xs transition-all duration-200 ${
          audioReady
            ? 'text-lightest-slate hover:text-accent hover:border-accent/70 cursor-pointer'
            : 'text-slate/50 cursor-not-allowed'
        } ${!isPlaying && audioReady ? 'animate-pulse' : ''} ${
          isMobile
            ? 'right-0 top-1/2 -translate-y-1/2 px-3 py-6 rounded-l-full border-r-0 writing-mode-vertical'
            : 'bottom-6 right-6 px-4 py-2.5 rounded-full'
        }`}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {!audioReady ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span className={isMobile ? '' : 'hidden sm:inline'}>Loading...</span>
          </>
        ) : isPlaying ? (
          <>
            <VolumeX size={14} />
            <span className={isMobile ? '' : 'hidden sm:inline'}>Shushh me for a bit :/</span>
          </>
        ) : (
          <>
            <Volume2 size={14} />
            <span className={isMobile ? '' : 'hidden sm:inline'}>Hear me play the flute!</span>
          </>
        )}
      </button>

      {/* Desktop prompt for mobile users */}
      {isMobile && showDesktopPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card border-2 border-accent/40 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-accent font-mono text-sm mb-3">Desktop Experience Available!</h3>
            <p className="text-lightest-slate text-xs mb-4">
              For the full interactive color experience with enhanced fluid simulation, 
              check out this website on a desktop browser.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDesktopPrompt(false)}
                className="flex-1 px-3 py-2 glass-card border border-accent/40 rounded-lg text-xs font-mono text-lightest-slate hover:text-accent hover:border-accent/60 transition-colors"
              >
                Got it
              </button>
              <button
                onClick={() => {
                  // Copy URL to clipboard
                  navigator.clipboard.writeText(window.location.href);
                  setShowDesktopPrompt(false);
                }}
                className="flex-1 px-3 py-2 glass-card border border-accent/40 rounded-lg text-xs font-mono text-lightest-slate hover:text-accent hover:border-accent/60 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
