import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllServices } from '../redux/slices/serviceSlice';
import { getPets } from '../redux/slices/petSlice';
import axios from 'axios';
import { FaCalendarPlus, FaUserMd, FaCut, FaWalking, FaStoreAlt, FaCreditCard, FaInfoCircle, FaStar, FaChevronLeft, FaSearch, FaHistory, FaPaw, FaStethoscope, FaTools, FaChevronDown, FaCheck, FaCalendarAlt, FaClock, FaChevronRight, FaPaperPlane } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';

// Performance optimized component
const Booking = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('type');

  const { user } = useSelector((state) => state.auth);
  const { pets } = useSelector((state) => state.pets);
  const { services, isLoading } = useSelector((state) => state.services);

  const [bookingData, setBookingData] = useState({
    petId: '',
    serviceId: null,
    date: '',
    time: '',
    notes: ''
  });

  const [isReviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [isDateTimeModalOpen, setDateTimeModalOpen] = useState(false);
  const [selectedServiceReviews, setSelectedServiceReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isPetDropdownOpen, setPetDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(getAllServices(categoryFilter));
    dispatch(getPets());
  }, [dispatch, categoryFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setPetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateBooking = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!bookingData.serviceId || !bookingData.petId || !bookingData.date || !bookingData.time) {
      return alert('Please complete all selection fields');
    }

    try {
      setIsSubmitting(true);
      const token = user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        petId: bookingData.petId,
        providerId: bookingData.serviceId.provider?._id || null,
        serviceType: bookingData.serviceId.category,
        date: `${bookingData.date}T${bookingData.time}`,
        amount: bookingData.serviceId.price,
        notes: bookingData.notes
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/bookings`, payload, config);
      
      setIsSubmitting(false);
      alert('Your booking is set! 🎉');
      navigate('/dashboard');
    } catch (error) {
      setIsSubmitting(false);
      alert(error.response?.data?.message || 'Booking failed, try again');
    }
  }, [bookingData, user.token, navigate]);

  const getIconForCategory = (category) => {
    switch (category) {
      case 'Veterinary': return <FaStethoscope />;
      case 'Grooming': return <FaTools />;
      case 'Walking': return <FaWalking />;
      default: return <FaPaw />;
    }
  };

  const selectedPet = useMemo(() => pets.find(p => p._id === bookingData.petId), [pets, bookingData.petId]);

  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  }), []);

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-32 overflow-x-hidden transition-all duration-500 ease-in-out scroll-smooth">
      {/* Sticky Header with optimized blur */}
      <div className="sticky top-0 z-50 bg-[#FAF5F0]/70 backdrop-blur-2xl px-6 py-6 flex justify-between items-center border-b border-white/20">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 transition-all"
        >
          <FaChevronLeft />
        </motion.button>
        <div className="text-center">
           <h1 className="text-xl font-black text-gray-900 tracking-tight">Booking</h1>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-60">Pet Care</p>
        </div>
        <div className="w-11" />
      </div>

      <div className="px-6 mb-8 mt-4">
        <div className="bg-white/40 backdrop-blur-lg p-1.5 rounded-[30px] flex gap-1 border border-white/40 shadow-sm">
           <button 
             onClick={() => navigate('/book?type=Veterinary')}
             className={`flex-1 h-12 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
               categoryFilter === 'Veterinary' ? 'bg-gray-900 text-white shadow-xl scale-[1.02]' : 'text-gray-400 hover:bg-white/60'
             }`}
           >
             <FaUserMd className="inline-block mr-2 text-sm" />
             Vet
           </button>
           <button 
             onClick={() => navigate('/book')}
             className={`flex-1 h-12 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
               !categoryFilter ? 'bg-gray-900 text-white shadow-xl scale-[1.02]' : 'text-gray-400 hover:bg-white/60'
             }`}
           >
             <FaTools className="inline-block mr-2 text-sm" />
             Others
           </button>
        </div>
      </div>

      <div className="px-6 space-y-8 max-w-lg mx-auto">
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-80">
               {isLoading ? 'Looking...' : `${services.length} Services`}
             </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {services.length > 0 ? services.map((svc, idx) => (
                <motion.div
                  key={svc._id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25, delay: idx * 0.05 }}
                  onClick={() => setBookingData({ ...bookingData, serviceId: svc })}
                  className={`bg-white p-6 rounded-[40px] border-2 transition-all duration-500 relative overflow-hidden group cursor-pointer ${
                    bookingData.serviceId?._id === svc._id 
                    ? 'border-gray-900 shadow-[0_25px_50px_rgba(0,0,0,0.08)]' 
                    : 'border-transparent shadow-[0_10px_40px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl transition-all duration-500 ${
                      bookingData.serviceId?._id === svc._id ? 'bg-gray-900 text-white rotate-[5deg]' : 'bg-[#FAF5F0] text-[#FF9F43]'
                    }`}>
                        {getIconForCategory(svc.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-gray-900 text-lg truncate pr-2">{svc.name}</h4>
                          <span className="font-black text-gray-900 text-xl tracking-tighter">₹{svc.price}</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Care: {svc.provider?.name || 'Platform'}</p>
                        <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed opacity-80">{svc.description}</p>
                    </div>
                  </div>
                  
                  {bookingData.serviceId?._id === svc._id && (
                    <motion.div 
                      layoutId="selection-paw"
                      className="absolute top-6 right-6 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-[10px] shadow-xl"
                    >
                        <FaPaw className="animate-pulse" />
                    </motion.div>
                  )}
                </motion.div>
              )) : !isLoading && (
                <div className="py-20 text-center opacity-40">
                  <FaSearch className="mx-auto text-4xl mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nothing found</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <AnimatePresence>
          {bookingData.serviceId && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-[50px] p-8 shadow-[0_-25px_80px_rgba(0,0,0,0.06)] border border-gray-50 space-y-8 will-change-transform"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Checkout</h3>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Secure</div>
              </div>

              <div className="space-y-6">
                {/* Optimized Dropdown */}
                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">My Pet</label>
                  <button
                    type="button"
                    onClick={() => setPetDropdownOpen(!isPetDropdownOpen)}
                    className={`w-full h-[72px] bg-gray-50 border-2 rounded-[28px] px-6 flex items-center justify-between transition-all duration-300 outline-none ${
                      isPetDropdownOpen ? 'border-gray-900 bg-white ring-4 ring-gray-900/5' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {selectedPet ? (
                        <>
                          <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                             {selectedPet.image ? (
                               <img 
                                src={selectedPet.image.startsWith('http') ? selectedPet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedPet.image}`} 
                                className="w-full h-full object-cover" 
                               />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[#FF9F43] text-lg">
                                  <FaPaw />
                               </div>
                             )}
                          </div>
                          <div>
                            <span className="block text-sm font-black text-gray-900 leading-none">{selectedPet.name}</span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 block">{selectedPet.species}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-gray-300">Choose your pet</span>
                      )}
                    </div>
                    <FaChevronDown className={`text-gray-300 transition-transform duration-500 ${isPetDropdownOpen ? 'rotate-180 text-gray-900' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isPetDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 5 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute left-0 right-0 top-full z-[100] bg-white rounded-[35px] shadow-[0_30px_70px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden p-2 backdrop-blur-xl"
                      >
                         <div className="max-h-[250px] overflow-y-auto no-scrollbar py-1">
                            {pets.length > 0 ? pets.map((pet) => (
                              <button
                                key={pet._id}
                                type="button"
                                onClick={() => {
                                  setBookingData({ ...bookingData, petId: pet._id });
                                  setPetDropdownOpen(false);
                                }}
                                className={`w-full h-[80px] flex items-center justify-between px-5 rounded-[26px] transition-all duration-300 mb-2 ${
                                  bookingData.petId === pet._id ? 'bg-gray-900 text-white shadow-xl scale-[0.98]' : 'hover:bg-gray-50'
                                }`}
                              >
                                  <div className="flex items-center gap-4 text-left">
                                    <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-white/20 shadow-sm">
                                      <img src={pet.image ? (pet.image.startsWith('http') ? pet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${pet.image}`) : '/placeholder-pet.png'} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <p className={`text-sm font-black leading-none ${bookingData.petId === pet._id ? 'text-white' : 'text-gray-900'}`}>{pet.name}</p>
                                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${bookingData.petId === pet._id ? 'text-white/60' : 'text-gray-400'}`}>{pet.breed || pet.species}</p>
                                    </div>
                                  </div>
                                  {bookingData.petId === pet._id && <FaCheck className="text-white text-xs" />}
                              </button>
                            )) : (
                              <div className="p-8 text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No pets added</p>
                                <button onClick={() => navigate('/dashboard?addPet=true')} className="text-[10px] font-black text-[#FF9F43] uppercase tracking-widest mt-4 underline underline-offset-4">Add Pet</button>
                              </div>
                            )}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Optimized DateTime Trigger */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">When?</label>
                  <button
                    type="button"
                    onClick={() => setDateTimeModalOpen(true)}
                    className="w-full h-[72px] bg-gray-50 border-2 border-transparent rounded-[28px] px-6 flex items-center justify-between transition-all duration-300 hover:bg-white hover:border-gray-900 group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-50 group-hover:bg-gray-900 group-hover:text-white transition-all">
                          <FaCalendarAlt />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-black text-gray-900">
                             {bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Pick a Date'}
                             {bookingData.time && ` @ ${bookingData.time}`}
                          </p>
                          {!bookingData.date && <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60">Pick a time</p>}
                       </div>
                    </div>
                    <FaChevronRight className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>

              {/* Enhanced Summary & CTA */}
              <div className="pt-8 border-t border-gray-100">
                 <div className="flex justify-between items-center mb-8 px-2">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Total</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Pay later</p>
                    </div>
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{bookingData.serviceId.price}</span>
                 </div>
                 
                 <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCreateBooking}
                  disabled={!bookingData.petId || !bookingData.date || !bookingData.time || isSubmitting}
                  className="w-full btn-premium bg-gray-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative group"
                 >
                   <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.div 
                          key="loader"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" 
                        />
                      ) : (
                        <motion.div 
                          key="content"
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                          className="flex items-center gap-4"
                        >
                          <FaPaperPlane className="group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                          <span>Book Now</span>
                        </motion.div>
                      )}
                   </AnimatePresence>
                 </motion.button>
                 <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-widest mt-6">You'll hear from us soon</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Optimized Slot Modal */}
      <Modal isOpen={isDateTimeModalOpen} onClose={() => setDateTimeModalOpen(false)} title="Select Time">
         <div className="space-y-8 py-6">
            <div className="space-y-5">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-gray-200" /> Choose Date
               </h4>
               <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                  {dates.map((date, i) => {
                    const isSelected = bookingData.date === date.toISOString().split('T')[0];
                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setBookingData({ ...bookingData, date: date.toISOString().split('T')[0] })}
                        className={`min-w-[85px] h-24 rounded-[32px] flex flex-col items-center justify-center transition-all duration-500 snap-center ${
                          isSelected ? 'bg-gray-900 text-white shadow-2xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-white hover:shadow-lg'
                        }`}
                      >
                         <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                         </span>
                         <span className="text-2xl font-black tracking-tighter">{date.getDate()}</span>
                      </motion.button>
                    );
                  })}
               </div>
            </div>

            <div className="space-y-5">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-gray-200" /> Choose Time
               </h4>
               <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((time, i) => {
                    const isSelected = bookingData.time === time;
                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBookingData({ ...bookingData, time })}
                        className={`h-[60px] rounded-[22px] flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                          isSelected ? 'bg-gray-900 text-white shadow-xl' : 'bg-gray-50 text-gray-900 hover:bg-white'
                        }`}
                      >
                         {time}
                      </motion.button>
                    );
                  })}
               </div>
            </div>

            <button
               onClick={() => setDateTimeModalOpen(false)}
               className="w-full btn-premium bg-gray-900 text-white shadow-2xl mt-6"
               disabled={!bookingData.date || !bookingData.time}
            >
               Confirm Selection
            </button>
         </div>
      </Modal>

      {/* Styled Review Modal */}
      <Modal isOpen={isReviewsModalOpen} onClose={() => setReviewsModalOpen(false)} title="Vet Feedback">
        <div className="space-y-6 py-4">
          {loadingReviews ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedServiceReviews.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
              {selectedServiceReviews.map(review => (
                <div key={review._id} className="bg-white p-6 rounded-[35px] border border-gray-50 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black">
                        {review.user?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-[11px]">{review.user?.name || 'Customer'}</p>
                        <div className="flex text-amber-400 text-[8px] mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-gray-300 uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 italic leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center opacity-30">
              <FaStar className="mx-auto text-4xl mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">No reviews yet</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Booking;
