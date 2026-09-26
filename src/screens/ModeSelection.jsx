import React, { useState } from 'react';
import './ModeSelection.css';
import splashBg from '../assets/splash-bg.png';

export default function ModeSelection({ onPlayFriends, onJoinRoom, onBack }) {
  const [showPopup, setShowPopup] = useState(false);
  const [roomName, setRoomName] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if(roomName.trim()) {
      onPlayFriends(roomName);
    }
  };

  return (
    <div className="screen-container mode-selection-screen fade-in">
      <div className="splash-graphic-container blur-graphic">
        <img src={splashBg} alt="Find the Spy" className="splash-image" />
      </div>

      <div className="mode-selection-content fade-in" style={{animationDelay: '0.2s'}}>
        <h2 className="mode-title">Choose Game Mode</h2>
        
        <div className="action-buttons mode-actions">

          <button className="btn-primary friends-btn" onClick={() => setShowPopup(true)}>
            Create a room
          </button>
          <button className="btn-primary" onClick={onJoinRoom} style={{ background: '#7451FF' }}>
            Join a room
          </button>
          <button className="btn-secondary" onClick={onBack}>
            Back
          </button>
        </div>
      </div>

      {showPopup && (
        <div className="modal-overlay fade-in">
          <div className="modal-content">
            <h3 className="modal-title">Create a Room</h3>
            <form onSubmit={handleCreateRoom}>
              <input 
                type="text" 
                className="modal-input"
                placeholder="Enter room name" 
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary modal-btn">Continue</button>
                <button type="button" className="btn-secondary modal-btn-sec" onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
