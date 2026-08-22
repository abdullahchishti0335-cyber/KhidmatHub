import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] New client connected: ${socket.id}`);

    // Join user-specific room for private notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket] Client ${socket.id} joined user_${userId}`);
      }
    });

    // Join project-specific room for live Kanban & Discussions
    socket.on('join_project', (projectId) => {
      if (projectId) {
        socket.join(`project_${projectId}`);
        console.log(`[Socket] Client ${socket.id} joined project_${projectId}`);
      }
    });

    // Leave project room
    socket.on('leave_project', (projectId) => {
      if (projectId) {
        socket.leave(`project_${projectId}`);
        console.log(`[Socket] Client ${socket.id} left project_${projectId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const sendNotificationToUser = (userId, notificationData) => {
  if (io && userId) {
    io.to(`user_${userId.toString()}`).emit('new_notification', notificationData);
  }
};

export const broadcastToProject = (projectId, event, data) => {
  if (io && projectId) {
    io.to(`project_${projectId.toString()}`).emit(event, data);
  }
};

export const broadcastGlobal = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
