import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllServices } from '../redux/slices/serviceSlice';
import { getPets } from '../redux/slices/petSlice';
import axios from 'axios';
import { FaCalendarPlus, FaUserMd, FaCut, FaWalking, FaStoreAlt, FaCreditCard, FaInfoCircle, FaStar, FaChevronLeft, FaSearch, FaHistory, FaPaw, FaStethoscope, FaTools, FaChevronDown, FaCheck, FaCalendarAlt, FaClock, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!bookingData.serviceId) return alert('Please select a service');

    try {
      const token = user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        petId: bookingData.petId,
        providerId: bookingData.serviceId.provider._id,
        serviceType: bookingData.serviceId.category,
        date: `${bookingData.date}T${bookingData.time}`,
        amount: bookingData.serviceId.price,
        notes: bookingData.notes
      };

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/bookings`, payload, config);
      const { booking, order, razorpayKeyId } = data;

      const options = {
        key: razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "PetCare Premium",
        description: `Booking for ${booking.serviceType}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await axios.post(`${import.meta.env.VITE_API_URL}/bookings/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, config);
          } catch (err) {
            console.warn('Verify warning:', err?.response?.data?.message || err.message);
          }
          alert('Booking Successful! 🎉');
          navigate('/dashboard');
        },
        theme: { color: "#FF9F43" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert(error.response?.data?.message || 'Payment Failed');
    }
  };

  const handleDevBooking = async () => {
    if (!bookingData.serviceId || !bookingData.petId || !bookingData.date || !bookingData.time) {
      return alert('Please select a service, pet, date and time first');
    }
    try {
      const token = user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        petId: bookingData.petId,
        providerId: bookingData.serviceId.provider._id,
        serviceType: bookingData.serviceId.category,
        date: `${bookingData.date}T${bookingData.time}`,
        amount: bookingData.serviceId.price,
        notes: bookingData.notes
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/bookings`, payload, config);
      alert('Booking Created Successfully! (Dev Mode) 🎉');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking Failed');
    }
  };

  const getIconForCategory = (category) => {
    switch (category) {
      case 'Veterinary': return <FaStethoscope />;
      case 'Grooming': return <FaTools />;
      case 'Walking': return <FaWalking />;
      default: return <FaPaw />;
    }
  };

  const handleViewReviews = async (e, serviceId) => {
    e.stopPropagation();
    setLoadingReviews(true);
    setReviewsModalOpen(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/service/${serviceId}`);
      setSelectedServiceReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const selectedPet = pets.find(p => p._id === bookingData.petId);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-32">
      <div className="sticky top-0 z-50 bg-[#FAF5F0]/80 backdrop-blur-xl px-6 py-6 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-sm border border-gray-100 active:scale-95 transition"
        >
          <FaChevronLeft />
        </button>
        <div className="text-center">
           <h1 className="text-xl font-black text-gray-900 tracking-tight">Services</h1>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Pet Care</p>
        </div>
        <div className="w-11" />
      </div>

      <div className="px-6 mb-8">
        <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[28px] flex gap-1 border border-white/50">
           <button 
             onClick={() => navigate('/book?type=Veterinary')}
             className={`flex-1 h-12 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${
               categoryFilter === 'Veterinary' ? 'bg-[#FF9F43] text-white shadow-lg' : 'text-gray-400 hover:bg-white'
             }`}
           >
             <FaUserMd className="inline-block mr-2 text-sm" />
             Veterinary
           </button>
           <button 
             onClick={() => navigate('/book')}
             className={`flex-1 h-12 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${
               !categoryFilter ? 'bg-[#FF9F43] text-white shadow-lg' : 'text-gray-400 hover:bg-white'
             }`}
           >
             <FaTools className="inline-block mr-2 text-sm" />
             Other Services
           </button>
        </div>
      </div>

      <div className="px-6 space-y-8">
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
               {isLoading ? 'Searching...' : `${services.length} Services Available`}
             </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {services.length > 0 ? services.map((svc, idx) => (
              <motion.div
                key={svc._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setBookingData({ ...bookingData, serviceId: svc })}
                className={`bg-white p-5 rounded-[35px] border-2 transition-all relative overflow-hidden group cursor-pointer ${
                  bookingData.serviceId?._id === svc._id 
                  ? 'border-[#FF9F43] shadow-[0_15px_40px_rgba(255,159,67,0.1)]' 
                  : 'border-gray-50 shadow-[0_10px_30px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className="flex items-start gap-4">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-colors ${
                     bookingData.serviceId?._id === svc._id ? 'bg-[#FF9F43] text-white' : 'bg-[#FAF5F0] text-[#FF9F43]'
                   }`}>
                      {getIconForCategory(svc.category)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-gray-900 text-base truncate">{svc.name}</h4>
                        <span className="font-black text-[#FF9F43] text-lg">₹{svc.price}</span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">By {svc.provider.name}</p>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{svc.description}</p>
                   </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                   <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                      <FaStar className="text-amber-400 text-[10px]" />
                      <span className="text-[10px] font-black text-gray-400">4.9 (24 Reviews)</span>
                   </div>
                   <button 
                    onClick={(e) => handleViewReviews(e, svc._id)}
                    className="text-[10px] font-black text-[#FF9F43] uppercase tracking-widest hover:underline"
                   >
                     View Details
                   </button>
                </div>

                {bookingData.serviceId?._id === svc._id && (
                  <motion.div 
                    layoutId="selection-check"
                    className="absolute top-4 right-4 w-6 h-6 bg-[#FF9F43] rounded-full flex items-center justify-center text-white text-[10px] shadow-lg"
                  >
                     <FaPaw />
                  </motion.div>
                )}
              </motion.div>
            )) : !isLoading && (
              <div className="py-16 text-center">
                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-100">
                    <FaSearch className="text-gray-200 text-3xl" />
                 </div>
                 <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No services found</p>
              </div>
            )}
          </div>
        </section>

        <AnimatePresence>
          {bookingData.serviceId && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-[45px] p-8 shadow-[0_-20px_60px_rgba(0,0,0,0.05)] border border-gray-50 space-y-6"
            >
              <h3 className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                 <FaCalendarPlus className="text-[#FF9F43]" /> Finish Booking
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5 relative" ref={dropdownRef}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Your Pet</label>
                  <button
                    type="button"
                    onClick={() => setPetDropdownOpen(!isPetDropdownOpen)}
                    className={`w-full h-16 bg-gray-50 border-2 rounded-[22px] px-6 flex items-center justify-between transition-all outline-none ${
                      isPetDropdownOpen ? 'border-[#FF9F43] bg-white' : 'border-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selectedPet ? (
                        <>
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                             {selectedPet.image ? (
                               <img 
                                src={selectedPet.image.startsWith('http') ? selectedPet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedPet.image}`} 
                                className="w-full h-full object-cover" 
                               />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[#FF9F43] text-xs">
                                  <FaPaw />
                               </div>
                             )}
                          </div>
                          <span className="text-sm font-bold text-gray-900">{selectedPet.name}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-lg">
                             {selectedPet.species}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-gray-400 italic">Choose a pet...</span>
                      )}
                    </div>
                    <FaChevronDown className={`text-gray-300 transition-transform duration-300 ${isPetDropdownOpen ? 'rotate-180 text-[#FF9F43]' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isPetDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute left-0 right-0 top-full z-[100] bg-white rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 overflow-hidden p-2"
                      >
                         {pets.length > 0 ? pets.map((pet) => (
                           <button
                             key={pet._id}
                             type="button"
                             onClick={() => {
                               setBookingData({ ...bookingData, petId: pet._id });
                               setPetDropdownOpen(false);
                             }}
                             className={`w-full flex items-center justify-between p-4 rounded-[22px] transition-colors ${
                               bookingData.petId === pet._id ? 'bg-[#FF9F43]/5' : 'hover:bg-gray-50'
                             }`}
                           >
                              <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                   {pet.image ? (
                                     <img 
                                      src={pet.image.startsWith('http') ? pet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${pet.image}`} 
                                      className="w-full h-full object-cover" 
                                     />
                                   ) : (
                                     <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#FF9F43]">
                                        <FaPaw />
                                     </div>
                                   )}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-gray-900 leading-none">{pet.name}</p>
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{pet.breed || pet.species}</p>
                                </div>
                              </div>
                              {bookingData.petId === pet._id && (
                                <FaCheck className="text-[#FF9F43] text-xs" />
                              )}
                           </button>
                         )) : (
                           <div className="p-6 text-center">
                              <p className="text-xs font-bold text-gray-400">No pets found</p>
                              <button onClick={() => navigate('/dashboard')} className="text-[10px] font-black text-[#FF9F43] uppercase tracking-widest mt-2">Add your first pet</button>
                           </div>
                         )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Schedule Appointment</label>
                  <button
                    type="button"
                    onClick={() => setDateTimeModalOpen(true)}
                    className="w-full h-16 bg-gray-50 border-2 border-gray-50 rounded-[22px] px-6 flex items-center justify-between transition-all hover:bg-white hover:border-[#FF9F43] group"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#FF9F43] shadow-sm">
                          <FaCalendarAlt />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-bold text-gray-900">
                             {bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                             {bookingData.time && ` at ${bookingData.time}`}
                          </p>
                          {!bookingData.date && <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Choose your preferred slot</p>}
                       </div>
                    </div>
                    <FaChevronRight className="text-gray-300 group-hover:text-[#FF9F43] group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50">
                 <div className="flex justify-between items-center mb-6 px-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total to Pay</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{bookingData.serviceId.price}</span>
                 </div>
                 
                 <div className="flex gap-3 items-center">
                   <button
                    onClick={handlePayment}
                    className="flex-[2] h-20 bg-[#FF9F43] rounded-[25px] text-white text-sm font-black uppercase tracking-widest shadow-[0_15px_35px_rgba(255,159,67,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    disabled={!bookingData.petId || !bookingData.date || !bookingData.time}
                   >
                     <FaCreditCard />
                     <span>Pay & Book</span>
                   </button>
                   
                   <button
                    onClick={handleDevBooking}
                    className="flex-1 h-20 bg-gray-50 rounded-[25px] text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] hover:text-[#FF9F43] hover:bg-white hover:border-2 hover:border-[#FF9F43] transition-all flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                    disabled={!bookingData.petId || !bookingData.date || !bookingData.time}
                   >
                     <FaTools className="opacity-40" />
                     <span>Skip</span>
                   </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal isOpen={isDateTimeModalOpen} onClose={() => setDateTimeModalOpen(false)} title="Select Slot">
         <div className="space-y-8 py-4">
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaCalendarAlt className="text-[#FF9F43]" /> Select Date
               </h4>
               <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                  {dates.map((date, i) => {
                    const isSelected = bookingData.date === date.toISOString().split('T')[0];
                    return (
                      <button
                        key={i}
                        onClick={() => setBookingData({ ...bookingData, date: date.toISOString().split('T')[0] })}
                        className={`min-w-[75px] h-20 rounded-[25px] flex flex-col items-center justify-center transition-all ${
                          isSelected ? 'bg-[#FF9F43] text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                         </span>
                         <span className="text-lg font-black">{date.getDate()}</span>
                      </button>
                    );
                  })}
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaClock className="text-[#FF9F43]" /> Available Times
               </h4>
               <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((time, i) => {
                    const isSelected = bookingData.time === time;
                    return (
                      <button
                        key={i}
                        onClick={() => setBookingData({ ...bookingData, time })}
                        className={`h-12 rounded-[18px] flex items-center justify-center text-xs font-black transition-all ${
                          isSelected ? 'bg-[#FF9F43] text-white shadow-md' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                         {time}
                      </button>
                    );
                  })}
               </div>
            </div>

            <button
               onClick={() => setDateTimeModalOpen(false)}
               className="w-full h-16 bg-gray-900 rounded-[25px] text-white text-sm font-black uppercase tracking-widest shadow-lg active:scale-95 transition mt-4"
               disabled={!bookingData.date || !bookingData.time}
            >
               Confirm Slot
            </button>
         </div>
      </Modal>

      <Modal isOpen={isReviewsModalOpen} onClose={() => setReviewsModalOpen(false)} title="Service Feedback">
        <div className="space-y-4">
          {loadingReviews ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-[#FF9F43] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedServiceReviews.length > 0 ? (
            selectedServiceReviews.map(review => (
              <div key={review._id} className="bg-gray-50 p-5 rounded-[30px] border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-black text-gray-900 text-sm">{review.user?.name || 'Customer'}</p>
                    <div className="flex text-amber-400 text-xs mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-400 italic leading-relaxed">"{review.comment}"</p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <FaStar className="mx-auto text-3xl text-gray-100 mb-3" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No reviews yet</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Booking;
