import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import PetProfile from './pages/PetProfile';
import WellnessRoadmap from './pages/WellnessRoadmap';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';
import FinanceHub from './pages/FinanceHub';
import { Toaster } from 'react-hot-toast';
import { FaMobileAlt, FaPaw } from 'react-icons/fa';
import { motion } from 'framer-motion';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import socket from './socket';
import { addNotification, getNotifications } from './redux/slices/notificationSlice';

import { addBooking, updateBooking } from './redux/slices/bookingSlice';
import { updateApprovalStatus } from './redux/slices/authSlice';

function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const hideNavPaths = ['/', '/login', '/register'];
  const shouldHideNav = hideNavPaths.includes(location.pathname);

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

      // Listen for account approval
      socket.on('accountApproved', (data) => {
        console.log('✅ Account approved in real-time:', data);
        dispatch(updateApprovalStatus(true));
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
        socket.off('accountApproved');
        socket.off('connect');
        socket.off('disconnect');
        socket.disconnect();
      };
    }
  }, [user, dispatch]);

  return (
    <div className="min-h-screen bg-[#FAF5F0]">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1a1a1a',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '16px 24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#FF9F43', secondary: '#fff' },
          }
        }}
      />
      <div className="hidden md:flex fixed inset-0 z-[1000] bg-[#1A1A1A] flex-col items-center justify-center text-center p-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md"
        >
          <div className="w-24 h-24 bg-[#FF9F43] rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#FF9F43]/20">
             <img src="/logo.png" className="w-16 h-16 object-contain" alt="Payven Logo" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4">Experience <span className="text-[#FF9F43]">Payven</span> on Mobile</h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">
            Payven is made for a great mobile experience. To explore the world of pet care, please open this site on your smartphone.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-[#FF9F43]">
             <FaMobileAlt />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mobile Only Experience</span>
          </div>
        </motion.div>
      </div>

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
          <Route path="/pet/:petId/wellness" element={<WellnessRoadmap />} />
          <Route path="/finance" element={<FinanceHub />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/services" element={<AdminServices />} />
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
