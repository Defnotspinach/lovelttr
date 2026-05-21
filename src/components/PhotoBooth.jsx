import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Download, Send, Heart } from 'lucide-react';
import html2canvas from 'html2canvas';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import LoveLetter from './LoveLetter';

// Sticker images
const STICKERS = [
  { id: 'heart', src: '/stickers/heart.svg', label: 'Heart' },
  { id: 'pink-star', src: '/stickers/pink-star.svg', label: 'Pink Star' },
  { id: 'sparkles', src: '/stickers/sparkles.svg', label: 'Sparkles' },
  { id: 'pink-bow', src: '/stickers/pink-bow.svg', label: 'Pink Bow' },
  { id: 'butterfly', src: '/stickers/butterfly.svg', label: 'Butterfly' },
  { id: 'cherry-blossom', src: '/stickers/cherry-blossom.svg', label: 'Blossom' },
  { id: 'cloud-heart', src: '/stickers/cloud-heart.svg', label: 'Cloud Heart' },
  { id: 'pixel-heart', src: '/stickers/pixel-heart.svg', label: 'Pixel Heart' },
  { id: 'rainbow', src: '/stickers/rainbow.svg', label: 'Rainbow' },
  { id: 'red-heart', src: '/stickers/red-heart.svg', label: 'Red Heart' },
  { id: 'hearts-pink', src: '/stickers/hearts-pink.svg', label: 'Pink Hearts' },
  { id: 'stars-blue', src: '/stickers/stars-blue.svg', label: 'Blue Stars' },
];

// Frame colors
const FRAME_COLORS = [
  '#FFFFFF', '#000000', '#FFC0CB', '#FFB6C1', '#ADD8E6',
  '#DDA0DD', '#FFFACD', '#FFDAB9', '#006400', '#808080',
  '#1a1a1a', '#000080', '#4A0000', '#F8C8DC', '#2F1A1A',
  '#DC9B9B', '#F6F4E8', '#E5EEE4', '#C0E1D2',
];

