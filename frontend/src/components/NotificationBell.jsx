import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { FaBell } from 'react-icons/fa';
import { markSingleRead, addNotification } from '../redux/slices/notificationSlice';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');
      const socket = io(SOCKET_URL);
      socket.emit('join', user._id);

      socket.on('notification', (notif) => {
        dispatch(addNotification(notif));
      });

      return () => socket.disconnect();
    }
  }, [user]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-amber-400 transition-colors"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 mt-4 md:w-80 glass-card overflow-hidden z-[60] shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 bg-secondary font-bold">
              Notifications
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n._id} 
                    onClick={() => {
                      if (!n.isRead) dispatch(markSingleRead(n._id));
                    }}
                    className={`p-4 border-b border-white/5 transition-colors cursor-pointer ${n.isRead ? 'opacity-50' : 'bg-amber-400/5 hover:bg-amber-400/10'}`}
                  >
                    <p className={`text-sm ${!n.isRead ? 'font-black text-gray-900' : 'text-gray-500'}`}>{n.message}</p>
                    <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No new notifications
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
