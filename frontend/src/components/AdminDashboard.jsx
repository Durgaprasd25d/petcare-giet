import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaUsers, FaPaw, FaCalendarCheck, FaRupeeSign, FaShieldAlt, FaChevronRight, FaUserShield, FaBoxOpen, FaClock, FaBell } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const config = useMemo(() => ({ 
    headers: { Authorization: `Bearer ${user.token}` } 
  }), [user.token]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/stats`, config);
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats', error);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-16 h-16 border-4 border-gray-900 border-t-[#FF9F43] rounded-full animate-spin shadow-xl" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Welcome Header */}
      <section className="bg-gray-900 p-10 rounded-[50px] relative overflow-hidden group shadow-2xl shadow-black/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#FF9F43] rounded-[18px] flex items-center justify-center text-white shadow-lg">
              <FaUserShield size={20} />
            </div>
            <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em]">Admin Home</span>
          </div>
          <h2 className="text-white text-3xl font-black tracking-tighter leading-tight">
            Welcome Back,<br />
            <span className="text-[#FF9F43]">Admin {user.name.split(' ')[0]}</span>
          </h2>
          <p className="text-white/40 text-[11px] font-medium mt-4 max-w-[200px] leading-relaxed">
            Everything is working. Dashboard is updated with latest info.
          </p>
        </div>
        <FaShieldAlt className="absolute right-[-5%] bottom-[-5%] text-[180px] text-white opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
      </section>

      {/* Primary Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4"
      >
        <StatCard title="Global Users" value={stats?.totalUsers ?? 0} icon={<FaUsers />} color="gold" onClick={() => navigate('/admin/users')} />
        <StatCard title="Active Services" value={stats?.totalBookings ?? 0} icon={<FaBoxOpen />} color="dark" onClick={() => navigate('/admin/services')} />
        <StatCard title="Pet Community" value={stats?.totalPets ?? 0} icon={<FaPaw />} color="dark" />
        <StatCard 
          title="Total Earnings" 
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} 
          icon={<FaRupeeSign />} 
          color="gold" 
        />
      </motion.div>

      {/* Quick Action Hub */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-gray-900 tracking-tight px-1">Main Center</h3>
        <div className="grid grid-cols-1 gap-4">
          <ActionTile 
            title="User List" 
            desc="Lock accounts, check roles, and manage users."
            icon={<FaUsers />}
            path="/admin/users"
            badge={stats?.pendingApprovals > 0 ? `${stats.pendingApprovals} Pending` : null}
            navigate={navigate}
          />
          <ActionTile 
            title="Service List" 
            desc="Check vet and grooming service list."
            icon={<FaBoxOpen />}
            path="/admin/services"
            navigate={navigate}
          />
        </div>
      </section>

      {/* Activity Monitor */}
      <section className="bg-white p-8 rounded-[45px] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Recently Joined</h3>
          <FaClock className="text-gray-200" />
        </div>
        <div className="space-y-6">
          {stats?.recentUsers?.map((u, idx) => (
            <div key={u._id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all">
                  <FaUsers size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">{u.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.role}</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={`p-7 rounded-[40px] relative overflow-hidden group shadow-sm transition-all duration-500 cursor-pointer ${
      color === 'gold' ? 'bg-white border border-gray-100' : 'bg-gray-900 text-white'
    }`}
  >
    <div className="relative z-10">
      <span className={`font-black text-[8px] uppercase tracking-[0.3em] ${color === 'gold' ? 'text-gray-400' : 'text-white/40'}`}>
        {title}
      </span>
      <h3 className="text-3xl font-black mt-3 tracking-tighter transition-transform duration-500 group-hover:scale-110 origin-left">
        {value}
      </h3>
    </div>
    <div className={`absolute right-[-10%] bottom-[-10%] text-[80px] rotate-12 group-hover:rotate-0 transition-transform duration-700 opacity-[0.05] ${
      color === 'gold' ? 'text-gray-900' : 'text-white'
    }`}>
      {icon}
    </div>
  </motion.div>
);

const ActionTile = ({ title, desc, icon, path, badge, navigate }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={() => navigate(path)}
    className="w-full bg-white p-6 rounded-[40px] border border-gray-50 shadow-sm flex items-center gap-6 text-left group hover:shadow-xl transition-all duration-500"
  >
    <div className="w-14 h-14 rounded-[22px] bg-gray-50 flex items-center justify-center text-gray-900 text-xl group-hover:bg-gray-900 group-hover:text-white transition-all duration-500">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-3">
        <h4 className="font-black text-gray-900 text-lg tracking-tight">{title}</h4>
        {badge && (
          <span className="bg-amber-50 text-amber-500 text-[8px] font-black px-3 py-1 rounded-full border border-amber-100 animate-pulse">
            {badge}
          </span>
        )}
      </div>
      <p className="text-[11px] font-medium text-gray-400 mt-1">{desc}</p>
    </div>
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-200 group-hover:text-gray-900 transition-colors">
      <FaChevronRight size={14} />
    </div>
  </motion.button>
);

export default AdminDashboard;
