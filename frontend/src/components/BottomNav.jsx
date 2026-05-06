import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHome, FaUser, FaCalendarAlt, FaClipboardList, FaPlus, FaStethoscope, FaTools, FaShieldAlt, FaWallet, FaUsers, FaBoxOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  if (!user) return null;

  const isActive = (path) => {
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
    { path: '/dashboard', icon: <FaHome />, label: 'Home' },
    { path: '/bookings', icon: <FaCalendarAlt />, label: 'Tasks' },
    { path: '/services?addService=true', icon: <FaPlus />, label: 'Add' },
    { path: '/services', icon: <FaClipboardList />, label: 'List' },
    { path: '/profile', icon: <FaUser />, label: 'Me' },
  ];

  const adminLinks = [
    { path: '/dashboard', icon: <FaHome />, label: 'Home' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/services', icon: <FaBoxOpen />, label: 'Services' },
    { path: '/profile', icon: <FaUser />, label: 'Admin' },
  ];

  const getLinks = () => {
    switch (user.role) {
      case 'Pet Owner': return ownerLinks;
      case 'Veterinarian':
      case 'Service Provider': return staffLinks;
      case 'Admin': return adminLinks;
      default: return ownerLinks;
    }
  };

  const links = getLinks();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] px-6 pb-6 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav className="bg-[#0A0A0A]/90 backdrop-blur-2xl h-20 rounded-[35px] shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-white/10 flex items-center px-3 relative overflow-hidden">
          <div className="flex justify-between items-center w-full relative">
            {links.map((link) => {
              const active = isActive(link.path);
              
              return (
                <Link 
                  key={link.path + link.label} 
                  to={link.path}
                  className="relative h-14 flex items-center transition-all duration-500 group flex-1"
                >
                  <div className="w-full flex items-center justify-center">
                    {active ? (
                      <motion.div 
                        layoutId="nav-pill"
                        className="bg-[#FF9F43] h-14 px-5 rounded-[22px] flex items-center gap-3 shadow-[0_8px_25px_rgba(255,159,67,0.4)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      >
                        <span className="text-white text-xl">{link.icon}</span>
                        <span className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                          {link.label}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        whileHover={{ y: -2 }}
                        className="text-white/30 group-hover:text-white/70 transition-all duration-300 flex flex-col items-center gap-1"
                      >
                        <span className="text-2xl">{link.icon}</span>
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40">{link.label}</span>
                      </motion.div>
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
