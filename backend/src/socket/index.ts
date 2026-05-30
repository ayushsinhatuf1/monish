import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../shared/constants';

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // NOTE: Redis adapter removed for local dev — single instance is fine
  // In production, add: import { createAdapter } from '@socket.io/redis-adapter';

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_QUIZ_ROOM, (quizId: string) => {
      socket.join(`quiz_${quizId}`);
      console.log(`Socket ${socket.id} joined room quiz_${quizId}`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_QUIZ_ROOM, (quizId: string) => {
      socket.leave(`quiz_${quizId}`);
    });

    socket.on(SOCKET_EVENTS.JOIN_USER_ROOM, (userId: string) => {
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const socketHelpers = {
  broadcastQuizParticipantUpdate(quizId: string, count: number) {
    if (io) io.to(`quiz_${quizId}`).emit(SOCKET_EVENTS.QUIZ_PARTICIPANT_JOINED, { quizId, count });
  },
  broadcastQuizThresholdReached(quizId: string) {
    if (io) io.to(`quiz_${quizId}`).emit(SOCKET_EVENTS.QUIZ_THRESHOLD_REACHED, { quizId });
  },
  broadcastQuizStarted(quizId: string) {
    if (io) io.to(`quiz_${quizId}`).emit(SOCKET_EVENTS.QUIZ_STARTED, { quizId });
  },
  broadcastQuizCancelled(quizId: string) {
    if (io) io.to(`quiz_${quizId}`).emit(SOCKET_EVENTS.QUIZ_CANCELLED, { quizId });
  },
  broadcastQuizWinnerAnnounced(quizId: string) {
    if (io) io.to(`quiz_${quizId}`).emit(SOCKET_EVENTS.QUIZ_WINNER_ANNOUNCED, { quizId });
  },
  notifyUserWalletUpdated(userId: string, balance: number) {
    if (io) io.to(`user_${userId}`).emit(SOCKET_EVENTS.USER_WALLET_UPDATED, { balance });
  },
};
