const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for active games (to track spy disconnects)
const activeGames = {};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const { AccessToken } = require('livekit-server-sdk');

// REST API Endpoints

app.post('/api/voice-token', async (req, res) => {
  const { roomName, participantName } = req.body;
  
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    return res.status(500).json({ error: 'LiveKit credentials missing in server .env' });
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
    }
  );
  
  at.addGrant({ roomJoin: true, room: roomName });
  
  res.json({ token: await at.toJwt() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create Room
app.post('/api/rooms', async (req, res) => {
  const { roomName, hostUsername } = req.body;
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Example Prisma usage (commented out until DB is connected)
  /*
  const host = await prisma.player.create({
    data: { username: hostUsername, avatarUrl: 'https://ui-avatars.com/api/?name='+hostUsername }
  });

  const room = await prisma.room.create({
    data: {
      roomCode,
      roomName,
      hostId: host.id,
    }
  });

  await prisma.roomMember.create({
    data: { roomId: room.id, playerId: host.id }
  });
  */

  res.json({ roomCode, roomName, message: 'Database query mocked for now' });
});

// Join Room
app.post('/api/rooms/:code/join', async (req, res) => {
  const { code } = req.params;
  const { username } = req.body;

  // Example Prisma usage
  /*
  const room = await prisma.room.findUnique({ where: { roomCode: code } });
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const player = await prisma.player.create({
    data: { username, avatarUrl: 'https://ui-avatars.com/api/?name='+username }
  });

  await prisma.roomMember.create({
    data: { roomId: room.id, playerId: player.id }
  });
  */

  res.json({ message: `Joined room ${code}` });
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', async ({ roomCode: rawCode, player, roomName: requestedRoomName }, callback) => {
    // #16 Case-sensitive room code
    const roomCode = rawCode.toUpperCase();
    
    // #15 Empty player name
    if (!player.name || player.name.trim() === '') {
      if (typeof callback === 'function') callback({ success: false, error: 'Name cannot be empty' });
      return;
    }

    try {
      // 1. Find or create the Room in the database
      let room = await prisma.room.findUnique({ where: { roomCode } });
      if (!room) {
        room = await prisma.room.create({
          data: {
            roomCode,
            roomName: requestedRoomName || 'Multiplayer Room', 
            status: 'WAITING'
          }
        });
      } else {
        // #5 Join mid-game block
        if (room.status !== 'WAITING') {
          if (typeof callback === 'function') callback({ success: false, error: 'This game is already in progress.' });
          return;
        }
      }

      // Pre-check room members for full capacity or duplicates
      const existingMembers = await prisma.roomMember.findMany({
        where: { roomId: room.id },
        include: { player: true }
      });

      // #9 Room is full
      if (existingMembers.length >= 4) {
        if (typeof callback === 'function') callback({ success: false, error: 'Room is full (max 4 players)' });
        return;
      }

      // #6 Duplicate player
      const duplicate = existingMembers.find(m => m.player.username.toLowerCase() === player.name.toLowerCase().trim());
      if (duplicate) {
        if (typeof callback === 'function') callback({ success: false, error: 'Name is already taken in this room' });
        return;
      }

      socket.join(roomCode);

      // 2. Find or create the Player
      let dbPlayer = await prisma.player.create({
        data: {
          username: player.name.trim(),
          avatarUrl: player.avatar
        }
      });

      // 3. Add player to the room
      await prisma.roomMember.create({
        data: {
          roomId: room.id,
          playerId: dbPlayer.id
        }
      });

      console.log(`User ${player.name} joined room ${roomCode} in database.`);

      // Save context to the socket for when they disconnect
      socket.data = {
        roomId: room.id,
        roomCode: roomCode,
        playerId: dbPlayer.id,
      };

      // 4. Fetch the FULL list of players in this room from the database
      const members = await prisma.roomMember.findMany({
        where: { roomId: room.id },
        include: { player: true },
        orderBy: { joinedAt: 'asc' }
      });

      // 5. Map the database players to the format the frontend expects
      const frontendPlayers = members.map(m => ({
        id: m.player.id,
        name: m.player.username,
        avatar: m.player.avatarUrl,
        score: 0,
        isHuman: true
      }));

      // 6. Broadcast the true database state to everyone in the room, including the room name (#12)
      io.to(roomCode).emit('room-updated', { players: frontendPlayers, roomName: room.roomName });
      
      // 7. Return the DB assigned player ID to the joining client
      if (typeof callback === 'function') {
        callback({ success: true, playerId: dbPlayer.id });
      }
      
    } catch (error) {
      console.error('Error joining room in DB:', error);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Failed to join room' });
      }
    }
  });

  socket.on('start-game', async (data) => {
    // Track active game state
    activeGames[data.roomId] = { spyId: data.spyId, inProgress: true };
    
    // Update DB status so nobody else can join
    try {
      await prisma.room.update({
        where: { roomCode: data.roomId },
        data: { status: 'IN_PROGRESS' }
      });
    } catch (e) {
      console.error('Error updating room status', e);
    }
    
    io.to(data.roomId).emit('game-started', data);
  });

  socket.on('end-turn', ({ roomId }) => {
    io.to(roomId).emit('turn-ended');
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    // If the socket was in a room, remove them from the database
    if (socket.data && socket.data.roomId && socket.data.playerId) {
      try {
        await prisma.roomMember.delete({
          where: {
            roomId_playerId: {
              roomId: socket.data.roomId,
              playerId: socket.data.playerId,
            }
          }
        });
        
        console.log(`Removed player ${socket.data.playerId} from room ${socket.data.roomCode}`);

        // Fetch the updated list of players in the room
        const members = await prisma.roomMember.findMany({
          where: { roomId: socket.data.roomId },
          include: { player: true },
          orderBy: { joinedAt: 'asc' }
        });

        const frontendPlayers = members.map(m => ({
          id: m.player.id,
          name: m.player.username,
          avatar: m.player.avatarUrl,
          score: 0,
          isHuman: true
        }));

        // Broadcast the new list (which has one less person) to the remaining players
        io.to(socket.data.roomCode).emit('room-updated', { players: frontendPlayers });
        
        // Check if the disconnected player was the Spy in an active game
        const game = activeGames[socket.data.roomCode];
        if (game && game.inProgress && game.spyId === socket.data.playerId) {
          io.to(socket.data.roomCode).emit('spy-disconnected');
          delete activeGames[socket.data.roomCode]; // End game state
        }

        // #11 Delete room if it's empty
        if (frontendPlayers.length === 0) {
          await prisma.room.delete({ where: { id: socket.data.roomId } });
          console.log(`Deleted empty room ${socket.data.roomCode}`);
        }
        
      } catch (error) {
        console.error('Error removing player on disconnect:', error);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