export default function PhotoBooth() {
  const [photos, setPhotos] = useState([null, null, null, null]);
  const [currentShot, setCurrentShot] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [frameColor, setFrameColor] = useState('#FFFFFF');
  const [showPanel, setShowPanel] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [stream, setStream] = useState(null);
  const [user1Photos, setUser1Photos] = useState(null);
  const [user2Photos, setUser2Photos] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [mode, setMode] = useState(null); // 'user1' | 'user2'
  const [showLetter, setShowLetter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stripRef = useRef(null);
  const revealRef = useRef(null);

  // Load session from Firestore on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const docRef = doc(db, 'photobooth', 'session');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.user1Done) {
            const u1 = [data.user1Photo0, data.user1Photo1, data.user1Photo2, data.user1Photo3];
            setUser1Photos(u1);
            if (data.user2Done) {
              const u2 = [data.user2Photo0, data.user2Photo1, data.user2Photo2, data.user2Photo3];
              setUser2Photos(u2);
              setIsRevealed(true);
              setShowLetter(true);
            } else {
              setMode('user2');
            }
          } else {
            setMode('user1');
          }
        } else {
          setMode('user1');
        }
      } catch (err) {
        console.error('Error loading session:', err);
        setMode('user1');
      }
      setLoading(false);
    };

    loadSession();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    const docRef = doc(db, 'photobooth', 'session');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.user1Done) {
          setUser1Photos([data.user1Photo0, data.user1Photo1, data.user1Photo2, data.user1Photo3]);
        }
        if (data.user2Done) {
          setUser2Photos([data.user2Photo0, data.user2Photo1, data.user2Photo2, data.user2Photo3]);
          setIsRevealed(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError(true);
    }
  }, []);

  // Bind stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraActive]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (countdown !== null) return;
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          
          setPhotos(prev => {
            const updated = [...prev];
            updated[currentShot] = dataUrl;
            return updated;
          });

          if (currentShot < 3) {
            setCurrentShot(prev => prev + 1);
          } else {
            setIsComplete(true);
            stopCamera();
          }
        }
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [currentShot, stopCamera, countdown]);

  const retake = useCallback(() => {
    setPhotos([null, null, null, null]);
    setCurrentShot(0);
    setIsComplete(false);
    setStickers([]);
    startCamera();
  }, [startCamera]);

  const downloadStrip = useCallback(async () => {
    if (stripRef.current) {
      try {
        const canvas = await html2canvas(stripRef.current, {
          backgroundColor: null,
          scale: 3,
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = 'our-photobooth.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error('Download failed:', err);
      }
    }
  }, []);

  const downloadReveal = useCallback(async () => {
    if (revealRef.current) {
      try {
        const canvas = await html2canvas(revealRef.current, {
          backgroundColor: '#F6F4E8',
          scale: 3,
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = 'our-photos-together.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error('Download failed:', err);
      }
    }
  }, []);

  // Save photos directly to Firestore as base64
  const handleSubmit = async () => {
    setUploading(true);
    try {
      const docRef = doc(db, 'photobooth', 'session');
      
      if (mode === 'user1') {
        // Save each photo as a separate field to stay under doc size limit
        await setDoc(docRef, {
          user1Photo0: photos[0],
          user1Photo1: photos[1],
          user1Photo2: photos[2],
          user1Photo3: photos[3],
          user1Done: true,
        }, { merge: true });
        setUser1Photos(photos);
        setIsComplete(false);
        setPhotos([null, null, null, null]);
        setCurrentShot(0);
        setStickers([]);
        setMode('user2');
      } else {
        await setDoc(docRef, {
          user2Photo0: photos[0],
          user2Photo1: photos[1],
          user2Photo2: photos[2],
          user2Photo3: photos[3],
          user2Done: true,
        }, { merge: true });
        setUser2Photos(photos);
        setIsRevealed(true);
        setTimeout(() => setShowLetter(true), 1500);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  const handleStripClick = (e) => {
    if (!selectedSticker || !isComplete) return;
    const rect = stripRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const stickerData = STICKERS.find(s => s.id === selectedSticker);
    setStickers(prev => [...prev, { ...stickerData, x, y, uid: Date.now() }]);
  };

  const removeSticker = (uid) => {
    setStickers(prev => prev.filter(s => s.uid !== uid));
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const isDarkFrame = ['#000000', '#1a1a1a', '#000080', '#4A0000', '#2F1A1A', '#006400'].includes(frameColor);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F6F4E8]">
        <div className="flex flex-col items-center gap-3">
          <Heart size={40} className="text-[#DC9B9B] animate-pulse" fill="currentColor" />
          <p className="text-[#DC9B9B] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Revealed state — both submitted
  if (isRevealed && user1Photos && user2Photos) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F6F4E8] p-4">
        {/* Love Letter Modal */}
        {showLetter && (
          <LoveLetter onClose={() => setShowLetter(false)} />
        )}

        {/* Revealed Photos */}
        <div ref={revealRef} className="bg-white rounded-2xl p-6 shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-medium text-[#DC9B9B] mb-4 text-center">Both photos revealed</h2>
          <div className="flex gap-4 justify-center">
            <div className="flex flex-col gap-2 items-center">
              <p className="text-xs text-[#DC9B9B]/70 mb-1">Theirs</p>
              {user1Photos.map((photo, i) => (
                <img key={i} src={photo} alt={`Their ${i+1}`} className="w-32 h-24 object-cover rounded" />
              ))}
            </div>
            <div className="flex flex-col gap-2 items-center">
              <p className="text-xs text-[#DC9B9B]/70 mb-1">Yours</p>
              {user2Photos.map((photo, i) => (
                <img key={i} src={photo} alt={`Your ${i+1}`} className="w-32 h-24 object-cover rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={downloadReveal}
            className="flex items-center gap-2 px-6 py-3 bg-[#DC9B9B] hover:bg-[#DC9B9B]/80 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            <Download size={18} />
            Download
          </button>
          <button
            onClick={() => setShowLetter(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#F6F4E8] text-[#DC9B9B] rounded-full text-sm font-medium transition-colors shadow-sm border border-[#DC9B9B]/30"
          >
            <Heart size={18} />
            Read Letter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F6F4E8] p-4 overflow-hidden">
      
      {/* Title */}
      <h1 className="text-xl md:text-2xl font-light tracking-widest text-[#8B5E5E] mb-1 text-center">
        Our Photo Booth
      </h1>
      <p className="text-xs text-[#8B5E5E] mb-4">
        {mode === 'user1' ? 'Take your 4 photos first' : 'Take your photos to reveal theirs'}
      </p>

      {/* Main content */}
      <div className="flex flex-row items-start justify-center gap-4 w-full max-w-6xl flex-1 min-h-0">
        
        {/* Left: Blurred partner strip (only for user2) */}
        {mode === 'user2' && user1Photos && (
          <div className="flex-shrink-0 hidden lg:flex flex-col items-center">
            <div
              className="relative rounded-xl shadow-xl overflow-hidden"
              style={{
                backgroundColor: '#FFFFFF',
                padding: '12px 10px',
                width: '200px',
              }}
            >
              <div className="flex flex-col gap-2">
                {user1Photos.map((photo, index) => (
                  <div
                    key={`blur-${index}`}
                    className="relative w-full aspect-[5/3] rounded overflow-hidden"
                  >
                    <img
                      src={photo}
                      alt={`Their photo ${index + 1}`}
                      className={`w-full h-full object-cover transition-all duration-1000 ${
                        isComplete ? '' : 'blur-lg'
                      }`}
                    />
                    {!isComplete && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="text-white/80 text-[10px] font-medium tracking-wider">HIDDEN</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs font-medium tracking-wide text-[#333]">Their Photos</p>
                <p className="text-[10px] mt-0.5 text-[#666]">2026</p>
              </div>
            </div>
          </div>
        )}

        {/* Center: Camera + Controls */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          
          {!isComplete && (
            <div className="relative w-full max-w-lg aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-md border border-[#C0E1D2]">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-7xl font-bold text-white drop-shadow-lg animate-ping">
                        {countdown}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      onClick={takePhoto}
                      disabled={countdown !== null}
                      className="w-14 h-14 rounded-full bg-white hover:bg-[#F6F4E8] border-4 border-[#DC9B9B] shadow-xl transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                    >
                      <Camera size={24} className="text-[#DC9B9B]" />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 text-[#DC9B9B] text-xs px-3 py-1 rounded-full font-medium shadow">
                    {currentShot + 1} / 4
                  </div>
                </>
              ) : (
                <button
                  onClick={startCamera}
                  className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#E5EEE4] hover:bg-[#C0E1D2]/40 transition-all"
                >
                  <Camera size={48} className="text-[#8B5E5E]" />
                  <span className="text-[#8B5E5E] font-medium tracking-wider text-base">
                    {cameraError ? 'Try Again' : 'Start Camera'}
                  </span>
                  {cameraError ? (
                    <span className="text-red-500 text-xs text-center px-4">
                      Camera access was denied. Please allow camera permission in your browser settings and try again.
                    </span>
                  ) : (
                    <span className="text-[#8B5E5E]/80 text-xs">
                      Take 4 photos for your strip
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Progress dots */}
          {isCameraActive && !isComplete && (
            <div className="flex gap-2 mt-3">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all border-2 ${
                    photos[i] ? 'bg-[#DC9B9B] border-[#DC9B9B]' : 
                    i === currentShot ? 'bg-[#DC9B9B]/30 border-[#DC9B9B] animate-pulse' : 'bg-transparent border-[#C0E1D2]'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {isComplete && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center w-full">
              <button
                onClick={retake}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F6F4E8] text-[#DC9B9B] rounded-full text-xs font-medium transition-colors shadow-sm border border-[#DC9B9B]/30"
              >
                <RotateCcw size={14} />
                Retake
              </button>
              <button
                onClick={downloadStrip}
                className="flex items-center gap-2 px-4 py-2 bg-[#DC9B9B] hover:bg-[#DC9B9B]/80 text-white rounded-full text-xs font-medium transition-colors shadow-sm"
              >
                <Download size={14} />
                Download
              </button>
              <button
                onClick={() => setShowPanel(showPanel === 'stickers' ? null : 'stickers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors shadow-sm border ${
                  showPanel === 'stickers' 
                    ? 'bg-[#DC9B9B] text-white border-[#DC9B9B]' 
                    : 'bg-white hover:bg-[#F6F4E8] text-[#DC9B9B] border-[#DC9B9B]/30'
                }`}
              >
                Stickers
              </button>
              <button
                onClick={() => setShowPanel(showPanel === 'frame' ? null : 'frame')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors shadow-sm border ${
                  showPanel === 'frame' 
                    ? 'bg-[#DC9B9B] text-white border-[#DC9B9B]' 
                    : 'bg-white hover:bg-[#F6F4E8] text-[#DC9B9B] border-[#DC9B9B]/30'
                }`}
              >
                Frame
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex items-center gap-2 px-5 py-2 bg-[#C0E1D2] hover:bg-[#C0E1D2]/80 text-[#2F4F3F] rounded-full text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <Send size={14} />
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          )}

          {/* Frame Color Panel */}
          {showPanel === 'frame' && isComplete && (
            <div className="mt-3 p-4 bg-white rounded-xl border border-[#DC9B9B]/20 shadow-sm w-full max-w-sm">
              <p className="text-[#DC9B9B] text-xs font-medium mb-3 text-center">Frame color</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {FRAME_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFrameColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                      frameColor === color 
                        ? 'ring-2 ring-[#DC9B9B] ring-offset-1 ring-offset-white scale-110 border-[#DC9B9B]' 
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stickers Panel */}
          {showPanel === 'stickers' && isComplete && (
            <div className="mt-3 p-4 bg-white rounded-xl border border-[#DC9B9B]/20 shadow-sm w-full max-w-sm">
              <p className="text-[#DC9B9B] text-xs font-medium mb-2 text-center">Stickers</p>
              <p className="text-[#DC9B9B]/60 text-[10px] mb-2 text-center">
                Pick a sticker, then click on the strip to place it
              </p>
              <div className="grid grid-cols-6 gap-1.5 justify-items-center">
                {STICKERS.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => setSelectedSticker(sticker.id === selectedSticker ? null : sticker.id)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border-2 ${
                      selectedSticker === sticker.id 
                        ? 'bg-[#DC9B9B]/10 border-[#DC9B9B] scale-110' 
                        : 'border-gray-100 hover:border-[#DC9B9B]/40 hover:scale-105 bg-[#F6F4E8]/50'
                    }`}
                    title={sticker.label}
                  >
                    <img src={sticker.src} alt={sticker.label} className="w-7 h-7" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Photo Strip */}
        <div className="flex flex-col items-center h-full flex-shrink-0">
          <div
            ref={stripRef}
            onClick={handleStripClick}
            className="relative rounded-xl shadow-xl overflow-hidden"
            style={{
              backgroundColor: frameColor,
              padding: '12px 10px',
              width: '280px',
              maxHeight: '100%',
              cursor: selectedSticker ? 'crosshair' : 'default',
            }}
          >
            <div className="flex flex-col gap-2">
              {/* Show current user's photos being taken */}
              {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative w-full aspect-[5/3] rounded overflow-hidden"
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt={`Shot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#E5EEE4]/80">
                        <span className="text-[#8B5E5E]/60 text-xs">Photo {index + 1}</span>
                      </div>
                    )}
                  </div>
              ))}
            </div>

            {/* Strip Footer */}
            <div className="mt-3 text-center">
              <p
                className="text-sm font-medium tracking-wide"
                style={{ color: isDarkFrame ? '#F6F4E8' : '#333' }}
              >
                For My Baby
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: isDarkFrame ? '#C0E1D2' : '#666' }}
              >
                2026
              </p>
            </div>

            {/* Stickers overlay */}
            {stickers.map((sticker) => (
              <img
                key={sticker.uid}
                src={sticker.src}
                alt={sticker.label}
                className="absolute w-8 h-8 select-none cursor-pointer hover:scale-125 transition-transform drop-shadow-md"
                style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeSticker(sticker.uid);
                }}
                title="Click to remove"
              />
            ))}
          </div>

          {stickers.length > 0 && (
            <p className="text-[#DC9B9B]/50 text-[10px] mt-1 text-center">
              Click a sticker to remove it
            </p>
          )}
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
