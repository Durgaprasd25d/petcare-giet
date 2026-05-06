import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaStethoscope, FaClipboardList, FaSearch, FaChevronLeft, FaUserMd, FaStore, FaClock, FaRupeeSign, FaTrash, FaCheckCircle, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${user.token}` }
  }), [user.token]);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/services`, config);
      setServices(data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this service from the platform?')) return;
    try {
      // Assuming deleteService endpoint works or I should add an admin one
      await axios.delete(`${import.meta.env.VITE_API_URL}/services/${id}`, config);
      setServices(services.filter(s => s._id !== id));
      toast.success('Service removed successfully');
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      if (!s || !s.name) return false;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, categoryFilter]);

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
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">All Services</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Service List</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input 
              type="text" 
              placeholder="Search services or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-premium pl-12 pr-6"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Veterinary', 'Grooming', 'Walking', 'Boarding'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  categoryFilter === cat ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-900 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Services...</span>
          </div>
        ) : filteredServices.length > 0 ? (
          <AnimatePresence>
            {filteredServices.map((s, idx) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-50 flex flex-col gap-6 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center text-3xl shadow-inner overflow-hidden border border-gray-100">
                      {s.image ? (
                        <img src={s.image.startsWith('http') ? s.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${s.image}`} className="w-full h-full object-cover" alt="" />
                      ) : (
                        s.category === 'Veterinary' ? <FaStethoscope className="text-blue-400" /> : <FaStore className="text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg tracking-tight leading-none">{s.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded">
                          {s.category}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <p className="text-[10px] font-bold text-gray-400">By {s.provider?.name}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-900">
                          <FaRupeeSign className="text-amber-500" />
                          <span>{s.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400">
                          <FaClock className="opacity-50" />
                          <span>{s.duration} Min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(s._id)}
                    className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <FaTrash size={12} />
                  </motion.button>
                </div>

                <div className="p-4 bg-gray-50/50 rounded-[22px] border border-gray-50">
                   <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic font-medium">"{s.description}"</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div key="no-services-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FaClipboardList className="text-gray-200 text-2xl" />
            </div>
            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No services found in list</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminServices;
