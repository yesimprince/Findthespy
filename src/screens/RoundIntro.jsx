import React, { useEffect } from 'react';
import './RoundIntro.css';

export default function RoundIntro({ roundNumber, onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="round-intro-container fade-in">
      <img src="/Round w.png" alt="background" className="bg-img" />
      
      <div className="round-text-wrapper pulse-in">
        <h1 className="round-heading">Round {roundNumber}</h1>
      </div>
    </div>
  );
}
