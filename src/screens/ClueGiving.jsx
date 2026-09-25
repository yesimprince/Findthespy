import React, { useState, useEffect, useRef } from 'react';
import './ClueGiving.css';
import bgImage from '../assets/how-to-play-bg.png';
import { WORD_MAP, SPY_FALLBACK_CLUES, shuffleArray } from '../gameData';

export default function ClueGiving({ players, secretWord, spyId, onFinish, roundNumber }) {
  const [timeLeft, setTimeLeft] = useState(90);
  const [clues, setClues] = useState([]); 
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [humanInput, setHumanInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const cluesEndRef = useRef(null);

  // Initialize turn order on mount
  useEffect(() => {
    if (players && players.length > 0) {
      const order = shuffleArray(players.map(p => p.id));
      setTurnOrder(order);
    }
  }, [players]);

  // Main Timer
  useEffect(() => {
    if (turnOrder.length === 0) return; // Prevent instant skip on initial render

    if (timeLeft > 0 && currentTurnIndex < turnOrder.length) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 || currentTurnIndex >= turnOrder.length) {
      // Wait 2.5 seconds after the last clue is given so the player has time to read it
      const finishTimer = setTimeout(() => onFinish(clues), 2500);
      return () => clearTimeout(finishTimer);
    }
  }, [timeLeft, currentTurnIndex, turnOrder, onFinish, clues]);

  // Bot Turn Logic
  useEffect(() => {
    if (turnOrder.length === 0) return;
    if (currentTurnIndex >= turnOrder.length) return;

    const currentPlayerId = turnOrder[currentTurnIndex];
    
    if (currentPlayerId !== 'human') {
      const delay = Math.floor(Math.random() * 2000) + 2000; 
      const botTimer = setTimeout(() => {
        let clueText = '';
        if (currentPlayerId === spyId) {
          const availableGeneric = SPY_FALLBACK_CLUES.filter(c => !clues.map(cl => cl.text).includes(c));
          clueText = availableGeneric.length > 0 
            ? availableGeneric[Math.floor(Math.random() * availableGeneric.length)]
            : "I agree with what's been said.";
        } else {
          const possibleClues = WORD_MAP[secretWord] || [];
          const availableClues = possibleClues.filter(c => !clues.map(cl => cl.text).includes(c));
          clueText = availableClues.length > 0
            ? availableClues[Math.floor(Math.random() * availableClues.length)]
            : "It's related to the word.";
        }

        setClues(prev => [...prev, { id: Date.now(), playerId: currentPlayerId, text: clueText }]);
        setCurrentTurnIndex(prev => prev + 1);

        // Text-to-Speech for Bots
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(clueText);
          utterance.rate = 0.9 + Math.random() * 0.2; 
          utterance.pitch = 0.8 + Math.random() * 0.4;
          window.speechSynthesis.speak(utterance);
        }
      }, delay);
      
      return () => clearTimeout(botTimer);
    }
  }, [currentTurnIndex, turnOrder, secretWord, spyId, clues]);

  useEffect(() => {
    cluesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [clues]);

  const handleHumanSubmit = (e) => {
    e.preventDefault();
    if (!humanInput.trim()) return;
    
    if (humanInput.toLowerCase().includes(secretWord.toLowerCase())) {
      alert("You can't use the secret word as a clue!");
      return;
    }

    setClues(prev => [...prev, { id: Date.now(), playerId: 'human', text: humanInput }]);
    setHumanInput('');
    setCurrentTurnIndex(prev => prev + 1);
  };

  const handleSpeakNow = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setHumanInput(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const activePlayerId = turnOrder[currentTurnIndex];
  const isHumanTurn = activePlayerId === 'human';

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
              {isHumanTurn ? "YOUR TURN" : `${players.find(p => p.id === activePlayerId)?.name?.toUpperCase()}'S TURN`}
            </h2>
            <div className="clue-avatar-grid">
              {players.map((p) => {
                const isActive = p.id === activePlayerId;
                const hasGivenClue = clues.some(c => c.playerId === p.id);
                
                return (
                  <div key={p.id} className="avatar-wrapper">
                    <div className={`avatar-circle ${isActive ? 'avatar-active' : ''} ${hasGivenClue && !isActive ? 'avatar-done' : ''}`}>
                      <img src={p.avatar} alt={p.name} />
                    </div>
                    <span className="avatar-name">{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="clues-so-far-container">
            <h3 className="clues-so-far-title">Clues So Far</h3>
            <div className="clues-list">
              {clues.slice((turnOrder.length > 0 && currentTurnIndex < turnOrder.length && !isHumanTurn) ? -2 : -3).map((c) => {
                const player = players.find(p => p.id === c.playerId);
                return (
                  <div key={c.id} className="clue-item fade-in">
                    <img src={player?.avatar} alt={player?.name} className="clue-item-avatar" />
                    <div className="clue-item-content">
                      <span className="clue-item-name">{player?.name}</span> 
                      <span className="clue-item-text">"{c.text}"</span>
                    </div>
                  </div>
                );
              })}
              {turnOrder.length > 0 && currentTurnIndex < turnOrder.length && !isHumanTurn && (
                <div className="clue-item fade-in" style={{ opacity: 0.6 }}>
                  <img src={players.find(p => p.id === activePlayerId)?.avatar} className="clue-item-avatar" />
                  <div className="clue-item-content">
                    <span className="clue-item-name">{players.find(p => p.id === activePlayerId)?.name}</span>
                    <span className="clue-item-text">is typing...</span>
                  </div>
                </div>
              )}
              <div ref={cluesEndRef} />
            </div>
            
            <form className="clue-input-area" onSubmit={handleHumanSubmit}>
              <div className="clue-input-wrapper">
                <input 
                  type="text" 
                  className="clue-input" 
                  placeholder="Say about the word" 
                  value={humanInput}
                  onChange={(e) => setHumanInput(e.target.value)}
                  disabled={!isHumanTurn}
                />
                <button type="submit" className="clue-send-btn" disabled={!isHumanTurn || !humanInput.trim()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
              <button 
                type="button" 
                className={`clue-speak-btn ${isHumanTurn && !isListening ? 'pulse-pop' : ''}`} 
                disabled={!isHumanTurn || isListening}
                onClick={handleSpeakNow}
                style={{ background: isListening ? '#ef4444' : '#7c3aed' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                {isListening ? "Listening..." : "Speak now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
