import { useState } from 'react'
import './App.css'
import Splash from './screens/Splash'
import HowToPlay from './screens/HowToPlay'
import RoundIntro from './screens/RoundIntro'
import RoleAssigned from './screens/RoleAssigned'
import WordRevealed from './screens/WordRevealed'
import Countdown from './screens/Countdown'
import ClueGiving from './screens/ClueGiving'
import Voting from './screens/Voting'
import RoundResults from './screens/RoundResults'
import Leaderboard from './screens/Leaderboard'
import ModeSelection from './screens/ModeSelection'
import Lobby from './screens/Lobby'
import JoinRoom from './screens/JoinRoom'
import VoiceChat from './components/VoiceChat'
import { WORD_MAP, shuffleArray } from './gameData'
import { socket } from './services/socket'
import { useEffect } from 'react'

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialRoom = urlParams.get('room');
  const [gameState, setGameState] = useState(initialRoom ? 'JOIN_ROOM' : 'SPLASH');
  const [currentRound, setCurrentRound] = useState(1);
  const [players, setPlayers] = useState([]);
  const [secretWord, setSecretWord] = useState('');
  const [usedWords, setUsedWords] = useState([]);
  const [spyId, setSpyId] = useState(null);
  
  // State from child components
  const [cluesGiven, setCluesGiven] = useState([]); 
  const [votes, setVotes] = useState({});
  const [roundOutcome, setRoundOutcome] = useState(null);
  const [lobbyInfo, setLobbyInfo] = useState({ roomName: '', roomId: '' });
  const [myPlayerId, setMyPlayerId] = useState(null);
  
  // Dynamically determine host (first player in DB list)
  const isHost = players.length > 0 && players[0].id === myPlayerId;

  useEffect(() => {
    socket.on('room-updated', (data) => {
      // The server sends the exact list of everyone in the room!
      setPlayers(data.players);
      if (data.roomName) {
        setLobbyInfo(prev => ({ ...prev, roomName: data.roomName }));
      }
    });

    socket.on('game-started', (data) => {
      setCurrentRound(1);
      setUsedWords([data.word]);
      setSecretWord(data.word);
      setSpyId(data.spyId);
      setCluesGiven([]);
      setVotes({});
      setRoundOutcome(null);
      setGameState('ROUND_INTRO');
    });

    socket.on('spy-disconnected', () => {
      alert("The Spy fled! Players win this round by default.");
      setGameState('SPLASH');
      setLobbyInfo({ roomName: '', roomId: '' });
      socket.disconnect();
    });

    socket.on('connect_error', () => {
      alert("Could not connect to server. Please check your internet or try again later.");
    });

    return () => {
      socket.off('room-updated');
      socket.off('game-started');
      socket.off('spy-disconnected');
      socket.off('connect_error');
    };
  }, []); // Remove players from dependency since we just set what the server gives us

  useEffect(() => {
    if (lobbyInfo.roomId && players.length < 2 && !['SPLASH', 'MODE_SELECTION', 'JOIN_ROOM', 'LOBBY', 'HOW_TO_PLAY', 'LEADERBOARD'].includes(gameState)) {
      alert("Not enough players to continue.");
      setGameState('SPLASH');
      setLobbyInfo({ roomName: '', roomId: '' });
      socket.disconnect();
    }
  }, [players.length, gameState, lobbyInfo.roomId]);

  const startLobby = (roomName) => {
    socket.connect();
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLobbyInfo({ roomName, roomId });
    
    // Add human player to lobby
    const human = { id: 'human', name: 'You (Host)', avatar: 'https://ui-avatars.com/api/?name=You&background=00ffcc&color=fff', score: 0, isHuman: true };
    // We don't need to add human locally anymore, the server will send 'room-updated'
    setGameState('LOBBY');

    socket.emit('join-room', { roomCode: roomId, player: human, roomName }, (res) => {
      if (res?.success) setMyPlayerId(res.playerId);
    });
  };

  const handleJoinRoom = (roomId, username) => {
    socket.connect();
    setLobbyInfo({ roomName: 'Joined Room', roomId });
    const human = { id: 'human', name: username, avatar: `https://ui-avatars.com/api/?name=${username}&background=33FF57&color=fff`, score: 0, isHuman: true };
    // Server will send 'room-updated'
    setGameState('LOBBY');
    
    socket.emit('join-room', { roomCode: roomId, player: human }, (res) => {
      if (res?.success) setMyPlayerId(res.playerId);
    });
  };



  const startRound = (roundNum, currentPlayers, currentUsedWords) => {
    // Pick word
    const availableWords = Object.keys(WORD_MAP).filter(w => !currentUsedWords.includes(w));
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    setSecretWord(word);
    setUsedWords([...currentUsedWords, word]);

    // Pick spy
    const newSpyId = currentPlayers[Math.floor(Math.random() * currentPlayers.length)].id;
    setSpyId(newSpyId);
    
    setCluesGiven([]);
    setVotes({});
    setRoundOutcome(null);
    setCurrentRound(roundNum);
    setGameState('ROUND_INTRO');
  };

  const nextRoundOrEnd = () => {
    if (currentRound < 3) {
      startRound(currentRound + 1, players, usedWords);
    } else {
      setGameState('LEADERBOARD');
    }
  };

  const handleVotesFinished = (finalVotes) => {
    setVotes(finalVotes);
    
    // Tally votes
    const voteCounts = {};
    Object.values(finalVotes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    let maxVotes = 0;
    let mostVotedPlayers = [];
    Object.entries(voteCounts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedPlayers = [id];
      } else if (count === maxVotes) {
        mostVotedPlayers.push(id);
      }
    });

    let outcome = 'TIE';
    let updatedPlayers = [...players];

    if (mostVotedPlayers.length === 1) {
      const accusedId = mostVotedPlayers[0];
      if (accusedId === spyId) {
        outcome = 'ROOM_WINS';
        // Add 10 points to everyone who voted for the spy (except the spy)
        updatedPlayers = updatedPlayers.map(p => {
          if (p.id !== spyId && finalVotes[p.id] === spyId) {
            return { ...p, score: p.score + 10 };
          }
          return p;
        });
      } else {
        outcome = 'SPY_WINS';
        // Add 20 points to spy
        updatedPlayers = updatedPlayers.map(p => {
          if (p.id === spyId) {
            return { ...p, score: p.score + 20 };
          }
          return p;
        });
      }
    }

    setRoundOutcome(outcome);
    setPlayers(updatedPlayers);
    setGameState('ROUND_RESULTS');
  };

  const isHumanSpy = spyId === myPlayerId;

  return (
    <div className="app-container">
      {!['SPLASH', 'HOW_TO_PLAY', 'LEADERBOARD', 'MODE_SELECTION', 'JOIN_ROOM', 'LOBBY'].includes(gameState) && (
        <button 
          className="global-quit-btn fade-in"
          onClick={() => {
            if (window.confirm("Are you sure you want to quit the current game?")) {
              setGameState('SPLASH');
            }
          }}
          title="Quit Game"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}

      {gameState === 'SPLASH' && (
        <Splash 
          onStart={() => setGameState('MODE_SELECTION')} 
          onHowToPlay={() => setGameState('HOW_TO_PLAY')} 
        />
      )}
      
      {gameState === 'MODE_SELECTION' && (
        <ModeSelection 
          onPlayFriends={startLobby}
          onJoinRoom={() => setGameState('JOIN_ROOM')}
          onBack={() => setGameState('SPLASH')}
        />
      )}

      {gameState === 'JOIN_ROOM' && (
        <JoinRoom 
          onJoin={handleJoinRoom}
          onBack={() => setGameState('MODE_SELECTION')}
        />
      )}

      {gameState === 'LOBBY' && (
        <Lobby 
          roomName={lobbyInfo.roomName}
          roomId={lobbyInfo.roomId}
          players={players}
          isHost={isHost}
          onStartGame={() => {
            // Host randomly picks word and spy, then tells server to broadcast it
            const availableWords = Object.keys(WORD_MAP);
            const word = availableWords[Math.floor(Math.random() * availableWords.length)];
            const spy = players[Math.floor(Math.random() * players.length)].id;
            
            socket.emit('start-game', { 
              roomId: lobbyInfo.roomId, 
              word: word, 
              spyId: spy 
            });
          }}
          onBack={() => {
            socket.disconnect();
            setGameState('MODE_SELECTION');
          }}
        />
      )}
      
      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlay 
          onBack={() => setGameState('SPLASH')} 
        />
      )}

      {gameState === 'ROUND_INTRO' && (
        <RoundIntro 
          roundNumber={currentRound} 
          onFinish={() => setGameState('ROLE_ASSIGNED')} 
        />
      )}

      {gameState === 'ROLE_ASSIGNED' && (
        <RoleAssigned 
          role={isHumanSpy ? "SPY" : "PLAYER"} 
          onReveal={() => setGameState('WORD_REVEALED')}
          onHowToPlay={() => setGameState('HOW_TO_PLAY')}
        />
      )}

      {gameState === 'WORD_REVEALED' && (
        <WordRevealed 
          word={secretWord}
          isSpy={isHumanSpy}
          onStart={() => setGameState('COUNTDOWN')}
          onHowToPlay={() => setGameState('HOW_TO_PLAY')}
        />
      )}

      {gameState === 'COUNTDOWN' && (
        <Countdown 
          onFinish={() => setGameState('CLUE_GIVING')}
        />
      )}

      {gameState === 'CLUE_GIVING' && (
        <ClueGiving 
          players={players}
          secretWord={secretWord}
          spyId={spyId}
          roundNumber={currentRound}
          myPlayerId={myPlayerId}
          onFinish={(clues) => {
            setCluesGiven(clues);
            setGameState('VOTING');
          }}
        />
      )}

      {gameState === 'VOTING' && (
        <Voting 
          players={players}
          spyId={spyId}
          myPlayerId={myPlayerId}
          onFinish={handleVotesFinished}
        />
      )}

      {gameState === 'ROUND_RESULTS' && (
        <RoundResults 
          outcome={roundOutcome}
          spyPlayer={players.find(p => p.id === spyId)}
          secretWord={secretWord}
          scores={players}
          roundNumber={currentRound}
          myPlayerId={myPlayerId}
          onNextRound={nextRoundOrEnd}
        />
      )}

      {gameState === 'LEADERBOARD' && (
        <Leaderboard 
          players={players}
          myPlayerId={myPlayerId}
          onBack={() => setGameState('SPLASH')} 
        />
      )}

      {/* Global Voice Chat rendered if in an active multiplayer room */}
      {lobbyInfo.roomId && !['SPLASH', 'MODE_SELECTION', 'JOIN_ROOM', 'HOW_TO_PLAY'].includes(gameState) && (
        <VoiceChat 
          roomId={lobbyInfo.roomId} 
          participantName={players.find(p => p.id === 'human')?.name || 'Player'} 
        />
      )}
    </div>
  )
}

export default App
