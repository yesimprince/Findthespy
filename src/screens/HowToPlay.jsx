import React from 'react';
import './HowToPlay.css';
import bgImage from '../assets/how-to-play-bg.png';

export default function HowToPlay({ onBack }) {
  return (
    <div className="how-to-play-container fade-in">
      {/* Background Image */}
      <div className="bg-wrapper">
        <img src={bgImage} alt="background" className="bg-img" />
        <div className="bg-overlay"></div>
      </div>

      <div className="content-wrapper">
        <h1 className="screen-title">How to play</h1>
        
        <div className="rules-scroll-area">
          <div className="rule-card">
            <div className="rule-num">1</div>
            <div className="rule-body">
              <h3 className="rule-title">Everyone gets a word</h3>
              <p className="rule-desc">All players see the same secret word except one.</p>
              <div className="rule-ex">🍕 PIZZA</div>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-num">2</div>
            <div className="rule-body">
              <h3 className="rule-title">The spy gets nothing</h3>
              <p className="rule-desc">The spy only learns that they're the spy, and has to fake it.</p>
              <div className="rule-ex">🕵️ You are the spy</div>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-num">3</div>
            <div className="rule-body">
              <h3 className="rule-title">Give one clue</h3>
              <p className="rule-desc">Describe the word without handing it to the spy.</p>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-num">4</div>
            <div className="rule-body">
              <h3 className="rule-title">Vote</h3>
              <p className="rule-desc">Catch the spy and they still get one guess at the word. Guess right and they win anyway.</p>
            </div>
          </div>
        </div>

        <div className="actions-area">
          <button className="btn-start" onClick={onBack}>
            Let's Start the game <span>→</span>
          </button>
          <button className="btn-skip" onClick={onBack}>
            <u>Skip</u>
          </button>
        </div>
      </div>
    </div>
  );
}
