import React, { useEffect, useState } from 'react';
import { SERVER_URL } from '../services/socket';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  useParticipants
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
    <div style={{ marginTop: '15px' }}>
      <LiveKitRoom
        serverUrl={import.meta.env.VITE_LIVEKIT_URL || 'wss://placeholder-url.livekit.cloud'}
        token={token}
        connect={true}
        audio={true}
        video={false}
      >
        <RoomAudioRenderer />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <ControlBar controls={{ camera: false, screenShare: false, chat: false, leave: false }} />
        </div>
        <VoiceParticipants />
      </LiveKitRoom>
    </div>
  );
}

function VoiceParticipants() {
  const participants = useParticipants();
  return (
    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
      🎙️ {participants.length} player(s) in Voice Chat
    </div>
  );
}
