import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset, updateUserProfile } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaSignOutAlt, FaChevronLeft, FaCamera, FaChevronRight, FaPaw, FaStar, FaBriefcase, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isUploading, setIsUploading] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const uploadProfileImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, config);
      dispatch(updateUserProfile({ image: data.imageUrl }));
      setIsUploading(false);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      alert('Failed to upload image');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-32">
      {/* Header */}
      <div className="p-6 flex items-center justify-between sticky top-0 bg-[#FAF5F0]/80 backdrop-blur-xl z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-sm border border-gray-100 active:scale-95 transition"
        >
          <FaChevronLeft />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">My Profile</h1>
        <div className="w-11" /> {/* Spacer */}
      </div>

      <div className="px-6 space-y-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[50px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col items-center text-center relative overflow-hidden group"
        >
          <div className="absolute top-[-10%] right-[-5%] opacity-[0.03] rotate-12 transition-transform duration-1000 group-hover:rotate-45">
             <FaPaw size={150} />
          </div>

          <div className="relative z-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-[45px] bg-gray-50 border-4 border-[#FF9F43]/10 overflow-hidden shadow-2xl relative transition-transform duration-500 hover:scale-105">
                 {user.image ? (
                   <img 
                    src={user.image.startsWith('http') ? user.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${user.image}`} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">
                      <FaUser />
                   </div>
                 )}
                 {isUploading && (
                   <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                   </div>
                 )}
              </div>
              <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#FF9F43] rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-xl cursor-pointer active:scale-90 transition hover:bg-[#e68a2e]">
                 <FaCamera size={16} />
                 <input type="file" id="profile-upload" className="hidden" onChange={uploadProfileImage} accept="image/*" />
              </label>
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mt-8 tracking-tighter leading-none">{user.name}</h2>
            <div className="inline-flex items-center gap-2 bg-[#FF9F43]/10 px-5 py-2 rounded-full mt-4">
               <FaPaw className="text-[#FF9F43] text-xs" />
               <span className="text-[10px] font-black text-[#FF9F43] uppercase tracking-widest">{user.role}</span>
            </div>
          </div>
        </motion.div>

        {/* Info List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">Account Details</h3>
          <div className="bg-white rounded-[45px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden p-2">
             <ProfileItem icon={<FaEnvelope />} label="Registered Email" value={user.email} />
             
             {/* Dynamic Items based on role/status */}
             <ProfileItem 
                icon={user.isApproved ? <FaCheckCircle className="text-emerald-500" /> : <FaExclamationCircle className="text-amber-500" />} 
                label="Account Status" 
                value={user.isApproved ? 'Verified & Approved' : 'Under Review'} 
             />

             {user.specialization && (
                <ProfileItem icon={<FaBriefcase />} label="Specialization" value={user.specialization} />
             )}

             <ProfileItem icon={<FaPaw />} label="Primary Role" value={user.role} />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4 pt-4">
          <button 
            onClick={onLogout}
            className="w-full h-20 bg-[#1A1A1A] rounded-[35px] flex items-center justify-between px-10 text-white active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="flex items-center gap-5 relative z-10">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-red-400">
                  <FaSignOutAlt size={20} />
               </div>
               <div className="text-left">
                  <span className="block font-black text-sm uppercase tracking-[0.1em]">Sign Out</span>
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Secure Logout</span>
               </div>
            </div>
            <FaChevronRight className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-5 p-6 hover:bg-gray-50/80 transition-all rounded-[35px] cursor-pointer group">
    <div className="w-14 h-14 bg-gray-50 rounded-[22px] flex items-center justify-center text-gray-400 group-hover:text-[#FF9F43] group-hover:bg-[#FF9F43]/5 transition-all">
       {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-[15px] font-black text-gray-900 mt-1 tracking-tight">{value}</p>
    </div>
    <FaChevronRight className="text-gray-200 group-hover:text-[#FF9F43] group-hover:translate-x-1 transition-all" />
  </div>
);

export default Profile;
