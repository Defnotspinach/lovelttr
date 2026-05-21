import { useState } from 'react';
import { Heart, Volume2 } from 'lucide-react';

export default function SplashScreen({ onOpen }) {
  const [entered, setEntered] = useState(false);

  const handleEnter = () => {
    setEntered(true);
    
    // Start playing the song
    const audio = document.getElementById('bg-music');
    if (audio) {
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }

    setTimeout(() => {
      onOpen();
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[#F6F4E8] px-6">
      {!entered ? (
        <>
          {/* Volume notification */}
          <div className="flex items-center gap-2 mb-8 px-4 py-2 bg-white/80 rounded-full shadow-sm border border-[#DC9B9B]/20">
            <Volume2 size={18} className="text-[#8B5E5E]" />
            <span className="text-[#8B5E5E] text-sm">
              For the full experience, turn your volume up
            </span>
          </div>

          <button
            onClick={handleEnter}
            className="flex flex-col items-center justify-center gap-4 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative animate-float">
              <Heart size={80} className="text-[#DC9B9B]" fill="currentColor" />
            </div>
            <p className="text-lg font-light tracking-widest text-[#8B5E5E]">
              Tap to enter
            </p>
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative animate-pulse">
            <Heart size={80} className="text-[#DC9B9B]" fill="currentColor" />
          </div>
          <p className="text-lg font-light tracking-widest text-[#8B5E5E]">
            Loading...
          </p>
        </div>
      )}
    </div>
  );
}
