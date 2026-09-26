import React, { useEffect, useState } from 'react';
import { SERVER_URL } from '../services/socket';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function VoiceChat({ roomId, participantName }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/voice-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName: roomId, participantName })
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        setToken(data.token);
      } else if (data.error) {
        setError(data.error);
      }
    })
    .catch(err => {
      console.error('Error fetching voice token:', err);
      setError('Could not connect to voice server.');
    });
  }, [roomId, participantName]);

  if (error) {
    return <div style={{ color: '#ff6b6b', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>Voice setup required (LiveKit API Keys)</div>;
  }

  if (!token) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>Connecting to voice chat...</div>;
  }

  return (
    <div style={{ 
      position: 'absolute', 
      bottom: '10px', 
      left: '0',
      right: '0',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none' // allow clicking through empty space
    }}>
      <LiveKitRoom
        serverUrl={import.meta.env.VITE_LIVEKIT_URL || 'wss://placeholder-url.livekit.cloud'}
        token={token}
        connect={true}
        audio={true}
        video={false}
      >
        <RoomAudioRenderer />
        <MicController />
        <div style={{ pointerEvents: 'auto' }}>
          <VoiceParticipants />
        </div>
      </LiveKitRoom>
    </div>
  );
}

function MicController() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  
  useEffect(() => {
    if (!localParticipant) return;
    
    // Broadcast state
    window.dispatchEvent(new CustomEvent('mic-state-changed', { detail: isMicrophoneEnabled }));
  }, [localParticipant, isMicrophoneEnabled]);

  useEffect(() => {
    if (!localParticipant) return;

    const handleToggle = async () => {
      try {
        console.log('Toggling mic to:', !isMicrophoneEnabled);
        await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
        // Force update if hook is slow
        window.dispatchEvent(new CustomEvent('mic-state-changed', { detail: !isMicrophoneEnabled }));
      } catch (err) {
        console.error('Error toggling mic:', err);
        alert('Could not toggle microphone. Check browser permissions.');
      }
    };

    window.addEventListener('toggle-mic', handleToggle);
    return () => window.removeEventListener('toggle-mic', handleToggle);
  }, [localParticipant, isMicrophoneEnabled]);

  return null;
}

function VoiceParticipants() {
  const participants = useParticipants();
  return (
    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
      🎙️ {participants.length} player(s) in Voice Chat
    </div>
  );
}
