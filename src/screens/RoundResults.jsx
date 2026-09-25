import React, { useState, useEffect } from 'react';
import './RoundResults.css';
import bgImage from '../assets/how-to-play-bg.png';

export default function RoundResults({ onNextRound, outcome, spyPlayer, secretWord, scores, roundNumber }) {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onNextRound();
    }
  }, [timeLeft, onNextRound]);

  const isSpyWin = outcome === 'SPY_WINS';
  const isTie = outcome === 'TIE';

  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="results-container fade-in">
      <div className="bg-wrapper">
        <img src={bgImage} alt="background" className="bg-img" />
        <div className="dark-overlay"></div>
      </div>

      <div className="results-content">
        <div className="results-top-bar">
          <span className="results-top-title">ROUND RESULTS</span>
        </div>

        <div className="results-main-card">
          <div className={`results-banner ${isSpyWin ? 'banner-spy' : isTie ? 'banner-tie' : 'banner-room'}`}>
            <h2 className="results-banner-title">
              {isSpyWin ? <>The spy wins<br/>this round</> : 
               isTie ? <>It's a Tie!</> : 
               <>The room wins<br/>this round</>}
            </h2>
            <p className="results-banner-subtitle">
              {isSpyWin 
                ? <>The room voted for the wrong<br/>person the spy gets 20 points.</> 
                : isTie 
                ? <>No one found the spy this round.<br/>Everyone played it too close!</>
                : <>The room caught the spy each<br/>correct votes gets 10 point.</>}
            </p>
          </div>

          <div className="results-section">
            <h3 className="results-section-title">THE SPY WAS</h3>
            <div className="results-spy-row">
              <div className="results-avatar-container">
                <span className="results-rank-badge">?</span>
                <img src={spyPlayer?.avatar} alt={spyPlayer?.name} className="results-avatar" />
              </div>
              <span className="results-spy-name">{spyPlayer?.name}</span>
            </div>
          </div>

          <div className="results-section">
            <h3 className="results-section-title">THE WORD WAS</h3>
            <h1 className="results-word">{secretWord}</h1>
          </div>

          <div className="results-section results-scoreboard">
            <h3 className="results-section-title">SCOREBOARD</h3>
            <div className="results-score-list">
              {sortedScores.map((s, idx) => (
                <div key={s.id} className="results-score-item">
                  <div className="score-left">
                    <span className="score-rank">{idx + 1}</span>
                    <img src={s.avatar} alt={s.name} className="score-avatar" />
                    <span className="score-name">{s.name} {s.id === 'human' && '(You)'}</span>
                  </div>
                  <div className="score-right">
                    <span className="score-trophy">🏆</span>
                    <span className="score-points">{s.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary results-next-btn" onClick={onNextRound} style={{ marginTop: 'auto', marginBottom: 0 }}>
            {roundNumber >= 3 ? `See full results in ${timeLeft} sec` : `Next Round Starts in ${timeLeft} sec`}
          </button>
        </div>
      </div>
    </div>
  );
}
