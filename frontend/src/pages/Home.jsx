import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPaw, FaChevronLeft, FaHeart, FaMapMarkerAlt, FaPhoneAlt, FaCommentAlt, FaSearch, FaBell, FaDog, FaCat, FaKiwiBird, FaHome, FaCompass, FaCalendarAlt, FaUser } from 'react-icons/fa';

const Home = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onboardingSteps = [
    {
      title: "Meet Your New Best Friend",
      sub: "Thousands of adorable pets are waiting for you.",
      image: "/assets/onboarding/cat_peeking.png",
      tag: "Welcome to Payven",
      translateY: "translate-y-[28%] sm:translate-y-[20%]",
      containerClass: "w-[400px] h-[400px]",
      marginBottom: "mb-[22px]"
    },
    {
      title: "Find Your Perfect Match",
      sub: "Personalized recommendations based on your lifestyle.",
      image: "/assets/onboarding/dog_peeking.png",
      tag: "Discovery",
      translateY: "translate-y-[28%] sm:translate-y-[20%]",
      containerClass: "w-[400px] h-[400px]",
      marginBottom: "mb-[14px]"
    },
    {
      title: "Care That Lasts Forever",
      sub: "Health records and expert advice at your fingertips.",
      image: "/assets/onboarding/rabbit_peeking.png",
      tag: "Premium Care",
      translateY: "translate-y-[15%] sm:translate-y-[10%]",
      containerClass: "w-[450px] h-[450px]",
      marginBottom: "mb-[-122px]"
    }
  ];

  const nextStep = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/register');
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const goToStep = (index) => {
    setStep(index);
  };

  const current = onboardingSteps[step];

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF5F0] overflow-hidden font-sans select-none flex flex-col h-[100dvh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1 flex flex-col relative h-full"
        >
          {/* Background Watermark Paw */}
          <div className="absolute right-[-20%] top-[10%] opacity-[0.03] rotate-12 pointer-events-none">
            <FaPaw className="text-[500px] text-[#1A1A1A]" />
          </div>

          {/* Top Content */}
          <div className="px-8 pt-10 sm:pt-16 relative z-10 flex-shrink-0">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[#FF9F43] font-black uppercase tracking-[0.2em] text-[10px] block mb-2">
                {current.tag}
              </span>
              <h1 className="text-5xl sm:text-7xl font-black leading-[0.9] text-[#1A1A1A] tracking-tighter">
                {current.title.split(' ').slice(0, 2).join(' ')} <br />
                <span className="text-[#FF9F43]">{current.title.split(' ').slice(2, 4).join(' ')}</span> <br />
                {current.title.split(' ').slice(4).join(' ')}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-3 font-medium max-w-[200px] leading-relaxed">
                {current.sub}
              </p>
            </motion.div>
          </div>

          {/* Middle Section with Dynamic Image Size & Margin */}
          <div className="flex-1 relative min-h-0">
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 80 }}
              className="absolute inset-0 flex items-end justify-center z-50 pointer-events-none"
            >
              <div className={`relative ${current.containerClass} flex items-end justify-center ${current.marginBottom}`}>
                <img
                  src={current.image}
                  className={`w-full h-full object-contain transform ${current.translateY}`}
                  alt="Pet Peeking"
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom Panel */}
          <div className="bg-white rounded-t-[50px] px-8 pt-6 pb-8 sm:pt-10 sm:pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.12)] relative z-40 flex-shrink-0">
            <div className="flex flex-col gap-5 sm:gap-8">
              <h2 className="text-lg sm:text-2xl font-black text-gray-900 text-center leading-tight">
                {step === 2 ? "Ready to start your journey?" : "Find your perfect companion"}
              </h2>

              <div className="flex items-center justify-between">
                <div className="flex gap-2.5">
                  {onboardingSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${step === index ? 'w-10 bg-black' : 'w-2 bg-gray-200'
                        }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  className="group flex items-center gap-3 py-3 px-5 sm:py-5 sm:px-8 rounded-full font-black text-white bg-[#FF9F43] shadow-[0_10px_30px_rgba(255,159,67,0.4)] active:scale-95 transition-all"
                >
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-black/10 rounded-full flex items-center justify-center">
                    <FaPaw className="text-lg sm:text-2xl" />
                  </div>
                  <span className="text-sm sm:text-xl pr-1 uppercase tracking-wide">
                    {step === 2 ? "Let's Go" : "Next"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-0 w-full px-8 py-3 flex justify-between items-center text-[10px] font-black z-[200] pointer-events-none opacity-40">
        <span>9:41</span>
      </div>
    </div>
  );
};

const Pill = ({ label, sub, color }) => (
  <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl ${color} flex flex-col items-center justify-center border border-white/20`}>
    <span className="text-[10px] sm:text-xs font-black">{label}</span>
    <span className="text-[7px] sm:text-[8px] uppercase font-bold opacity-60 mt-0.5">{sub}</span>
  </div>
);

const CategoryItem = ({ icon, label, active }) => (
  <div className={`flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer`}>
    <div className={`w-12 h-16 sm:w-14 sm:h-20 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all ${active ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}>
      {icon}
    </div>
    <span className={`text-[8px] sm:text-[10px] font-black ${active ? 'text-black' : 'text-gray-400'}`}>{label}</span>
  </div>
);

const NavIcon = ({ icon, active }) => (
  <div className={`text-lg sm:text-xl cursor-pointer p-1.5 sm:p-2 transition-all ${active ? 'text-amber-500 scale-110' : 'text-gray-300 hover:text-gray-500'}`}>
    {icon}
  </div>
);

export default Home;
