import React, { createContext, useContext, useState } from 'react';
import { SystemNotification } from '../types/notification';

interface NotificationContextType {
  notifications: SystemNotification[];
  addNotification: (note: SystemNotification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const addNotification = (note: SystemNotification) => setNotifications((prev) => [note, ...prev]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext error');
  return ctx;
};
