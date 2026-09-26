import React, { useState, useEffect } from 'react';
import './ClueGiving.css';
import bgImage from '../assets/how-to-play-bg.png';

export default function ClueGiving({ players, turnOrder, secretWord, spyId, onFinish, roundNumber, myPlayerId, socket, roomId }) {
  const [timeLeft, setTimeLeft] = useState(90);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // Sync turns via socket
  useEffect(() => {
    if (!socket) return;
    
    const handleTurnEnded = () => {
      setCurrentTurnIndex(prev => prev + 1);
    };

    socket.on('turn-ended', handleTurnEnded);

    return () => {
      socket.off('turn-ended', handleTurnEnded);
    };
  }, [socket]);

  // Main Timer
  useEffect(() => {
    if (turnOrder.length === 0) return;

    if (timeLeft > 0 && currentTurnIndex < turnOrder.length) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 || currentTurnIndex >= turnOrder.length) {
      // Wait a moment then finish
      const finishTimer = setTimeout(() => onFinish(), 2500);
      return () => clearTimeout(finishTimer);
    }
  }, [timeLeft, currentTurnIndex, turnOrder, onFinish]);

  const handleEndTurn = () => {
    if (socket && roomId) {
      socket.emit('end-turn', { roomId });
    } else {
      // Fallback for local testing if needed
      setCurrentTurnIndex(prev => prev + 1);
    }
  };

  const activePlayerId = turnOrder[currentTurnIndex];
  const isHumanTurn = activePlayerId === myPlayerId;

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="clue-container fade-in">
      <div className="bg-wrapper">
        <img src={bgImage} alt="background" className="bg-img opacity-40" />
        <div className="dark-overlay" style={{background: 'rgba(0,0,0,0.2)'}}></div>
      </div>

      <div className="clue-content">
        <div className="clue-top-bar">
          <span className="clue-title-left">Find the spy</span>
          <span className="clue-title-right">Round {roundNumber || 1} OF 3</span>
        </div>

        <div className="clue-header-bar">
           <span className="clue-pill-text">Clue {Math.min(currentTurnIndex + 1, players.length)} of {players.length}</span>
           <span className="clue-timer">{formatTime(timeLeft)}</span>
        </div>

        <div className="clue-main-card">
          <div className="clue-turn-section">
            <h2 className="clue-turn-title">
              {currentTurnIndex >= turnOrder.length 
                ? "ROUND OVER" 
                : (isHumanTurn ? "YOUR TURN" : `${players.find(p => p.id === activePlayerId)?.name?.toUpperCase()}'S TURN`)}
            </h2>
            <div className="clue-avatar-grid">
              {players.map((p) => {
                const isActive = p.id === activePlayerId;
                // Check if this player has already taken their turn
                const pTurnIndex = turnOrder.indexOf(p.id);
                const hasFinishedTurn = pTurnIndex > -1 && pTurnIndex < currentTurnIndex;
                
                return (
                  <div key={p.id} className="avatar-wrapper">
                    <div className={`avatar-circle ${isActive ? 'avatar-active' : ''} ${hasFinishedTurn ? 'avatar-done' : ''}`}>
                      <img src={p.avatar} alt={p.name} />
                    </div>
                    <span className="avatar-name">{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="clues-so-far-container">
            <h3 className="clues-so-far-title">Live Voice Discussion</h3>
            <div className="clues-list" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginTop: '20px' }}>
              {currentTurnIndex >= turnOrder.length ? (
                <p>All clues given! Proceeding to voting...</p>
              ) : (
                <p>
                  {isHumanTurn 
                    ? "Speak your clue to the group using your microphone." 
                    : `${players.find(p => p.id === activePlayerId)?.name} is speaking... Listen carefully!`}
                </p>
              )}
            </div>
            
            <div className="clue-input-area" style={{ justifyContent: 'center' }}>
              <button 
                type="button" 
                className={`clue-speak-btn ${isHumanTurn ? 'pulse-pop' : ''}`} 
                disabled={!isHumanTurn}
                onClick={handleEndTurn}
                style={{ 
                  background: isHumanTurn ? '#7c3aed' : '#4b5563', 
                  width: '100%', 
                  padding: '15px', 
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: 'white',
                  cursor: isHumanTurn ? 'pointer' : 'not-allowed',
                  border: 'none',
                  marginTop: '20px'
                }}
              >
                {isHumanTurn ? "Finish My Turn" : "Waiting for turn..."}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
