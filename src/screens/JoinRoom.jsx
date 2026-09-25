import React, { useState } from 'react';
import './JoinRoom.css';
import splashBg from '../assets/splash-bg.png';

export default function JoinRoom({ onJoin, onBack }) {
  const urlParams = new URLSearchParams(window.location.search);
  const initialRoom = urlParams.get('room');
  const [roomId, setRoomId] = useState(initialRoom || '');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      onJoin(roomId.toUpperCase(), username);
    }
  };

  return (
    <div className="screen-container join-room-screen fade-in">
      <div className="splash-graphic-container blur-graphic">
        <img src={splashBg} alt="Find the Spy" className="splash-image" />
      </div>

      <div className="join-room-content fade-in">
        <h2 className="mode-title">Join a Room</h2>
        
        <form className="join-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="modal-input" 
            placeholder="Your Name" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input 
            type="text" 
            className="modal-input" 
            placeholder="Room ID" 
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            maxLength={6}
            style={{ textTransform: 'uppercase' }}
            required
          />
          
          <div className="action-buttons">
            <button type="submit" className="btn-primary">
              Join Game
            </button>
            <button type="button" className="btn-secondary" onClick={onBack}>
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
