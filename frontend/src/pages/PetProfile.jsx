import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaPaw, FaCalendarAlt, FaHistory, FaEdit, FaTrashAlt, FaMars, FaVenus, FaBirthdayCake, FaWeight, FaUpload, FaExclamationTriangle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { updatePet, deletePet, getPets } from '../redux/slices/petSlice';
import { getMyBookings } from '../redux/slices/bookingSlice';
import Modal from '../components/Modal';
import axios from 'axios';

const PetProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { pets } = useSelector((state) => state.pets);
  const { bookings } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  
  const pet = pets.find(p => p._id === id);

  // Edit Modal State
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', species: 'Dog', breed: '', age: '', gender: 'Male', image: ''
  });
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch data if missing
  useEffect(() => {
    if (pets.length === 0) {
      dispatch(getPets());
    }
    if (bookings.length === 0) {
      dispatch(getMyBookings());
    }
  }, [dispatch, pets.length, bookings.length]);

  // Sync form with pet data
  useEffect(() => {
    if (pet) {
      setEditForm({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        age: pet.age || '',
        gender: pet.gender || 'Male',
        image: pet.image || ''
      });
    }
  }, [pet]);

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#FAF5F0] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center px-6"
        >
          <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50">
             <FaPaw className="text-[#FF9F43] text-4xl" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Finding your friend...</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Pet Profile</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-10 text-[10px] font-black text-[#FF9F43] uppercase tracking-[0.2em] border-b-2 border-[#FF9F43]/20 pb-1"
          >
            Cancel & Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  const uploadImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, config);
      setEditForm((prev) => ({ ...prev, image: data.imageUrl }));
      setIsUploading(false);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      alert('Image upload failed');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(updatePet({ id: pet._id, petData: editForm })).unwrap();
      setEditModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    dispatch(deletePet(pet._id));
    navigate('/dashboard');
  };

  const petBookings = bookings.filter(b => b.pet?._id === pet._id || (typeof b.pet === 'string' && b.pet === pet._id));

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-32">
      {/* Header & Image */}
      <div className="relative h-[45vh] min-h-[400px]">
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg active:scale-95 transition"
          >
            <FaChevronLeft />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setEditModalOpen(true)}
              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg active:scale-95 transition"
            >
              <FaEdit size={16} />
            </button>
            <button 
              onClick={() => setDeleteModalOpen(true)}
              className="w-11 h-11 rounded-full bg-red-50/90 backdrop-blur-md flex items-center justify-center text-red-500 shadow-lg active:scale-95 transition"
            >
              <FaTrashAlt size={16} />
            </button>
          </div>
        </div>

        {/* Pet Image/Icon Container */}
        <div className="w-full h-full bg-[#E5E5E5] relative overflow-hidden">
          {pet.image ? (
            <img 
              src={pet.image.startsWith('http') ? pet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${pet.image}`} 
              alt={pet.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF5F0] to-[#F3E9DF] text-gray-200">
               <FaPaw className="text-[120px] mb-4 opacity-50" />
               <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">No Photo Added</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-12 left-8 right-8 text-white">
             <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#FF9F43] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  {pet.species}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg">
                   {pet.gender === 'Male' ? <FaMars /> : <FaVenus />}
                </span>
             </div>
             <h1 className="text-5xl font-black tracking-tighter leading-none mb-1">{pet.name}</h1>
             <p className="text-sm font-bold text-white/80 tracking-wide mb-4">{pet.breed || 'Unique Breed'}</p>
             <button 
               onClick={() => navigate(`/pet/${id}/wellness`)}
               className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 transition-all active:scale-95 w-fit"
             >
               <div className="w-5 h-5 bg-[#FF9F43] rounded-md flex items-center justify-center text-[10px]">
                 <FaHistory size={10} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Health Journey</span>
             </button>
          </div>
        </div>
        
        <div className="absolute bottom-[-1px] left-0 right-0 h-12 bg-[#FAF5F0] rounded-t-[50px] z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]" />
      </div>

      <div className="px-6 space-y-10 relative z-20 mt-[-10px]">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
           <StatCard icon={<FaBirthdayCake />} label="Age" value={`${pet.age || 0} yrs`} />
           <StatCard icon={<FaPaw />} label="Breed" value={pet.breed || 'Husky'} />
        </div>

        {/* History Section */}
        <section className="space-y-4 pb-10">
           <div className="flex justify-between items-center px-1">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical & Care History</h2>
              <button className="text-[10px] font-black text-[#FF9F43] uppercase tracking-widest hover:underline">Full Report</button>
           </div>
           
           <div className="space-y-4">
              {petBookings.length > 0 ? petBookings.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE).map((booking, idx) => (
                 <motion.div 
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-[35px] border border-gray-50 flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
                 >
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF5F0] flex items-center justify-center text-[#FF9F43] text-lg">
                       <FaCalendarAlt />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-black text-gray-900 text-sm">{booking.serviceType}</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">{new Date(booking.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full">
                       Verified
                    </span>
                 </motion.div>
              )) : (
                <div className="py-20 text-center bg-white rounded-[45px] border-2 border-dashed border-gray-100">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaHistory className="text-gray-200 text-2xl" />
                   </div>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">No history found yet</p>
                </div>
              )}
           </div>
           
           {petBookings.length > ITEMS_PER_PAGE && (
             <div className="flex justify-center items-center gap-4 mt-6">
                <button 
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage(p => p - 1)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 disabled:opacity-30 shadow-sm"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {historyPage} of {Math.ceil(petBookings.length / ITEMS_PER_PAGE)}</span>
                <button 
                  disabled={historyPage === Math.ceil(petBookings.length / ITEMS_PER_PAGE)}
                  onClick={() => setHistoryPage(p => p + 1)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 disabled:opacity-30 shadow-sm"
                >
                  <FaChevronLeft className="rotate-180" />
                </button>
             </div>
           )}
        </section>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Update Pet Details" noScroll={true}>
        <form onSubmit={handleUpdate} className="space-y-5 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pet Name</label>
              <input 
                required 
                className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all shadow-inner" 
                value={editForm.name} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Species</label>
                <select 
                  className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all" 
                  value={editForm.species} 
                  onChange={(e) => setEditForm({...editForm, species: e.target.value})}
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Age (Yrs)</label>
                <input 
                  type="number" 
                  className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all shadow-inner" 
                  value={editForm.age} 
                  onChange={(e) => setEditForm({...editForm, age: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pet Photo</label>
              <div className="relative">
                <input type="file" onChange={uploadImageHandler} className="hidden" id="edit-photo-upload" />
                <label htmlFor="edit-photo-upload" className="w-full flex flex-col items-center justify-center gap-2 h-24 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[25px] cursor-pointer hover:bg-white transition-all overflow-hidden relative group">
                  {editForm.image ? (
                    <img 
                      src={editForm.image.startsWith('http') ? editForm.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${editForm.image}`} 
                      className="absolute inset-0 w-full h-full object-cover opacity-40" 
                    />
                  ) : null}
                  <div className="relative z-10 flex flex-col items-center">
                    <FaUpload className={`text-[#FF9F43] mb-1 transition-transform group-hover:scale-110 ${editForm.image ? 'opacity-50' : ''}`} />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      {isUploading ? 'Uploading...' : 'Update Photo'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="w-[200px] mx-auto h-14 bg-[#FF9F43] rounded-[22px] text-white text-sm font-black uppercase tracking-widest shadow-[0_10px_25px_rgba(255,159,67,0.3)] active:scale-95 transition-all flex items-center justify-center mt-4 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Profile?">
         <div className="py-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 animate-pulse">
               <FaExclamationTriangle size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Are you absolutely sure?</h3>
            <p className="text-xs font-bold text-gray-400 max-w-[250px] leading-relaxed mb-8">
               This will permanently remove <span className="text-red-500">{pet.name}'s</span> profile and all associated data. This action cannot be undone.
            </p>
            <div className="flex flex-col w-full gap-3">
               <button 
                  onClick={handleDelete}
                  className="w-full h-14 bg-red-500 rounded-[22px] text-white text-sm font-black uppercase tracking-widest shadow-lg active:scale-95 transition"
               >
                  Yes, Delete Forever
               </button>
               <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="w-full h-14 bg-gray-50 rounded-[22px] text-gray-400 text-sm font-black uppercase tracking-widest active:scale-95 transition"
               >
                  Cancel
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-[30px] shadow-[0_15px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col items-center text-center">
     <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-[#FF9F43] mb-3">
        {icon}
     </div>
     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
     <p className="text-xs font-black text-gray-900 truncate w-full">{value}</p>
  </div>
);

export default PetProfile;
