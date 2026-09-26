import React, { useState, useEffect } from 'react';
import './ClueGiving.css';
import bgImage from '../assets/how-to-play-bg.png';

export default function ClueGiving({ players, onFinish, roundNumber, myPlayerId, socket, roomId }) {
  const [timeLeft, setTimeLeft] = useState(90);
  const [transcripts, setTranscripts] = useState({}); // { [playerId]: { text: string, timestamp: number } }

  // Listen for live transcripts from other players
  useEffect(() => {
    if (!socket) return;
    
    const handleTranscript = ({ playerId, text }) => {
      setTranscripts(prev => ({
        ...prev,
        [playerId]: { text, timestamp: Date.now() }
      }));
    };

    socket.on('player-transcript', handleTranscript);

    return () => {
      socket.off('player-transcript', handleTranscript);
    };
  }, [socket]);

  // Clear old transcripts automatically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTranscripts(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(playerId => {
          if (now - next[playerId].timestamp > 4000) { // Clear bubble after 4 seconds
            delete next[playerId];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Main Timer (No turns, just 90s for everyone)
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onFinish(); // Automatically move to voting when time is up
    }
  }, [timeLeft, onFinish]);

  // Start continuous Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true; // Send partial results!
    recognition.continuous = true;
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const currentText = finalTranscript || interimTranscript;
      if (currentText.trim() && socket && roomId) {
        // Show locally instantly
        setTranscripts(prev => ({
          ...prev,
          [myPlayerId]: { text: currentText, timestamp: Date.now() }
        }));
        
        // Broadcast
        socket.emit('live-transcript', { roomId, playerId: myPlayerId, text: currentText });
      }
    };
    
    // Automatically restart if it stops
    recognition.onend = () => {
      try {
        recognition.start();
      } catch (e) {
        // Ignore errors if it's already started
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }

    return () => {
      recognition.onend = null;
      recognition.abort();
    };
  }, [socket, roomId, myPlayerId]);

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

        <div className="clue-header-bar" style={{ justifyContent: 'center' }}>
           <span className="clue-timer" style={{ fontSize: '32px' }}>{formatTime(timeLeft)}</span>
        </div>

        <div className="clue-main-card">
          <div className="clue-turn-section">
            <h2 className="clue-turn-title">
              LIVE DISCUSSION
            </h2>
            <p style={{ textAlign: 'center', color: '#97a3b4', marginTop: '-10px', marginBottom: '20px', fontSize: '14px' }}>
              Talk freely! Your microphone will automatically transcribe your voice.
            </p>
            
            <div className="clue-avatar-grid">
              {players.map((p) => {
                const bubble = transcripts[p.id];
                
                return (
                  <div key={p.id} className="avatar-wrapper" style={{ position: 'relative' }}>
                    {bubble && (
                      <div className="speech-bubble">
                        {bubble.text}
                      </div>
                    )}
                    <div className="avatar-circle">
                      <img src={p.avatar} alt={p.name} />
                    </div>
                    <span className="avatar-name">{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '20px' }}>
            <button 
                type="button" 
                onClick={() => onFinish()}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: 'white',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Skip Timer & Go to Voting
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
