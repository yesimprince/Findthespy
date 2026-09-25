import React from 'react';
import './Leaderboard.css';

export default function Leaderboard({ players, onBack }) {
  
  const sorted = [...players].sort((a, b) => b.score - a.score);
  
  const top3 = sorted.slice(0, 3);
  const others = sorted.slice(3);

  const first = top3[0] || {};
  const second = top3[1] || {};
  const third = top3[2] || {};

  return (
    <div className="leaderboard-container fade-in">
      <div className="leaderboard-header">
        <button className="leaderboard-back-btn" onClick={onBack}>←</button>
        <h2 className="leaderboard-title">Leaderboard</h2>
      </div>

      <div className="leaderboard-podium">
        {second.id && (
          <div className="podium-item podium-2">
            <div className="podium-avatar-wrapper silver-glow">
              <span className="podium-badge badge-silver">2</span>
              <img src={second.avatar} alt={second.name} className="podium-avatar" />
            </div>
            <span className="podium-name">{second.name}</span>
            <span className="podium-score">{second.score}</span>
            <div className="podium-block block-2">2<sup>nd</sup></div>
          </div>
        )}

        {first.id && (
          <div className="podium-item podium-1">
            <div className="podium-crown">👑</div>
            <div className="podium-avatar-wrapper gold-glow">
              <span className="podium-badge badge-gold">1</span>
              <img src={first.avatar} alt={first.name} className="podium-avatar avatar-large" />
            </div>
            <span className="podium-name">{first.name}</span>
            <span className="podium-score">{first.score}</span>
            <div className="podium-block block-1">1<sup>st</sup></div>
          </div>
        )}

        {third.id && (
          <div className="podium-item podium-3">
            <div className="podium-avatar-wrapper bronze-glow">
              <span className="podium-badge badge-bronze">3</span>
              <img src={third.avatar} alt={third.name} className="podium-avatar" />
            </div>
            <span className="podium-name">{third.name}</span>
            <span className="podium-score">{third.score}</span>
            <div className="podium-block block-3">3<sup>rd</sup></div>
          </div>
        )}
      </div>

      <div className="leaderboard-list-container">
        {others.map((p, index) => (
          <div key={p.id} className={`leaderboard-list-item ${p.id === 'human' ? 'is-you' : ''}`}>
            <div className="list-item-left">
              <span className="list-rank">{index + 4}</span>
              <img src={p.avatar} alt={p.name} className="list-avatar" />
              <span className="list-name">{p.name} {p.id === 'human' && '(You)'}</span>
            </div>
            <div className="list-item-right">
              <span className="list-trophy">🏆</span>
              <span className="list-score">{p.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
