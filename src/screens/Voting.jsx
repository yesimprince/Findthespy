import React, { useState, useEffect } from 'react';
import './Voting.css';
import bgImage from '../assets/how-to-play-bg.png';

export default function Voting({ players, spyId, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [votes, setVotes] = useState({}); 
  const [humanLocked, setHumanLocked] = useState(false);
  
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onFinish(votes);
    }
  }, [timeLeft, onFinish, votes]);

  useEffect(() => {
    const bots = players.filter(p => !p.isHuman);
    
    bots.forEach(bot => {
      if (!votes[bot.id]) {
        const delay = Math.floor(Math.random() * 8000) + 1000; 
        const timer = setTimeout(() => {
          setVotes(prev => {
            if (prev[bot.id]) return prev; 
            
            let targetId;
            const validTargets = players.filter(p => p.id !== bot.id);
            
            if (bot.id === spyId) {
              targetId = validTargets[Math.floor(Math.random() * validTargets.length)].id;
            } else {
              if (Math.random() < 0.7) {
                targetId = spyId;
              } else {
                const nonSpies = validTargets.filter(p => p.id !== spyId);
                targetId = nonSpies[Math.floor(Math.random() * nonSpies.length)].id;
              }
            }
            
            return { ...prev, [bot.id]: targetId };
          });
        }, delay);
        return () => clearTimeout(timer); 
      }
    });
  }, [players, spyId]); 

  const handleHumanVote = (targetId) => {
    if (humanLocked) return;
    if (targetId === 'human') return; 
    
    setVotes(prev => ({ ...prev, ['human']: targetId }));
    setHumanLocked(true);
  };

  const voteCounts = {};
  Object.values(votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  const numLocked = Object.keys(votes).length;

  return (
    <div className="voting-container fade-in">
      <div className="bg-wrapper">
        <img src={bgImage} alt="background" className="bg-img" />
        <div className="dark-overlay"></div>
      </div>

      <div className="voting-content">
        <div className="clue-top-bar">
          <span className="clue-title-left">Find the spy?</span>
          <span className="clue-title-right">Voting</span>
        </div>

        <div className="voting-main-card pulse-in">
          <h2 className="voting-title">Who's the spy?</h2>
          <p className="voting-subtitle">Everyone's spoken now guess. {numLocked} of {players.length} have locked in</p>
          
          <div className="voting-list">
            {players.map((p, index) => {
              const isTarget = votes['human'] === p.id;
              const vCount = voteCounts[p.id] || 0;
              const isSelf = p.id === 'human';

              return (
                <button 
                  key={p.id} 
                  className={`voting-item ${isSelf ? 'voting-locked' : ''} ${isTarget ? 'voting-active' : ''}`}
                  onClick={() => handleHumanVote(p.id)}
                  disabled={isSelf || humanLocked}
                >
                  <div className="voting-item-left">
                    <div className="voting-avatar-container">
                      <span className="voting-rank">{index + 1}</span>
                      <img src={p.avatar} alt={p.name} className="voting-avatar" />
                    </div>
                    <span className="voting-name">{p.name} {isSelf && '(You)'}</span>
                  </div>
                  <span className="voting-count">{vCount} votes</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="voting-footer">
          VOTING ENDS IN <span className="voting-time">0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span> sec
        </div>
      </div>
    </div>
  );
}
