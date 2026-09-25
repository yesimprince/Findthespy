import React, { useState, useEffect } from 'react';
import './Countdown.css';
import bgImage from '../assets/how-to-play-bg.png';

export default function Countdown({ onFinish }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onFinish();
    }
  }, [count, onFinish]);

  return (
    <div className="countdown-container fade-in">
      <div className="bg-wrapper">
        <img src={bgImage} alt="background" className="bg-img" />
        <div className="dark-overlay"></div>
      </div>
      
      {/* key attribute forces React to re-mount the h1 and re-trigger the animation on each tick */}
      <div className="countdown-content" key={count}>
        {count > 0 && <h1 className="countdown-number pulse-pop">{count}</h1>}
      </div>
    </div>
  );
}
