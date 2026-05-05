import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import PetProfile from './pages/PetProfile';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import socket from './socket';
import { addNotification, getNotifications } from './redux/slices/notificationSlice';

import { addBooking, updateBooking } from './redux/slices/bookingSlice';

function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const hideNavPaths = ['/', '/login', '/register'];
  const shouldHideNav = hideNavPaths.includes(location.pathname) || location.pathname.startsWith('/pet/');

  useEffect(() => {
    if (user) {
      console.log('🔌 Connecting socket for user:', user._id);
      // Connect socket
      socket.connect();
      
      const onConnect = () => {
        console.log('✅ Socket connected:', socket.id);
        socket.emit('join', user._id);
      };

      if (socket.connected) {
        onConnect();
      }

      socket.on('connect', onConnect);

      // Listen for notifications
      socket.on('notification', (notification) => {
        console.log('🔔 Notification received:', notification);
        dispatch(addNotification(notification));
      });

      // Listen for booking updates
      socket.on('bookingUpdated', (booking) => {
        console.log('📅 Booking updated:', booking);
        dispatch(updateBooking(booking));
      });

      // Listen for new bookings (for providers)
      socket.on('bookingCreated', (booking) => {
        console.log('🆕 New booking created:', booking);
        dispatch(addBooking(booking));
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      // Initial fetch
      dispatch(getNotifications());

      return () => {
        socket.off('notification');
        socket.off('bookingUpdated');
        socket.off('bookingCreated');
        socket.off('connect');
        socket.off('disconnect');
        socket.disconnect();
      };
    }
  }, [user, dispatch]);

  return (
    <div className="min-h-screen bg-[#FAF5F0]">
      <main className="px-0 sm:px-0 lg:px-0 max-w-none mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pet/:id" element={<PetProfile />} />
          <Route path="/bookings" element={<Dashboard staffView="bookings" />} />
          <Route path="/services" element={<Dashboard staffView="services" />} />
          <Route path="/add-pet" element={<Dashboard />} />
        </Routes>
      </main>
      {!shouldHideNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
