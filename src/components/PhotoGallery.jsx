import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

// Add your photos here — drop them in public/photos/ and add to the rows
const ROW_1 = [
  '/photos/1.jpg',
  '/photos/2.jpg',
  '/photos/3.jpg',
  '/photos/4.jpg',
  '/photos/5.jpg',
  '/photos/6.jpg',
];

const ROW_2 = [
  '/photos/7.jpg',
  '/photos/8.jpg',
  '/photos/9.jpg',
  '/photos/10.jpg',
  '/photos/11.jpg',
  '/photos/1.jpg',
];

const ROW_3 = [
  '/photos/7.jpg',
  '/photos/1.jpg',
  '/photos/11.jpg',
  '/photos/5.jpg',
  '/photos/9.jpg',
  '/photos/6.jpg',
];

const ALL_PHOTOS = [...ROW_1, ...ROW_2, ...ROW_3];

const LETTER_TEXT = `To my baby,

I'm writing this letter to remind you how much I love you.

If you are reading this, ive made this to show how far we got into our relationship how deep we are in the relationship, i will alway love you and will always want to be with you, im sorry if ever i did hurt your feeling, if nag iba un mood mo sakin and if may ginawa ako na ayaw mo, mind you i will never cheat on you, d ako gagaya sa mga yan sa mundong maraming cheater ako to loyal sayo hahahaha i love you baby and take care of yourself palagi haaa i may not be there but i will always love you, and both our sides are finally complete. I built this little space just for us to remind you of how much you mean to me. No matter the distance, we always find a way to fit together perfectly.

I love you so much.

- Your fav person`;

function ScrollingRow({ photos, direction = 'left', duration = 25 }) {
  const allPhotos = [...photos, ...photos];

  return (
    <div className="overflow-hidden w-full h-full">
      <motion.div
        className="flex h-full"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: duration,
            ease: 'linear',
          },
        }}
      >
        {allPhotos.map((photo, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-full"
            style={{ width: '33.333vw' }}
          >
            <img
              src={photo}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function TypingLetter() {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const letterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (letterRef.current) {
      observer.observe(letterRef.current);
    }

    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let index = 0;
    const interval = setInterval(() => {
      if (index < LETTER_TEXT.length) {
        setDisplayedText(LETTER_TEXT.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [started]);

  return (
    <div ref={letterRef} className="w-full h-full">
      <div className="bg-[#D4A574] rounded-lg p-4 shadow-2xl h-full">
        <div
          className="bg-[#FEFEFA] rounded p-8 relative overflow-y-auto h-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #B5D4E8 31px, #B5D4E8 32px)',
            backgroundPosition: '0 40px',
          }}
        >
          <div className="absolute top-0 bottom-0 left-12 w-[1px] bg-[#E88B8B]/50" />
          <div className="relative pl-6 pt-2">
            <pre className="font-['Patrick_Hand'] text-[#2C2C2C] text-xl leading-[32px] whitespace-pre-wrap">
              {displayedText}
              {started && displayedText.length < LETTER_TEXT.length && (
                <span className="inline-block w-[2px] h-5 bg-[#2C2C2C] animate-pulse ml-[1px]" />
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoStrip({ onDownload }) {
  const [stripPhotos, setStripPhotos] = useState([null, null, null, null]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickingSlot, setPickingSlot] = useState(null);
  const stripRef = useRef(null);

  const handleSlotClick = (index) => {
    setPickingSlot(index);
    setShowPicker(true);
  };

  const handlePhotoPick = (photo) => {
    setStripPhotos(prev => {
      const updated = [...prev];
      updated[pickingSlot] = photo;
      return updated;
    });
    setShowPicker(false);
    setPickingSlot(null);
  };

  const handleDownload = async () => {
    if (stripRef.current) {
      try {
        const canvas = await html2canvas(stripRef.current, {
          backgroundColor: null,
          scale: 3,
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = 'our-photostrip.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error('Download failed:', err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Strip */}
      <div
        ref={stripRef}
        className="bg-white rounded-xl shadow-xl p-3 w-full max-w-[240px]"
      >
        <div className="flex flex-col gap-2">
          {stripPhotos.map((photo, index) => (
            <div
              key={index}
              onClick={() => handleSlotClick(index)}
              className="w-full aspect-[4/3] rounded overflow-hidden cursor-pointer border-2 border-dashed border-[#DC9B9B]/30 hover:border-[#DC9B9B] transition-colors"
            >
              {photo ? (
                <img src={photo} alt={`Strip ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F6F4E8]">
                  <span className="text-[#8B5E5E]/50 text-xs">Tap to pick</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-[#333]">For My Baby</p>
          <p className="text-[10px] text-[#666]">2026</p>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#DC9B9B] hover:bg-[#DC9B9B]/80 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
      >
        <Download size={16} />
        Download Strip
      </button>

      {/* Photo Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <p className="text-[#8B5E5E] text-sm font-medium mb-3 text-center">Pick a photo</p>
            <div className="grid grid-cols-3 gap-2">
              {ALL_PHOTOS.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => handlePhotoPick(photo)}
                  className="aspect-square rounded-lg overflow-hidden hover:ring-2 ring-[#DC9B9B] transition-all hover:scale-105"
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowPicker(false); setPickingSlot(null); }}
              className="mt-4 w-full py-2 text-[#8B5E5E] text-sm font-medium hover:bg-[#F6F4E8] rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PhotoGallery() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let currentSection = 0; // 0 = photos, 1 = letter

    const handleWheel = (e) => {
      e.preventDefault();
      if (isScrolling) return;

      if (e.deltaY > 0 && currentSection === 0) {
        // Scroll down → go to letter section
        isScrolling = true;
        currentSection = 1;
        container.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; }, 800);
      } else if (e.deltaY < 0 && currentSection === 1) {
        // Scroll up → go to photos section
        isScrolling = true;
        currentSection = 0;
        container.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; }, 800);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isScrolling) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (diff > 50 && currentSection === 0) {
        // Swipe up → go to letter
        isScrolling = true;
        currentSection = 1;
        container.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; }, 800);
      } else if (diff < -50 && currentSection === 1) {
        // Swipe down → go to photos
        isScrolling = true;
        currentSection = 0;
        container.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; }, 800);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-hidden"
    >
      <div className="w-full" style={{ height: '200vh' }}>
        {/* First screen: Photo Grid */}
        <div className="w-full h-screen flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ScrollingRow photos={ROW_1} direction="left" duration={20} />
          </div>
          <div className="flex-1 overflow-hidden">
            <ScrollingRow photos={ROW_2} direction="right" duration={25} />
          </div>
          <div className="flex-1 overflow-hidden">
            <ScrollingRow photos={ROW_3} direction="left" duration={22} />
          </div>
        </div>

        {/* Second screen: Photo Strip (left) + Love Letter (right) */}
        <div className="w-full h-screen flex items-stretch bg-[#F6F4E8] p-6 gap-6">
          {/* Left: Photo Strip */}
          <div className="w-[35%] flex items-center justify-center">
            <PhotoStrip />
          </div>

          {/* Right: Love Letter */}
          <div className="w-[65%] flex items-center justify-center">
            <TypingLetter />
          </div>
        </div>
      </div>
    </div>
  );
}
