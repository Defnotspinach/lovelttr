import { useState, useEffect, useRef } from 'react';
import { Pause, Play, Volume2 } from 'lucide-react';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [show, setShow] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setShow(true), 500);
  }, []);

  useEffect(() => {
    const audio = document.getElementById('bg-music');
    audioRef.current = audio;

    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    if (!audio.paused) setIsPlaying(true);
    if (audio.duration) setDuration(audio.duration);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-[#DC9B9B]/15 transition-transform duration-700 ease-out ${
        show ? 'translate-y-0' : 'translate-y-[120px]'
      }`}
      style={{ width: '280px' }}
    >
      {/* Song title */}
      <p className="text-[11px] font-medium text-[#8B5E5E] mb-2 truncate">
        Green Day - Last Night On Earth
      </p>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0"
        >
          {isPlaying ? (
            <Pause size={18} className="text-[#8B5E5E]" fill="#8B5E5E" />
          ) : (
            <Play size={18} className="text-[#8B5E5E]" fill="#8B5E5E" />
          )}
        </button>

        {/* Time */}
        <span className="text-[11px] text-[#8B5E5E] font-mono flex-shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="flex-1 h-1.5 bg-[#E5EEE4] rounded-full cursor-pointer relative"
        >
          <div
            className="absolute top-0 left-0 h-full bg-[#8B5E5E] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Volume icon */}
        <Volume2 size={16} className="text-[#8B5E5E] flex-shrink-0 opacity-60" />
      </div>
    </div>
  );
}
