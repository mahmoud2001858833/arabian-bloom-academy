import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, Subtitles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCloudflareVideoUrl } from '@/hooks/useCloudflareVideoUrl';
import { useLessonSubtitles, getSubtitleLabel } from '@/hooks/useLessonSubtitles';
import { useLanguage } from '@/i18n/LanguageContext';

interface VideoPlayerProps {
  videoKey: string;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  /** When provided, generated subtitles for this lesson are attached to the player. */
  lessonId?: string | null;
}

const VideoPlayer = ({ videoKey, className, autoPlay = false, showControls = true, lessonId }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getVideoUrl } = useCloudflareVideoUrl();
  const { language } = useLanguage();
  const { tracks } = useLessonSubtitles(lessonId);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);

  const videoUrl = getVideoUrl(videoKey);

  // Default the subtitle track to the learner's interface language.
  useEffect(() => {
    if (tracks.length === 0) {
      setActiveSubtitle(null);
      return;
    }
    const preferred = tracks.find((t) => t.language === language) ?? tracks[0];
    setActiveSubtitle(preferred.language);
  }, [tracks, language]);

  // Keep native text tracks in sync with the selected language.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const textTracks = video.textTracks;
    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i];
      track.mode = track.language === activeSubtitle ? 'showing' : 'disabled';
    }
  }, [activeSubtitle, tracks]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setError('فشل تحميل الفيديو');
    };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!videoKey) {
    return (
      <div className={cn("flex items-center justify-center bg-black/50 rounded-xl aspect-video", className)}>
        <p className="text-white/50">لا يوجد فيديو</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center bg-black/50 rounded-xl aspect-video", className)}>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative group rounded-xl overflow-hidden bg-black aspect-video", className)}
      onMouseEnter={() => setShowControlsOverlay(true)}
      onMouseLeave={() => setShowControlsOverlay(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        crossOrigin="anonymous"
      >
        {tracks.map((track) => (
          <track
            key={track.language}
            kind="subtitles"
            src={track.url}
            srcLang={track.language}
            label={getSubtitleLabel(track.language)}
            default={track.language === activeSubtitle}
          />
        ))}
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && showControlsOverlay && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Progress Bar */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 mb-3 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-white" />
                ) : (
                  <Play className="h-5 w-5 text-white" />
                )}
              </button>
              
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
              
              <span className="text-sm text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {tracks.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSubtitleMenu((v) => !v)}
                    className={cn(
                      'p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors',
                      activeSubtitle && 'bg-accent/80 hover:bg-accent',
                    )}
                    title="الترجمة"
                  >
                    <Subtitles className="h-5 w-5 text-white" />
                  </button>
                  {showSubtitleMenu && (
                    <div className="absolute bottom-12 left-0 min-w-[10rem] rounded-xl bg-black/90 p-2 backdrop-blur-md">
                      <button
                        onClick={() => { setActiveSubtitle(null); setShowSubtitleMenu(false); }}
                        className={cn(
                          'block w-full text-right px-3 py-1.5 text-sm rounded-lg text-white/80 hover:bg-white/10',
                          !activeSubtitle && 'text-accent',
                        )}
                      >
                        بدون ترجمة
                      </button>
                      {tracks.map((track) => (
                        <button
                          key={track.language}
                          onClick={() => { setActiveSubtitle(track.language); setShowSubtitleMenu(false); }}
                          className={cn(
                            'block w-full text-right px-3 py-1.5 text-sm rounded-lg text-white/80 hover:bg-white/10',
                            activeSubtitle === track.language && 'text-accent',
                          )}
                        >
                          {getSubtitleLabel(track.language)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Maximize className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play Button Center (when paused) */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="p-5 rounded-full bg-accent/90 hover:bg-accent transition-colors">
            <Play className="h-10 w-10 text-accent-foreground" />
          </div>
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
