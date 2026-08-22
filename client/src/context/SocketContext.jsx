import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);

  // Initialize socket on mount
  useEffect(() => {
    const socketServerUrl =
      window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';
    const s = io(socketServerUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Fetch initial notifications & join user room
  useEffect(() => {
    if (socket && isAuthenticated && user) {
      socket.emit('join_user', user.id || user._id);

      // Fetch unread count
      notificationAPI
        .getMyNotifications()
        .then((res) => {
          if (res.data && res.data.success) {
            setUnreadCount(res.data.unreadCount || 0);
          }
        })
        .catch((e) => console.error('Error loading initial notifications:', e));

      // Listen for incoming notifications
      const handleNewNotification = (notif) => {
        setUnreadCount((prev) => prev + 1);
        setToastNotification(notif);
        // Auto clear toast after 6s
        setTimeout(() => {
          setToastNotification((curr) => (curr?._id === notif._id ? null : curr));
        }, 6000);
      };

      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket, isAuthenticated, user]);

  const joinProject = (projectId) => {
    if (socket && projectId) {
      socket.emit('join_project', projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket && projectId) {
      socket.emit('leave_project', projectId);
    }
  };

  const decrementUnread = (count = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - count));
  };

  const clearToast = () => setToastNotification(null);

  return (
    <SocketContext.Provider
      value={{
        socket,
        unreadCount,
        setUnreadCount,
        decrementUnread,
        toastNotification,
        clearToast,
        joinProject,
        leaveProject,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
