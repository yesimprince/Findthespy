import React, { useEffect } from 'react';
import './Splash.css';
import splashBg from '../assets/splash-bg.png';

export default function Splash({ onStart, onHowToPlay }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onStart();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onStart]);

  return (
    <div className="screen-container splash-screen fade-in">
      <div className="splash-graphic-container">
        <img src={splashBg} alt="Find the Spy" className="splash-image" />
      </div>
    </div>
  );
}
