import { useState, useRef, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';

export default function PasswordScreen({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    focusInput();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(focusInput, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', focusInput);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', focusInput);
    };
  }, []);

  const handleInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(value);
    setIsError(false);

    if (value.length === 4) {
      if (value === '0330') {
        setIsSuccess(true);
        setTimeout(() => onSuccess(), 1000);
      } else {
        setIsError(true);
        setPin('');
      }
    }
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center w-full h-screen bg-[#F6F4E8] px-4"
      onClick={handleContainerClick}
    >
      <div className="border-2 border-[#DC9B9B]/40 rounded-2xl p-10 bg-white shadow-md max-w-sm w-full">
        <div className="mb-8 flex justify-center">
          {isSuccess ? (
            <Unlock size={48} className="text-[#C0E1D2] animate-bounce" />
          ) : (
            <Lock size={48} className="text-[#DC9B9B]" />
          )}
        </div>
        
        <div className={`flex gap-4 justify-center mb-6 ${isError ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index}
              className={`w-14 h-16 rounded-lg flex items-center justify-center text-2xl font-bold bg-[#F6F4E8] border-2 transition-colors ${
                isError ? 'border-red-400 text-red-400' : 
                isSuccess ? 'border-[#C0E1D2] text-[#C0E1D2]' : 
                pin.length > index ? 'border-[#DC9B9B] text-[#DC9B9B]' : 'border-[#E5EEE4]'
              }`}
            >
              {pin[index] ? '\u2022' : ''}
            </div>
          ))}
        </div>

        <input 
          ref={inputRef}
          type="text"
          value={pin}
          onChange={handleInput}
          className="w-full h-0 opacity-0 absolute"
          autoFocus
          inputMode="numeric"
          autoComplete="off"
        />

        <p className="text-base font-light tracking-wide text-[#DC9B9B] text-center mt-4">
          Its the day you accepted me as a boyfriend
        </p>

        {isError && (
          <p className="text-red-400 text-sm mt-4 font-medium text-center">
            Incorrect PIN. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
