import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useStore from '../store/useStore';

// ✅ Works locally and in production
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports:        ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnection:      true,
    });
  }
  return socketInstance;
}

export function useSocket() {
  const { user } = useStore();
  const socket   = useRef(getSocket());

  useEffect(() => {
    const id = user?._id || user?.id;
    if (id) socket.current.emit('user:join', id);
  }, [user]);

  const joinRoom    = useCallback((roomId) => socket.current.emit('room:join', { roomId }), []);
  const sendMessage = useCallback((roomId, text, senderId, senderName) => {
    socket.current.emit('message:send', { roomId, senderId, senderName, text });
  }, []);
  const onMessage   = useCallback((cb) => {
    socket.current.on('message:receive', cb);
    return () => socket.current.off('message:receive', cb);
  }, []);
  const onHistory   = useCallback((cb) => {
    socket.current.on('room:history', cb);
    return () => socket.current.off('room:history', cb);
  }, []);
  const sendTyping  = useCallback((roomId, userName, isTyping) => {
    socket.current.emit(isTyping ? 'typing:start' : 'typing:stop', { roomId, userName });
  }, []);
  const onTyping    = useCallback((showCb, hideCb) => {
    socket.current.on('typing:show', showCb);
    socket.current.on('typing:hide', hideCb);
    return () => { socket.current.off('typing:show', showCb); socket.current.off('typing:hide', hideCb); };
  }, []);

  return { socket: socket.current, joinRoom, sendMessage, onMessage, onHistory, sendTyping, onTyping };
}