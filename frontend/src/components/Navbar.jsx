import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../redux/slices/authSlice';
import { FaPaw, FaSignOutAlt, FaTachometerAlt, FaCalendarPlus, FaBars, FaTimes } from 'react-icons/fa';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-primary/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-xl font-bold text-gradient">
          <FaPaw className="text-amber-500 text-2xl" />
          <span>PetCare</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm hover:text-amber-400 transition-colors">
                <FaTachometerAlt className="text-amber-500" /> Dashboard
              </Link>
              {user.role === 'Pet Owner' && (
                <Link to="/book" className="flex items-center gap-1.5 text-sm hover:text-amber-400 transition-colors">
                  <FaCalendarPlus className="text-amber-500" /> Book Service
                </Link>
              )}
              <NotificationBell />
              <span className="text-sm text-gray-400">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors">
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:text-amber-400 transition-colors">Login</Link>
              <Link to="/register" className="btn-brown text-sm px-5 py-2">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Right: Bell + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {user && <NotificationBell />}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-xl p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a1008]/95 backdrop-blur-md border-t border-white/10 px-4 py-4 space-y-3">
          {user ? (
            <>
              <div className="text-sm text-gray-400 pb-2 border-b border-white/10">
                Signed in as <span className="text-amber-400 font-bold">{user.name}</span>
                <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{user.role}</span>
              </div>
              <Link to="/dashboard" onClick={closeMenu} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-white/5 transition">
                <FaTachometerAlt className="text-amber-500" /> Dashboard
              </Link>
              {user.role === 'Pet Owner' && (
                <Link to="/book" onClick={closeMenu} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-white/5 transition">
                  <FaCalendarPlus className="text-amber-500" /> Book Service
                </Link>
              )}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-lg text-red-400 hover:bg-red-500/10 transition text-left"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="block py-3 px-4 rounded-lg hover:bg-white/5 transition">Login</Link>
              <Link to="/register" onClick={closeMenu} className="block btn-brown text-center py-3">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
