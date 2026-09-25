import React from 'react';
import './RoleAssigned.css';
import bgImage from '../assets/how-to-play-bg.png';

export default function RoleAssigned({ onHowToPlay, onReveal, role }) {
  // role is either 'PLAYER' or 'SPY'
  return (
    <div className="role-screen-container fade-in">
      <div className="bg-wrapper">
        <img src={bgImage} alt="background" className="bg-img" />
        <div className="dark-overlay"></div>
      </div>
      
      <div className="role-modal-container">
        <div className={`role-card ${role === 'SPY' ? 'role-spy' : 'role-player'} pulse-in`}>
          <div className="role-icon">🔍</div>
          <h1 className="role-title">You're a {role === 'SPY' ? 'Spy' : 'player'}</h1>
          <p className="role-subtitle">
            {role === 'SPY' 
              ? "Nobody tell you word listen to every clue and improvise something that sounds like you know it" 
              : "You get the word. protect it."}
          </p>
        </div>
      </div>

      <div className="action-buttons splash-actions" style={{ position: 'absolute', bottom: '40px', width: '100%', padding: '0 24px', boxSizing: 'border-box', zIndex: 10 }}>
        <button className="btn-primary" onClick={onReveal}>
          Reveal Word &rarr;
        </button>
        <button className="btn-secondary" onClick={onHowToPlay}>
          How to play?
        </button>
      </div>
    </div>
  );
}
