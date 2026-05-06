import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHome, FaUser, FaCalendarAlt, FaClipboardList, FaPlus, FaStethoscope, FaTools, FaShieldAlt, FaWallet } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  if (!user) return null;

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const ownerLinks = [
    { path: '/dashboard', icon: <FaHome />, label: 'Home' },
    { path: '/book', icon: <FaClipboardList />, label: 'Services' },
    { path: '/dashboard?addPet=true', icon: <FaPlus />, label: 'Add' },
    { path: '/finance', icon: <FaWallet />, label: 'Wallet' },
    { path: '/profile', icon: <FaUser />, label: 'Me' },
  ];

  const staffLinks = [
    { path: '/dashboard', icon: <FaHome />, label: 'Hub' },
    { path: '/bookings', icon: <FaCalendarAlt />, label: 'Tasks' },
    { path: '/services?addService=true', icon: <FaPlus />, label: 'Add' },
    { path: '/services', icon: <FaClipboardList />, label: 'List' },
    { path: '/profile', icon: <FaUser />, label: 'Me' },
  ];

  const getLinks = () => {
    switch (user.role) {
      case 'Pet Owner': return ownerLinks;
      case 'Veterinarian':
      case 'Service Provider': return staffLinks;
      case 'Admin': return [
        { path: '/dashboard', icon: <FaHome />, label: 'Home' },
        { path: '/users', icon: <FaShieldAlt />, label: 'Users' },
        { path: '/profile', icon: <FaUser />, label: 'Admin' },
      ];
      default: return ownerLinks;
    }
  };

  const links = getLinks();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] px-6 pb-3 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav className="bg-[#0A0A0A] h-16 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 flex items-center px-1.5 relative overflow-hidden">
          {/* Animated Sliding Pill Background */}
          {/* We'll use layoutId on the active item container instead for better logic with dynamic text */}
          
          <div className="flex justify-between items-center w-full relative">
            {links.map((link) => {
              const active = isActive(link.path);
              
              return (
                <Link 
                  key={link.path + link.label} 
                  to={link.path}
                  className="relative h-12 flex items-center transition-all duration-500 group flex-1"
                >
                  <div className="w-full flex items-center justify-center">
                    {active ? (
                      <motion.div 
                        layoutId="nav-pill"
                        className="bg-[#FF9F43] h-12 px-5 rounded-full flex items-center gap-2 shadow-[0_4px_15px_rgba(255,159,67,0.3)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      >
                        <span className="text-white text-lg">{link.icon}</span>
                        <span className="text-white text-[12px] font-black uppercase tracking-wider whitespace-nowrap">
                          {link.label}
                        </span>
                      </motion.div>
                    ) : (
                      <div className="text-white/40 group-hover:text-white/70 transition-colors duration-300">
                        <span className="text-xl">{link.icon}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default BottomNav;
