import React from 'react';
import './WordRevealed.css';
import bgImage from '../assets/how-to-play-bg.png';

export default function WordRevealed({ word, isSpy = false, onStart, onHowToPlay }) {
  return (
    <div className="word-screen-container fade-in">
      <div className="bg-wrapper">
        <img src={bgImage} alt="background" className="bg-img" />
        <div className="dark-overlay"></div>
      </div>
      
      <div className="word-modal-container">
        {isSpy ? (
          <div className="word-card-spy pulse-in">
            <div className="spy-icon-small">🔍</div>
            <h1 className="spy-title-large">You're a Spy</h1>
            <p className="spy-subtitle-text">
              Nobody tell you word listen to every clue and improvise something that sounds like you know it
            </p>
          </div>
        ) : (
          <div className="word-card pulse-in">
            <p className="word-subtitle-top">YOUR SECRET WORD</p>
            <h1 className="word-title">{word}</h1>
            <p className="word-subtitle-bottom">
              Anyone except the spy is looking<br/>at the same word
            </p>
          </div>
        )}
      </div>

      <div className="action-buttons splash-actions" style={{ position: 'absolute', bottom: '40px', width: '100%', padding: '0 24px', boxSizing: 'border-box', zIndex: 10 }}>
        <button className="btn-primary" onClick={onStart}>
          Let's Start the game &rarr;
        </button>
        <button className="btn-secondary" onClick={onHowToPlay}>
          How to play?
        </button>
      </div>
    </div>
  );
}
