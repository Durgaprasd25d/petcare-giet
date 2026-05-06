import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaUsers, FaUserShield, FaSearch, FaChevronLeft, FaUserMd, FaStore, FaDog, FaBan, FaCheckCircle, FaTrash, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${user.token}` }
  }), [user.token]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users`, config);
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleSuspend = async (id, isCurrentlySuspended) => {
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}/suspend`, {}, config);
      setUsers(users.map(u => u._id === id ? { ...u, isSuspended: !isCurrentlySuspended } : u));
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}/reject`, config);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Veterinarian': return <FaUserMd className="text-blue-500" />;
      case 'Service Provider': return <FaStore className="text-purple-500" />;
      case 'Pet Owner': return <FaDog className="text-amber-500" />;
      case 'Admin': return <FaUserShield className="text-gray-900" />;
      default: return <FaUsers className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF5F0]/80 backdrop-blur-xl px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-50 flex items-center justify-center text-gray-900"
          >
            <FaChevronLeft size={12} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">User Directory</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Platform Command Center</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-white rounded-[22px] pl-12 pr-6 text-sm font-bold text-gray-900 shadow-sm border border-gray-50 focus:border-gray-900 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Pet Owner', 'Veterinarian', 'Service Provider', 'Admin'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  roleFilter === role ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-900 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Profiles...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <AnimatePresence>
            {filteredUsers.map((u, idx) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white p-6 rounded-[35px] shadow-sm border border-gray-50 flex flex-col gap-6 relative overflow-hidden group ${u.isSuspended ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-[20px] bg-gray-50 flex items-center justify-center text-xl shadow-inner relative">
                      {getRoleIcon(u.role)}
                      {u.isSuspended && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white">
                          <FaBan />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg tracking-tight leading-none">{u.name}</h3>
                      <p className="text-[11px] font-bold text-gray-400 mt-1.5">{u.email}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                          u.role === 'Admin' ? 'bg-gray-900 text-white border-transparent' : 'bg-gray-50 text-gray-500 border-gray-100'
                        }`}>
                          {u.role}
                        </span>
                        {!u.isApproved && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 text-amber-500 border border-amber-100">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${u.isSuspended ? 'bg-red-500' : 'bg-emerald-500'} shadow-lg shadow-black/5 animate-pulse`} />
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Since {new Date(u.createdAt).getFullYear()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {u.role !== 'Admin' && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleSuspend(u._id, u.isSuspended)}
                      className={`flex-1 h-12 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        u.isSuspended ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {u.isSuspended ? <><FaCheckCircle /> Authorize Access</> : <><FaBan /> Suspend Account</>}
                    </motion.button>
                  )}
                  {u.role !== 'Admin' && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(u._id)}
                      className="w-12 h-12 bg-gray-50 text-gray-400 rounded-[18px] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <FaTrash size={14} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FaSearch className="text-gray-200 text-2xl" />
            </div>
            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No users found matching filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
