import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { getPets, addPet } from '../redux/slices/petSlice';
import { getMyBookings, getProviderBookings, updateBookingStatus } from '../redux/slices/bookingSlice';
import { getProviderServices, createService, updateService, deleteService } from '../redux/slices/serviceSlice';
import { getNotifications, markAllRead, markSingleRead } from '../redux/slices/notificationSlice';
import axios from 'axios';
import { FaPlus, FaDog, FaStethoscope, FaCalendarAlt, FaCat, FaPaw, FaLock, FaStar, FaHistory, FaTools, FaCheck, FaTimes, FaClipboardList, FaUpload, FaSearch, FaBell, FaChevronRight, FaUserAlt, FaMapMarkerAlt, FaClock, FaFilter } from 'react-icons/fa';
import Modal from '../components/Modal';
import AdminDashboard from '../components/AdminDashboard';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ staffView }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const { pets } = useSelector((state) => state.pets);
  const { bookings } = useSelector((state) => state.bookings);
  const { myServices } = useSelector((state) => state.services);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const [isPetModalOpen, setPetModalOpen] = useState(false);
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [isServiceDetailOpen, setServiceDetailOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isEditingService, setIsEditingService] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [petPage, setPetPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const slides = useMemo(() => [
    {
      title: "Expert Veterinary Care",
      desc: "Connect with certified professionals in seconds.",
      badge: "Verified Clinics",
      img: "/images/slides/slide1.png",
      color: "from-blue-500 to-indigo-600",
      link: "/book?type=Veterinary"
    },
    {
      title: "Luxury Pet Grooming",
      desc: "Give your furry friend a premium spa day.",
      badge: "Special 20% Off",
      img: "/images/slides/slide2.png",
      color: "from-pink-500 to-rose-600",
      link: "/book?type=Grooming"
    },
    {
      title: "Active Pet Walking",
      desc: "Healthy walks for happy hearts.",
      badge: "Top Walkers",
      img: "/images/slides/slide3.png",
      color: "from-orange-400 to-orange-600",
      link: "/book?type=Walking"
    },
    {
      title: "Premium Boarding",
      desc: "A home away from home for your pet.",
      badge: "5-Star Suites",
      img: "/images/slides/slide4.png",
      color: "from-emerald-400 to-teal-600",
      link: "/book?type=Boarding"
    }
  ], []);

  const [petForm, setPetForm] = useState({
    name: '', species: 'Dog', breed: '', age: '', gender: 'Male', image: ''
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: user?.role === 'Veterinarian' ? 'Veterinary' : 'Grooming',
    description: '',
    price: '',
    duration: '30',
    image: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (user) {
      if (user.role === 'Pet Owner') {
        dispatch(getPets());
        dispatch(getMyBookings());
      } else if (user.role === 'Veterinarian' || user.role === 'Service Provider') {
        dispatch(getProviderServices());
        dispatch(getProviderBookings());
      }
      dispatch(getNotifications());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (searchParams.get('addPet') === 'true') {
      setPetModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('addPet');
      setSearchParams(newParams, { replace: true });
    }
    if (searchParams.get('addService') === 'true') {
      setIsEditingService(false);
      setServiceModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('addService');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  if (!user) return <Navigate to="/login" />;

  const uploadImageHandler = useCallback(async (e, setFormCallback) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setIsUploading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, config);
      setFormCallback((prev) => ({ ...prev, image: data.imageUrl }));
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      alert('Upload failed');
    }
  }, [user.token]);

  const handleAddPet = (e) => {
    e.preventDefault();
    dispatch(addPet(petForm));
    setPetModalOpen(false);
    setPetForm({ name: '', species: 'Dog', breed: '', age: '', gender: 'Male', image: '' });
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (isEditingService && selectedService) {
      dispatch(updateService({ id: selectedService._id, serviceData: serviceForm }));
    } else {
      dispatch(createService(serviceForm));
    }
    setServiceModalOpen(false);
    setIsEditingService(false);
    setSelectedService(null);
    setServiceForm({ ...serviceForm, name: '', description: '', price: '', duration: '30', image: '' });
  };

  const handleStatusUpdate = useCallback((id, status) => {
    dispatch(updateBookingStatus({ id, status }));
  }, [dispatch]);

  const filteredPets = useMemo(() => pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [pets, searchTerm]);

  const Pagination = ({ items, currentPage, setPage }) => {
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-4 mt-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={currentPage === 1}
          onClick={() => setPage(p => p - 1)}
          className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 disabled:opacity-30 shadow-sm transition-all"
        >
          <FaChevronRight className="rotate-180" />
        </motion.button>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={currentPage === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 disabled:opacity-30 shadow-sm transition-all"
        >
          <FaChevronRight />
        </motion.button>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!user.isApproved && user.role !== 'Admin' && user.role !== 'Pet Owner') {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="w-24 h-24 bg-white rounded-[30px] shadow-xl flex items-center justify-center mx-auto mb-8 border-4 border-[#FF9F43]/10">
            <FaLock className="text-4xl text-[#FF9F43]" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Under Review</h2>
          <p className="text-gray-400 max-w-sm mx-auto text-sm font-medium leading-relaxed">
            Your professional profile is being verified. You'll be notified once you can start accepting bookings!
          </p>
        </motion.div>
      );
    }

    if (user.role === 'Admin') return <AdminDashboard initialTab={searchParams.get('view') || 'overview'} />;

    if (user.role === 'Pet Owner') {
      return (
        <div className="flex flex-col gap-10 pb-32">
          <section className="relative px-1">
            <div className="bg-white h-16 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center px-6 gap-3 focus-within:ring-4 focus-within:ring-[#FF9F43]/5 transition-all">
              <FaSearch className="text-gray-300" />
              <input
                type="text"
                placeholder="Search your pets or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-gray-900 placeholder:text-gray-300"
              />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[45px] shadow-[0_25px_60px_rgba(0,0,0,0.08)] cursor-pointer group" onClick={() => navigate(slides[currentSlide].link)}>
            <div className="h-[220px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0.8, x: 200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0.8, x: -200 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} p-8 flex items-center justify-between overflow-hidden`}
                >
                  <div className="relative z-10 max-w-[180px]">
                    <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-3">
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">{slides[currentSlide].badge}</span>
                    </div>
                    <h3 className="text-white text-2xl font-black leading-tight tracking-tight">{slides[currentSlide].title}</h3>
                    <p className="text-white/80 text-[11px] font-medium mt-2 leading-relaxed">{slides[currentSlide].desc}</p>
                  </div>
                  <div className="absolute right-0 bottom-0 w-[240px] h-full pointer-events-none">
                    <img
                      src={slides[currentSlide].img}
                      className="w-full h-full object-cover object-center scale-110 drop-shadow-2xl transition-transform duration-700 group-hover:scale-125"
                      alt="Slide"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute bottom-6 left-8 flex gap-2 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Pet Community</h3>
              <button className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">See all</button>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6 snap-x snap-mandatory">
              <AnimatePresence mode="popLayout">
                {filteredPets.length > 0 ? filteredPets.slice((petPage - 1) * ITEMS_PER_PAGE, petPage * ITEMS_PER_PAGE).map((pet, idx) => (
                  <motion.div
                    key={pet._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(`/pet/${pet._id}`)}
                    className={`min-w-[180px] snap-center rounded-[48px] p-6 flex flex-col items-center relative overflow-hidden cursor-pointer group shadow-sm transition-all duration-500 hover:shadow-xl will-change-transform ${idx % 3 === 0 ? 'bg-[#E5D9F2]' : idx % 3 === 1 ? 'bg-[#FDE2E4]' : 'bg-[#D1E9CF]'
                      }`}
                  >
                    <div className="absolute top-6 left-6">
                      <span className="text-[9px] font-black text-gray-500 tracking-tight leading-none uppercase opacity-40">Companion</span>
                      <p className="text-[11px] font-black text-gray-900 leading-none mt-1">{pet.name.split(' ')[0]}</p>
                    </div>
                    <div className="w-32 h-32 mt-10 bg-white rounded-[40px] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-all duration-700 relative">
                      {pet.image ? (
                        <img
                          src={pet.image.startsWith('http') ? pet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${pet.image}`}
                          className="w-full h-full object-cover"
                          alt={pet.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-50 text-gray-200">
                          {pet.species === 'Dog' ? <FaDog /> : <FaCat />}
                        </div>
                      )}
                    </div>
                    <div className="mt-6 text-center">
                      <h4 className="font-black text-gray-900 text-lg leading-none tracking-tight">{pet.name}</h4>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-2 opacity-50">
                        {pet.breed || pet.species}
                      </p>
                    </div>
                  </motion.div>
                )) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-[220px] rounded-[48px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 bg-gray-50/30">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#FF9F43] shadow-md">
                      <FaPlus />
                    </div>
                    <div className="text-center px-6">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{searchTerm ? 'No results found' : 'No pets registered yet'}</p>
                      {!searchTerm && <button onClick={() => setPetModalOpen(true)} className="text-[10px] font-black text-[#FF9F43] uppercase tracking-[0.2em] mt-3 hover:underline underline-offset-4">Register Now</button>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Pagination items={filteredPets} currentPage={petPage} setPage={setPetPage} />
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
              <button className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">View History</button>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {bookings.length > 0 ? bookings.slice((bookingPage - 1) * ITEMS_PER_PAGE, bookingPage * ITEMS_PER_PAGE).map((b) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={b._id}
                    className="bg-white p-6 rounded-[40px] border border-gray-50 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[22px] bg-gray-50 flex items-center justify-center text-xl text-[#FF9F43]">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-base">{b.serviceType}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60">{new Date(b.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border ${b.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        b.status === 'Accepted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        {b.status}
                      </span>
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-14 bg-white/40 rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No activity logs found</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
            <Pagination items={bookings} currentPage={bookingPage} setPage={setBookingPage} />
          </section>
        </div>
      );
    }

    if (staffView === 'bookings') {
      return (
        <div className="space-y-6 pb-24">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Booking Schedule</h2>
            <div className="flex gap-2">
              <span className="bg-emerald-50 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100 animate-pulse">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {bookings.length > 0 ? bookings.slice((bookingPage - 1) * ITEMS_PER_PAGE, bookingPage * ITEMS_PER_PAGE).map((b) => (
                <motion.div
                  key={b._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-[40px] border border-gray-50 shadow-sm relative overflow-hidden group will-change-transform"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-5">
                      <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center text-2xl text-[#FF9F43] overflow-hidden border border-gray-100 shadow-inner">
                        {b.pet?.image ? <img src={b.pet.image.startsWith('http') ? b.pet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${b.pet.image}`} className="w-full h-full object-cover" loading="lazy" /> : <FaPaw />}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-lg">{b.serviceType}</h4>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60">Pet: {b.pet?.name} ({b.pet?.species})</p>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                            <FaCalendarAlt className="text-[#FF9F43] opacity-60" /> {new Date(b.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                            <FaClock className="text-[#FF9F43] opacity-60" /> {new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border ${b.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        b.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          b.status === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {b.status === 'Pending' && (
                    <div className="flex gap-3 mt-8">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleStatusUpdate(b._id, 'Accepted')} className="flex-[2] h-14 bg-gray-900 text-white rounded-[22px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 active:scale-95 transition-all">Accept</motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleStatusUpdate(b._id, 'Rejected')} className="flex-1 h-14 bg-gray-50 text-gray-400 rounded-[22px] font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Decline</motion.button>
                    </div>
                  )}

                  {b.status === 'Accepted' && (
                    <div className="mt-8">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusUpdate(b._id, 'Completed')}
                        className="w-full h-14 bg-emerald-500 text-white rounded-[22px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                      >
                        <FaCheck />
                        <span>Complete Service</span>
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )) : (
                <div className="py-24 text-center bg-white/40 rounded-[48px] border-2 border-dashed border-gray-100">
                  <FaCalendarAlt className="text-gray-100 text-6xl mx-auto mb-6" />
                  <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">Your schedule is currently clear</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          <Pagination items={bookings} currentPage={bookingPage} setPage={setBookingPage} />
        </div>
      );
    }

    if (staffView === 'services') {
      return (
        <div className="space-y-6 pb-24">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Service Catalog</h2>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setIsEditingService(false); setServiceModalOpen(true); }} className="w-12 h-12 rounded-[18px] bg-gray-900 text-white flex items-center justify-center shadow-xl active:scale-95 transition-all">
              <FaPlus />
            </motion.button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {myServices.length > 0 ? myServices.slice((servicePage - 1) * ITEMS_PER_PAGE, servicePage * ITEMS_PER_PAGE).map((svc) => (
                <motion.button
                  key={svc._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedService(svc);
                    setServiceDetailOpen(true);
                  }}
                  className="bg-white p-6 rounded-[40px] border border-gray-50 shadow-sm flex items-center gap-5 group relative overflow-hidden transition-all duration-300 text-left w-full hover:shadow-lg will-change-transform"
                >
                  <div className="w-18 h-18 rounded-[24px] bg-gray-50 flex items-center justify-center text-3xl text-[#FF9F43] overflow-hidden border border-gray-100 shadow-inner">
                    {svc.image ? <img src={svc.image.startsWith('http') ? svc.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${svc.image}`} className="w-full h-full object-cover" loading="lazy" /> : <FaClipboardList />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-gray-900 text-lg truncate pr-8 tracking-tight">{svc.name}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-black text-gray-900">₹{svc.price}</span>
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">{svc.duration} Mins</span>
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-200 group-hover:text-gray-900 transition-colors" />
                </motion.button>
              )) : (
                <div className="py-24 text-center bg-white/40 rounded-[48px] border-2 border-dashed border-gray-100">
                  <FaClipboardList className="text-gray-100 text-6xl mx-auto mb-6" />
                  <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Your catalog is empty</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          <Pagination items={myServices} currentPage={servicePage} setPage={setServicePage} />
        </div>
      );
    }

    return (
      <div className="space-y-10 pb-24">
        <section className="grid grid-cols-2 gap-4">
          <motion.div whileHover={{ y: -5 }} className="bg-gray-900 p-8 rounded-[45px] relative overflow-hidden group shadow-2xl shadow-black/20">
            <div className="relative z-10">
              <span className="text-white/40 font-black text-[9px] uppercase tracking-[0.3em]">Operational</span>
              <h3 className="text-white text-4xl font-black mt-3 tracking-tighter">{bookings.filter(b => b.status === 'Accepted').length}</h3>
              <p className="text-[#FF9F43] text-[10px] font-black mt-3 uppercase tracking-widest">Active Jobs</p>
            </div>
            <FaCalendarAlt className="absolute right-[-15%] bottom-[-15%] text-[100px] text-white opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[45px] border border-gray-100 shadow-sm group">
            <span className="text-gray-400 font-black text-[9px] uppercase tracking-[0.3em]">Revenue Stream</span>
            <h3 className="text-gray-900 text-4xl font-black mt-3 tracking-tighter">{myServices.length}</h3>
            <p className="text-[#FF9F43] text-[10px] font-black mt-3 uppercase tracking-widest">Active Services</p>
          </motion.div>
        </section>

        <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber-50 p-7 rounded-[40px] border border-amber-100 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-[22px] flex items-center justify-center text-amber-500 shadow-md">
              <FaHistory className="animate-pulse" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-base tracking-tight">Action Center</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{bookings.filter(b => b.status === 'Pending').length} pending approvals</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('?view=bookings')}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm active:shadow-none transition-all"
          >
            <FaChevronRight size={12} />
          </motion.button>
        </motion.section>

        <section className="bg-white/40 border-2 border-dashed border-gray-200 p-10 rounded-[50px] text-center backdrop-blur-sm">
          <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-50">
            <FaStethoscope className="text-gray-900 text-3xl" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter">System Synchronized</h3>
          <p className="text-xs font-medium text-gray-400 mt-3 px-4 leading-relaxed opacity-70">
            Welcome back, {user.name.split(' ')[0]}. Your terminal is optimized and ready for professional management.
          </p>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-10 transition-all duration-700 ease-in-out selection:bg-[#FF9F43]/30">
      <div className="sticky top-0 z-50 bg-[#FAF5F0]/70 backdrop-blur-2xl px-6 py-6 flex justify-between items-center border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <motion.div whileHover={{ rotate: 10 }} className="w-11 h-11 bg-gray-900 rounded-[16px] flex items-center justify-center overflow-hidden shadow-2xl shadow-black/20 border border-white/10">
              <img src="/logo.png" className="w-full h-full object-cover scale-110" alt="Payven" />
            </motion.div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Payven</h1>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setNotificationOpen(true)}
            className="w-12 h-12 rounded-[18px] bg-white shadow-sm border border-gray-50 flex items-center justify-center text-gray-400 relative active:shadow-inner transition-all"
          >
            <FaBell size={18} />
            {unreadCount > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF9F43] rounded-full border-4 border-[#FAF5F0] flex items-center justify-center shadow-lg">
                <span className="text-[9px] font-black text-white">{unreadCount}</span>
              </motion.div>
            )}
          </motion.button>
          <motion.div whileTap={{ scale: 0.9 }} onClick={() => navigate('/profile')} className="w-12 h-12 rounded-[18px] bg-white shadow-sm border border-gray-50 flex items-center justify-center overflow-hidden cursor-pointer shadow-lg hover:ring-4 hover:ring-gray-900/5 transition-all">
            {user.image ? <img src={user.image} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center bg-gray-50"><FaUserAlt className="text-gray-300" /></div>}
          </motion.div>
        </div>
      </div>

      <div className="px-6 mt-6 max-w-lg mx-auto">
        {renderDashboard()}
      </div>

      <Modal
        isOpen={isNotificationOpen}
        onClose={() => setNotificationOpen(false)}
        title="Intelligence Hub"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 no-scrollbar">
            <AnimatePresence mode="popLayout">
              {notifications.length > 0 ? notifications.map((notif, idx) => (
                <motion.div
                  key={notif._id}
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => {
                    if (!notif.isRead) dispatch(markSingleRead(notif._id));
                  }}
                  className={`p-5 rounded-[32px] border transition-all duration-500 cursor-pointer ${notif.isRead ? 'bg-gray-50/50 border-transparent opacity-40' : 'bg-white border-gray-100 shadow-xl shadow-black/5'}`}
                >
                  <div className="flex gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg ${notif.type === 'BookingNew' ? 'bg-amber-50 text-amber-500' : 'bg-gray-900 text-white'
                      }`}>
                      <FaBell />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-[15px] font-black text-gray-900 tracking-tight">{notif.title}</h5>
                      <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed mt-3">{notif.message}</p>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="py-20 text-center opacity-20">
                  <FaBell className="text-6xl mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Silence in the hub</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          {notifications.length > 0 && (
            <button onClick={handleMarkAllRead} className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Clear All Intelligence</button>
          )}
        </div>
      </Modal>

      {/* Optimized Modals (implicitly improved by index.css and Framer Motion) */}
      <Modal isOpen={isPetModalOpen} onClose={() => setPetModalOpen(false)} title="New Companion" noScroll={true}>
        <form onSubmit={handleAddPet} className="space-y-6 py-4">
           {/* Form content remains but with smoother feel from index.css */}
          <div className="space-y-5">
            <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity</label><input required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-[22px] px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-gray-900 outline-none transition-all" value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} placeholder="Buddy" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Species</label><select className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-[22px] px-5 text-sm font-bold text-gray-900 focus:bg-white focus:border-gray-900 outline-none transition-all appearance-none" value={petForm.species} onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}><option value="Dog">Dog</option><option value="Cat">Cat</option><option value="Bird">Bird</option><option value="Rabbit">Rabbit</option></select></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Age (Years)</label><input type="number" className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-[22px] px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-gray-900 outline-none transition-all" value={petForm.age} onChange={(e) => setPetForm({ ...petForm, age: e.target.value })} placeholder="2" /></div>
            </div>
            <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Profile</label><input type="file" onChange={(e) => uploadImageHandler(e, setPetForm)} className="hidden" id="pet-photo-upload" /><label htmlFor="pet-photo-upload" className="w-full flex flex-col items-center justify-center gap-3 h-32 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[35px] cursor-pointer hover:bg-white hover:border-gray-900 transition-all overflow-hidden relative group">{petForm.image && <img src={petForm.image.startsWith('http') ? petForm.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${petForm.image}`} className="absolute inset-0 w-full h-full object-cover opacity-60" />}<div className="relative z-10 flex flex-col items-center"><FaUpload className="text-gray-900 mb-2 group-hover:scale-110 transition-transform" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isUploading ? 'Syncing...' : 'Upload Portrait'}</span></div></label></div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full h-18 bg-gray-900 text-white rounded-[26px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all mt-4" disabled={isUploading}>Register Profile</motion.button>
        </form>
      </Modal>

      <Modal isOpen={isServiceModalOpen} onClose={() => { setServiceModalOpen(false); setIsEditingService(false); }} title={isEditingService ? 'Revise Service' : 'Elite Service Entry'}>
        <form onSubmit={handleAddService} className="space-y-6 py-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
              <input required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-[22px] px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-gray-900 outline-none transition-all" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="Executive Grooming" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Briefing</label>
              <textarea required className="w-full h-28 bg-gray-50 border-2 border-transparent rounded-[22px] px-6 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:border-gray-900 outline-none transition-all resize-none" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Elaborate on the elite care offered..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Investment (₹)</label>
                <input type="number" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-[22px] px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-gray-900 outline-none transition-all" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} placeholder="1500" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Timeframe (Min)</label>
                <input type="number" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-[22px] px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-gray-900 outline-none transition-all" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} placeholder="60" />
              </div>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full h-18 bg-gray-900 text-white rounded-[26px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all mt-4">
            {isEditingService ? 'Sync Revisions' : 'Launch Service'}
          </motion.button>
        </form>
      </Modal>

      <Modal isOpen={isServiceDetailOpen} onClose={() => setServiceDetailOpen(false)} title="Intelligence Report">
        {selectedService && (
          <div className="space-y-8 py-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-[32px] bg-gray-900 flex items-center justify-center text-4xl text-[#FF9F43] border-4 border-white shadow-2xl overflow-hidden">
                {selectedService.image ? <img src={selectedService.image.startsWith('http') ? selectedService.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedService.image}`} className="w-full h-full object-cover" /> : <FaClipboardList />}
              </div>
              <div>
                <span className="text-[10px] font-black text-[#FF9F43] uppercase tracking-[0.3em]">{selectedService.category}</span>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter mt-1">{selectedService.name}</h3>
              </div>
            </div>
            <div className="flex gap-4">
              <motion.button whileTap={{ scale: 0.95 }} onClick={openEditService} className="flex-1 h-16 bg-gray-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all">Edit Parameters</motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleDeleteService} className="w-16 h-16 bg-red-50 text-red-500 rounded-[24px] flex items-center justify-center shadow-sm border border-red-100"><FaTimes /></motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
