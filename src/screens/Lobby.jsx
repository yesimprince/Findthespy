import React from 'react';
import './Lobby.css';
import splashBg from '../assets/splash-bg.png';

export default function Lobby({ roomName, roomId, players, isHost, onStartGame, onBack }) {
  return (
    <div className="screen-container lobby-screen fade-in">
      <div className="splash-graphic-container blur-graphic">
        <img src={splashBg} alt="Background" className="splash-image" />
      </div>

      <div className="lobby-content">
        <div className="lobby-header">
          <h2 className="lobby-title">{roomName}</h2>
          <p className="player-count">{players.length}/4 Players Joined</p>
        </div>

        <div className="players-grid">
          {players.map((p, index) => (
            <div key={index} className="lobby-player-card fade-in" style={{animationDelay: `${index * 0.1}s`}}>
              <img src={p.avatar} alt={p.name} />
              <span>{p.name}</span>
            </div>
          ))}
          
          {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
            <div key={`empty-${i}`} className="lobby-player-card empty">
              <div className="empty-avatar">?</div>
              <span>Waiting...</span>
            </div>
          ))}
        </div>

        <div className="lobby-footer">
          <div className="lobby-ctas">
            <button className="cta-btn room-id-btn" onClick={() => {
              navigator.clipboard.writeText(roomId);
              alert(`Room ID ${roomId} Copied!`);
            }}>
              <span className="cta-label">Room ID:</span> {roomId}
            </button>
            <button className="cta-btn invite-btn" onClick={() => {
              const inviteLink = `${window.location.origin}?room=${roomId}`;
              navigator.clipboard.writeText(inviteLink);
              alert("Invite Link Copied!");
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              Invite Link
            </button>
          </div>

          {isHost ? (
            <button 
              className="btn-primary start-game-btn" 
              onClick={onStartGame} 
            >
              Start Game
            </button>
          ) : (
            <button className="btn-primary start-game-btn" disabled style={{ opacity: 0.7 }}>
              Waiting for host to start...
            </button>
          )}

          <button 
            className="btn-secondary" 
            onClick={onBack}
            style={{ marginTop: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', width: '100%', padding: '12px', borderRadius: '16px', color: 'rgba(255,255,255,0.8)' }}
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
