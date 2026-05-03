// server/socket/chatHandler.js
// Real-time doctor-patient chat via Socket.io

const Message = require('../models/Message');

module.exports = function setupChat(io) {
  // Track online users: userId -> socketId
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on('user:join', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      // Broadcast online status
      io.emit('users:online', Array.from(onlineUsers.keys()));
      console.log(`👤 User joined: ${userId}`);
    });

    // Join a chat room (roomId = sorted userId pair e.g. "abc_xyz")
    socket.on('room:join', async ({ roomId }) => {
      socket.join(roomId);
      // Send last 50 messages
      try {
        const messages = await Message.find({ roomId })
          .sort({ createdAt: -1 }).limit(50).lean();
        socket.emit('room:history', messages.reverse());
      } catch (e) {
        socket.emit('room:history', []);
      }
    });

    // Send message
    socket.on('message:send', async ({ roomId, senderId, senderName, text, type = 'text' }) => {
      if (!text?.trim() || !roomId) return;
      try {
        const msg = await Message.create({ roomId, senderId, senderName, text: text.trim(), type });
        // Broadcast to all in room
        io.to(roomId).emit('message:receive', msg);
      } catch (e) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', ({ roomId, userName }) => {
      socket.to(roomId).emit('typing:show', { userName });
    });
    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:hide');
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('users:online', Array.from(onlineUsers.keys()));
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};