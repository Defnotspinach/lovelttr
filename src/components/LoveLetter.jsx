import { useState, useEffect } from 'react';

const LETTER_TEXT = `To my baby,

I'm writing this letter to remind you how much I love you.

If you are reading this, ive made this to show how far we got into our relationship how deep we are in the relationship, i will alway love you and will always want to be with you, im sorry if ever i did hurt your feeling, if nag iba un mood mo sakin and if may ginawa ako na ayaw mo, mind you i will never cheat on you, d ako gagaya sa mga yan sa mundong maraming cheater ako to loyal sayo hahahaha i love you baby and take care of yourself palagi haaa i may not be there but i will always love you, and both our sides are finally complete. i will cherish every moment that i have for you, i want to understand you so much and i will love you in every mood that you are having i love you mwa mwa built this little space just for us to remind you of how much you mean to me. No matter the distance, we always find a way to fit ogether perfectly.

I love you so much.

- Your fav person`;

export default function LoveLetter({ onClose }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < LETTER_TEXT.length) {
        setDisplayedText(LETTER_TEXT.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTypingDone(true);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Kraft paper background */}
      <div className="relative max-w-md w-full">
        {/* Outer kraft paper */}
        <div className="bg-[#D4A574] rounded-lg p-4 shadow-2xl">
          {/* Notebook paper */}
          <div
            className="bg-[#FEFEFA] rounded p-8 relative overflow-hidden"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #B5D4E8 31px, #B5D4E8 32px)',
              backgroundPosition: '0 40px',
              minHeight: '400px',
            }}
          >
            {/* Red margin line */}
            <div className="absolute top-0 bottom-0 left-12 w-[1px] bg-[#E88B8B]/50" />

            {/* Letter content with typing effect */}
            <div className="relative pl-6 pt-2">
              <pre className="font-['Patrick_Hand'] text-[#2C2C2C] text-lg leading-[32px] whitespace-pre-wrap">
                {displayedText}
                {!isTypingDone && (
                  <span className="inline-block w-[2px] h-5 bg-[#2C2C2C] animate-pulse ml-[1px]" />
                )}
              </pre>
            </div>
          </div>
        </div>

        {/* Close button */}
        {isTypingDone && (
          <button
            onClick={onClose}
            className="absolute -bottom-14 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-white text-[#DC9B9B] rounded-full text-sm font-medium hover:bg-[#F6F4E8] transition-colors shadow-md border border-[#DC9B9B]/30"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
