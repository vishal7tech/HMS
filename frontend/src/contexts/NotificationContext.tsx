import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { WebSocketNotification } from '../services/websocketService';

interface NotificationContextType {
  notifications: WebSocketNotification[];
  addNotification: (notification: WebSocketNotification) => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const addNotification = (notification: WebSocketNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only last 10 notifications
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Import websocketService dynamically to avoid SSR issues
    import('../services/websocketService').then(({ default: websocketService }) => {
      setIsConnected(websocketService.isConnected());

      // Subscribe to appointment notifications
      websocketService.subscribeToAppointments((notification) => {
        addNotification(notification);
      });

      // Subscribe to user-specific notifications
      websocketService.subscribeToUserNotifications((notification) => {
        addNotification(notification);
      });

      // Update connection status
      const checkConnection = () => {
        setIsConnected(websocketService.isConnected());
      };

      const interval = setInterval(checkConnection, 5000);
      
      return () => {
        clearInterval(interval);
        websocketService.disconnect();
      };
    }).catch(console.error);
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    clearNotifications,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
