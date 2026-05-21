import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import PasswordScreen from './components/PasswordScreen';
import PhotoGallery from './components/PhotoGallery';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [screen, setScreen] = useState('SPLASH');

  return (
    <div className="min-h-screen bg-[#F6F4E8] text-[#333]">
      {/* Background music - loops continuously */}
      <audio id="bg-music" loop preload="auto">
        <source src="/music/Green Day - Last Night On Earth - [HQ] [-7vjJYco7hM].mp3" type="audio/mpeg" />
      </audio>

      {screen === 'SPLASH' && (
        <div className="min-h-screen flex items-center justify-center">
          <SplashScreen onOpen={() => setScreen('PASSWORD')} />
        </div>
      )}
      {screen === 'PASSWORD' && (
        <div className="min-h-screen flex items-center justify-center">
          <PasswordScreen onSuccess={() => setScreen('GALLERY')} />
        </div>
      )}
      {screen === 'GALLERY' && <PhotoGallery />}

      {/* Music player widget - shows after splash */}
      {screen !== 'SPLASH' && <MusicPlayer />}
    </div>
  );
}

export default App;
