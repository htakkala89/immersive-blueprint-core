import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
}

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for notification events
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const { title, message, type = 'info', persistent = false } = event.detail;
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        title,
        message,
        type,
        timestamp: new Date(),
        read: false,
        persistent
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    window.addEventListener('game-notification', handleNotification as EventListener);
    
    return () => {
      window.removeEventListener('game-notification', handleNotification as EventListener);
    };
  }, []);

  // Auto-remove non-persistent notifications after 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => 
          notification.persistent || 
          Date.now() - notification.timestamp.getTime() < 30000
        )
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 w-80 max-w-[90vw] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50"
            style={{ maxHeight: '70vh' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-3 rounded-lg mb-2 border transition-colors cursor-pointer ${
                        notification.read
                          ? 'bg-white/5 border-white/10'
                          : 'bg-white/10 border-white/20'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm mb-1 ${
                              notification.read ? 'text-gray-300' : 'text-white'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-xs mb-1 ${
                              notification.read ? 'text-gray-400' : 'text-gray-200'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="text-gray-500 hover:text-white transition-colors p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Helper function to trigger notifications from anywhere in the app
export const triggerNotification = (notification: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  persistent?: boolean;
}) => {
  window.dispatchEvent(new CustomEvent('game-notification', { detail: notification }));
};