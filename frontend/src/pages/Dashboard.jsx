import { useEffect, useState, useRef } from 'react';
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

  const slides = [
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
  ];

  const [petForm, setPetForm] = useState({
    name: '', species: 'Dog', breed: '', age: '', gender: 'Male', weight: '', image: ''
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: user?.role === 'Veterinarian' ? 'Veterinary' : 'Grooming',
    description: '',
    price: '',
    duration: '30',
    image: ''
  });

  // Auto-scroll slider logic
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

  const uploadImageHandler = async (e, setFormCallback) => {
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
  };

  const handleAddPet = (e) => {
    e.preventDefault();
    dispatch(addPet(petForm));
    setPetModalOpen(false);
    setPetForm({ name: '', species: 'Dog', breed: '', age: '', gender: 'Male', weight: '', image: '' });
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

  const openEditService = () => {
    setServiceForm({
      name: selectedService.name,
      category: selectedService.category,
      description: selectedService.description,
      price: selectedService.price,
      duration: selectedService.duration,
      image: selectedService.image
    });
    setIsEditingService(true);
    setServiceDetailOpen(false);
    setServiceModalOpen(true);
  };

  const handleDeleteService = () => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      dispatch(deleteService(selectedService._id));
      setServiceDetailOpen(false);
      setSelectedService(null);
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  const handleStatusUpdate = (id, status) => {
    dispatch(updateBookingStatus({ id, status }));
  };

  // Filtered pets for working search
  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const Pagination = ({ items, currentPage, setPage }) => {
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-4 mt-6">
        <button 
          disabled={currentPage === 1}
          onClick={() => setPage(p => p - 1)}
          className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 disabled:opacity-30 shadow-sm active:scale-90 transition"
        >
          <FaChevronRight className="rotate-180" />
        </button>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
        <button 
          disabled={currentPage === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 disabled:opacity-30 shadow-sm active:scale-90 transition"
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!user.isApproved && user.role !== 'Admin' && user.role !== 'Pet Owner') {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="w-24 h-24 bg-white rounded-[30px] shadow-xl flex items-center justify-center mx-auto mb-8 border-4 border-[#FF9F43]/10">
            <FaLock className="text-4xl text-[#FF9F43]" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Under Review</h2>
          <p className="text-gray-400 max-w-sm mx-auto text-sm font-medium leading-relaxed">
            Your professional profile is being verified. You'll be notified once you can start accepting bookings!
          </p>
        </div>
      );
    }

    if (user.role === 'Admin') return <AdminDashboard />;

    if (user.role === 'Pet Owner') {
      return (
        <div className="flex flex-col gap-10 pb-32">
          {/* Search Bar - Working Logic */}
          <section className="relative px-1">
            <div className="bg-white h-16 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center px-6 gap-3">
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

          {/* Improved Slider with Auto-Scroll - Interactive Click */}
          <section className="relative overflow-hidden rounded-[45px] shadow-[0_25px_60px_rgba(0,0,0,0.08)] cursor-pointer" onClick={() => navigate(slides[currentSlide].link)}>
            <div className="h-[220px] relative">
              <AnimatePresence>
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0.8, x: '100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0.8, x: '-100%' }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} p-8 flex items-center justify-between overflow-hidden`}
                >
                  <div className="relative z-10 max-w-[180px]">
                    <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-3">
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">{slides[currentSlide].badge}</span>
                    </div>
                    <h3 className="text-white text-2xl font-black leading-tight tracking-tight">{slides[currentSlide].title}</h3>
                    <p className="text-white/80 text-[11px] font-medium mt-2 leading-relaxed">{slides[currentSlide].desc}</p>
                  </div>
                  <div className="absolute right-0 bottom-0 w-[240px] h-full">
                    <img
                      src={slides[currentSlide].img}
                      className="w-full h-full object-cover object-center scale-110 drop-shadow-2xl"
                      alt="Slide"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Pagination Dots - 4 Dots */}
            <div className="absolute bottom-6 left-8 flex gap-2 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          </section>


          {/* Pet Community / Your Pets - Improved Image Visibility */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Pet Community</h3>
              <button className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">See all</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6 snap-x snap-mandatory">
              {filteredPets.length > 0 ? filteredPets.slice((petPage - 1) * ITEMS_PER_PAGE, petPage * ITEMS_PER_PAGE).map((pet, idx) => (
                <motion.div
                  key={pet._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/pet/${pet._id}`)}
                  className={`min-w-[170px] snap-start rounded-[45px] p-5 flex flex-col items-center relative overflow-hidden cursor-pointer group shadow-sm transition-all ${idx % 3 === 0 ? 'bg-[#E5D9F2]' : idx % 3 === 1 ? 'bg-[#FDE2E4]' : 'bg-[#D1E9CF]'
                    }`}
                >
                  <div className="absolute top-5 left-5">
                    <span className="text-[10px] font-black text-gray-500 tracking-tight leading-none uppercase opacity-50">Pet of</span>
                    <p className="text-[12px] font-black text-gray-900 leading-none mt-0.5">{user.name.split(' ')[0]}</p>
                  </div>
                  {/* Improved Pet Image Container - FULL COVER */}
                  <div className="w-28 h-28 mt-8 bg-white rounded-[35px] flex items-center justify-center overflow-hidden border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-500 relative">
                    {pet.image ? (
                      <img
                        src={pet.image.startsWith('http') ? pet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${pet.image}`}
                        className="w-full h-full object-cover"
                        alt={pet.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-white/40 text-gray-300">
                        {pet.species === 'Dog' ? <FaDog /> : <FaCat />}
                      </div>
                    )}
                  </div>
                  <div className="mt-5 text-center">
                    <h4 className="font-black text-gray-900 text-base leading-none tracking-tight">{pet.name}</h4>
                    <div className="flex items-center justify-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 opacity-40" />
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                        {pet.breed || pet.species}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="w-full h-[200px] rounded-[45px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 bg-gray-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#FF9F43] shadow-sm">
                    <FaPlus />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{searchTerm ? 'No pets match your search' : 'No pets registered'}</p>
                    {!searchTerm && <button onClick={() => setPetModalOpen(true)} className="text-[10px] font-black text-[#FF9F43] uppercase tracking-[0.2em] mt-2 hover:underline">Add Pet Now</button>}
                  </div>
                </div>
              )}
            </div>
            <Pagination items={filteredPets} currentPage={petPage} setPage={setPetPage} />
          </section>

          {/* Recent Activity Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
              <button className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">View Log</button>
            </div>
            <div className="space-y-4">
              {bookings.length > 0 ? bookings.slice((bookingPage - 1) * ITEMS_PER_PAGE, bookingPage * ITEMS_PER_PAGE).map((b) => (
                <div
                  key={b._id}
                  className="bg-white p-6 rounded-[35px] border border-gray-50 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#FF9F43]">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-sm">{b.serviceType}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{new Date(b.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${b.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        b.status === 'Accepted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="py-10 bg-white rounded-[35px] border border-gray-50 text-center">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No recent activity</p>
                </div>
              )}
            </div>
            <Pagination items={bookings} currentPage={bookingPage} setPage={setBookingPage} />
          </section>
        </div>
      );
    }

    // Staff Views remain similar but with polished spacing
    if (staffView === 'bookings') {
      return (
        <div className="space-y-6 pb-24">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Booking Schedule</h2>
            <div className="flex gap-2">
              <span className="bg-emerald-50 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100">Live Updates</span>
            </div>
          </div>
          <div className="space-y-4">
            {bookings.length > 0 ? bookings.slice((bookingPage - 1) * ITEMS_PER_PAGE, bookingPage * ITEMS_PER_PAGE).map((b) => (
              <motion.div
                key={b._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[35px] border border-gray-50 shadow-sm relative overflow-hidden group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-xl text-[#FF9F43]">
                      {b.pet?.image ? <img src={b.pet.image.startsWith('http') ? b.pet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${b.pet.image}`} className="w-full h-full object-cover rounded-2xl" /> : <FaPaw />}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{b.serviceType}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Pet: {b.pet?.name} ({b.pet?.species})</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400">
                          <FaCalendarAlt className="text-[#FF9F43]" /> {new Date(b.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400">
                          <FaClock className="text-[#FF9F43]" /> {new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${b.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        b.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          b.status === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                      {b.status}
                    </span>
                  </div>
                </div>

                {b.status === 'Pending' && (
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => handleStatusUpdate(b._id, 'Accepted')} className="flex-1 h-12 bg-[#FF9F43] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#FF9F43]/20 active:scale-95 transition">Accept Request</button>
                    <button onClick={() => handleStatusUpdate(b._id, 'Rejected')} className="flex-1 h-12 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition active:scale-95">Decline</button>
                  </div>
                )}

                {b.status === 'Accepted' && (
                  <div className="mt-6">
                    <button
                      onClick={() => handleStatusUpdate(b._id, 'Completed')}
                      className="w-full h-12 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center justify-center gap-2"
                    >
                      <FaCheck />
                      <span>Mark as Completed</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )) : (
              <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                <FaCalendarAlt className="text-gray-100 text-5xl mx-auto mb-4" />
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Your schedule is empty</p>
              </div>
            )}
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
            <button onClick={() => { setIsEditingService(false); setServiceModalOpen(true); }} className="w-11 h-11 rounded-full bg-[#FF9F43] text-white flex items-center justify-center shadow-lg shadow-[#FF9F43]/30 active:scale-95 transition">
              <FaPlus />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {myServices.length > 0 ? myServices.slice((servicePage - 1) * ITEMS_PER_PAGE, servicePage * ITEMS_PER_PAGE).map((svc) => (
              <button
                key={svc._id}
                onClick={() => {
                  setSelectedService(svc);
                  setServiceDetailOpen(true);
                }}
                className="bg-white p-5 rounded-[35px] border border-gray-50 shadow-sm flex items-center gap-5 group relative overflow-hidden active:scale-95 transition-all text-left w-full"
              >
                <div className="w-16 h-16 rounded-[22px] bg-gray-50 flex items-center justify-center text-2xl text-[#FF9F43] overflow-hidden border border-gray-100">
                  {svc.image ? <img src={svc.image.startsWith('http') ? svc.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${svc.image}`} className="w-full h-full object-cover" /> : <FaClipboardList />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 text-base truncate pr-8">{svc.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-black text-[#FF9F43]">₹{svc.price}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{svc.duration} Mins</span>
                  </div>
                </div>
                <FaChevronRight className="text-gray-200 group-hover:text-[#FF9F43] transition-colors" />
              </button>
            )) : (
              <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                <FaClipboardList className="text-gray-100 text-5xl mx-auto mb-4" />
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No services listed yet</p>
              </div>
            )}
          </div>
          <Pagination items={myServices} currentPage={servicePage} setPage={setServicePage} />
        </div>
      );
    }

    return (
      <div className="space-y-8 pb-24">
        {/* Vet/Provider Summary Section */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-[#1A1A1A] p-6 rounded-[35px] relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[#FF9F43] font-black text-[8px] uppercase tracking-widest opacity-60">Active Bookings</span>
              <h3 className="text-white text-3xl font-black mt-2">{bookings.filter(b => b.status === 'Accepted').length}</h3>
              <p className="text-gray-500 text-[9px] font-bold mt-2 uppercase tracking-tight">Currently in progress</p>
            </div>
            <FaCalendarAlt className="absolute right-[-10%] bottom-[-10%] text-[80px] text-white opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm group">
            <span className="text-gray-400 font-black text-[8px] uppercase tracking-widest">Total Services</span>
            <h3 className="text-gray-900 text-3xl font-black mt-2">{myServices.length}</h3>
            <p className="text-[#FF9F43] text-[9px] font-bold mt-2 uppercase tracking-tight">Live in catalog</p>
          </div>
        </section>

        {/* Pending Requests Stats */}
        <section className="bg-amber-50 p-6 rounded-[35px] border border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
              <FaHistory />
            </div>
            <div>
               <h4 className="font-black text-gray-900 text-sm">Pending Actions</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{bookings.filter(b => b.status === 'Pending').length} requests waiting</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('?view=bookings')}
            className="text-[10px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-200 pb-0.5"
          >
            Review Now
          </button>
        </section>

        <section className="bg-[#FAF5F0] border-2 border-dashed border-gray-200 p-8 rounded-[45px] text-center">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FaStethoscope className="text-[#FF9F43] text-2xl" />
           </div>
           <h3 className="text-lg font-black text-gray-900 tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h3>
           <p className="text-xs font-medium text-gray-400 mt-2 leading-relaxed">
             Everything is running smoothly. Use the navigation below to manage your schedule and services.
           </p>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-10">
      <div className="sticky top-0 z-50 bg-[#FAF5F0]/80 backdrop-blur-xl px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#FF9F43] rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-[#FF9F43]/20">
              <FaPaw size={18} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Pawlio</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotificationOpen(true)}
            className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 relative active:scale-95 transition"
          >
            <FaBell size={18} />
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 w-5 h-5 bg-[#FF9F43] rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[8px] font-black text-white">{unreadCount}</span>
              </div>
            )}
          </button>
          <div onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all">
            {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-50"><FaUserAlt className="text-gray-300" /></div>}
          </div>
        </div>
      </div>

      <div className="px-6 mt-4">
        {renderDashboard()}
      </div>

      {/* Modals remain the same as previous implementation */}
      <Modal
        isOpen={isNotificationOpen}
        onClose={() => setNotificationOpen(false)}
        title="Notifications"
      >
        <div className="space-y-4 py-2">
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {notifications.length > 0 ? notifications.map((notif, idx) => (
                <motion.div
                  key={notif._id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => {
                    if (!notif.isRead) dispatch(markSingleRead(notif._id));
                  }}
                  className={`p-4 rounded-[25px] border flex gap-4 transition-all cursor-pointer ${notif.isRead ? 'bg-white border-gray-50 opacity-60' : 'bg-[#FF9F43]/5 border-[#FF9F43]/10 shadow-sm shadow-[#FF9F43]/5'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm ${notif.type === 'BookingNew' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                    }`}>
                    <FaBell />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-black text-gray-900 tracking-tight">{notif.title}</h5>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-0.5">{notif.message}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="py-12 text-center">
                  <FaBell className="text-gray-100 text-5xl mx-auto mb-4" />
                  <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No notifications yet</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Modal>

      {/* Pet Modal */}
      <Modal isOpen={isPetModalOpen} onClose={() => setPetModalOpen(false)} title="Add Pet Profile" noScroll={true}>
        <form onSubmit={handleAddPet} className="space-y-5 py-2">
          <div className="space-y-4">
            <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pet Name</label><input required className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all" value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} placeholder="Buddy" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Species</label><select className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all" value={petForm.species} onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}><option value="Dog">Dog</option><option value="Cat">Cat</option><option value="Bird">Bird</option><option value="Rabbit">Rabbit</option></select></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Age (Yrs)</label><input type="number" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all" value={petForm.age} onChange={(e) => setPetForm({ ...petForm, age: e.target.value })} placeholder="2" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pet Photo</label><input type="file" onChange={(e) => uploadImageHandler(e, setPetForm)} className="hidden" id="pet-photo-upload" /><label htmlFor="pet-photo-upload" className="w-full flex flex-col items-center justify-center gap-2 h-24 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[25px] cursor-pointer hover:bg-white transition-all overflow-hidden relative group">{petForm.image && <img src={petForm.image.startsWith('http') ? petForm.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${petForm.image}`} className="absolute inset-0 w-full h-full object-cover opacity-40" />}<div className="relative z-10 flex flex-col items-center"><FaUpload className="text-[#FF9F43] mb-1 group-hover:scale-110 transition-transform" /><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{isUploading ? 'Uploading...' : 'Choose a nice photo'}</span></div></label></div>
          </div>
          <button type="submit" className="w-full h-16 bg-[#FF9F43] text-white rounded-[22px] font-black uppercase tracking-widest shadow-lg shadow-[#FF9F43]/20 active:scale-95 transition-all mt-4" disabled={isUploading}>Add Pet Profile</button>
        </form>
      </Modal>

      {/* Service Modal */}
      <Modal isOpen={isServiceModalOpen} onClose={() => { setServiceModalOpen(false); setIsEditingService(false); }} title={isEditingService ? 'Update Service' : 'Create New Service'}>
        <form onSubmit={handleAddService} className="space-y-5 py-2">
          <div className="space-y-4">
            <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Title</label><input required className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="Emergency Health Checkup" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label><input type="number" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} placeholder="500" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duration (Min)</label><input type="number" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} placeholder="30" /></div>
            </div>
          </div>
          <button type="submit" className="w-full h-16 bg-[#FF9F43] text-white rounded-[22px] font-black uppercase tracking-widest shadow-lg shadow-[#FF9F43]/20 active:scale-95 transition-all mt-4">
            {isEditingService ? 'Update Service' : 'Publish Service'}
          </button>
        </form>
      </Modal>

      {/* Service Detail Modal */}
      <Modal
        isOpen={isServiceDetailOpen}
        onClose={() => setServiceDetailOpen(false)}
        title="Service Details"
      >
        {selectedService && (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[25px] bg-gray-50 flex items-center justify-center text-3xl text-[#FF9F43] border border-gray-100 overflow-hidden">
                {selectedService.image ? <img src={selectedService.image.startsWith('http') ? selectedService.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedService.image}`} className="w-full h-full object-cover" /> : <FaClipboardList />}
              </div>
              <div>
                <span className="text-[10px] font-black text-[#FF9F43] uppercase tracking-[0.2em]">{selectedService.category}</span>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{selectedService.name}</h3>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={openEditService}
                className="flex-1 h-14 bg-[#FF9F43] text-white rounded-[22px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#FF9F43]/20 active:scale-95 transition"
              >
                Edit Details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const CategoryPill = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex-shrink-0 bg-white h-14 rounded-full px-6 flex items-center gap-3 shadow-sm border border-gray-50 active:scale-95 transition-all hover:border-[#FF9F43]/30">
    <span className="text-lg">{icon}</span>
    <span className="text-xs font-black text-gray-700 uppercase tracking-tight">{label}</span>
  </button>
);

export default Dashboard;
