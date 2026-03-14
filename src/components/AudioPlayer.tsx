import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  useEffect(() => {
    if (audioReady && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [audioReady]);

  const handleCanPlay = () => {
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
        preload="metadata"
        playsInline
        onCanPlayThrough={handleCanPlay}
        onLoadedMetadata={() => {
          if (isMobile && !audioReady) setAudioReady(true);
        }}
      >
        <source src={audioSrc} type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleAudio}
        disabled={!audioReady}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full glass-card border-2 border-accent/40 font-mono text-xs transition-all duration-200 ${
          audioReady
            ? 'text-lightest-slate hover:text-accent hover:border-accent/70 hover:scale-105 cursor-pointer'
            : 'text-slate/50 cursor-not-allowed'
        }`}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {!audioReady ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span className="hidden sm:inline">Loading...</span>
          </>
        ) : isPlaying ? (
          <>
            <VolumeX size={14} />
            <span className="hidden sm:inline">Shushh me for a bit :/</span>
          </>
        ) : (
          <>
            <Volume2 size={14} />
            <span className="hidden sm:inline">Hear me play the flute!</span>
          </>
        )}
      </button>
    </>
  );
}
