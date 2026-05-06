import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPaw, FaChevronLeft, FaHeart, FaMapMarkerAlt, FaPhoneAlt, FaCommentAlt, FaSearch, FaBell, FaDog, FaCat, FaKiwiBird, FaHome, FaCompass, FaCalendarAlt, FaUser, FaArrowRight } from 'react-icons/fa';

const Home = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onboardingSteps = useMemo(() => [
    {
      title: "Elite Pet Care Unified",
      sub: "Premium health management for your furry companions.",
      image: "/assets/onboarding/cat_peeking.png",
      tag: "Intelligence",
      translateY: "translate-y-[28%] sm:translate-y-[20%]",
      containerClass: "w-[400px] h-[400px]",
      marginBottom: "mb-[22px]",
      color: "#FF9F43"
    },
    {
      title: "Direct Professional Access",
      sub: "Instant bookings with top-tier verified veterinarians.",
      image: "/assets/onboarding/dog_peeking.png",
      tag: "Precision",
      translateY: "translate-y-[28%] sm:translate-y-[20%]",
      containerClass: "w-[400px] h-[400px]",
      marginBottom: "mb-[14px]",
      color: "#1A1A1A"
    },
    {
      title: "Streamlined Experience",
      sub: "Focus on care, not paperwork. Simple & secure.",
      image: "/assets/onboarding/rabbit_peeking.png",
      tag: "Excellence",
      translateY: "translate-y-[15%] sm:translate-y-[10%]",
      containerClass: "w-[450px] h-[450px]",
      marginBottom: "mb-[-122px]",
      color: "#FF9F43"
    }
  ], []);

  const nextStep = useCallback(() => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/register');
    }
  }, [step, onboardingSteps.length, navigate]);

  const current = onboardingSteps[step];

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF5F0] overflow-hidden font-sans select-none flex flex-col h-[100dvh] transition-colors duration-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col relative h-full gpu-accelerated"
        >
          {/* Background Watermark Paw */}
          <div className="absolute right-[-20%] top-[10%] opacity-[0.02] rotate-12 pointer-events-none transition-transform duration-1000">
            <FaPaw className="text-[600px] text-gray-900" />
          </div>

          {/* Top Content */}
          <div className="px-10 pt-16 sm:pt-24 relative z-10 flex-shrink-0">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="text-[#FF9F43] font-black uppercase tracking-[0.4em] text-[10px] block mb-4 opacity-60">
                {current.tag}
              </span>
              <h1 className="text-6xl sm:text-8xl font-black leading-[0.85] text-gray-900 tracking-tighter">
                {current.title.split(' ').slice(0, 2).join(' ')} <br />
                <span className="text-[#FF9F43]">{current.title.split(' ').slice(2, 3).join(' ')}</span> <br />
                {current.title.split(' ').slice(3).join(' ')}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base mt-6 font-medium max-w-[240px] leading-relaxed opacity-80">
                {current.sub}
              </p>
            </motion.div>
          </div>

          {/* Middle Section with Hardware Acceleration */}
          <div className="flex-1 relative min-h-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 100, delay: 0.2 }}
              className="absolute inset-0 flex items-end justify-center z-50 pointer-events-none"
            >
              <div className={`relative ${current.containerClass} flex items-end justify-center ${current.marginBottom} will-change-transform`}>
                <img
                  src={current.image}
                  className={`w-full h-full object-contain transform transition-transform duration-1000 ${current.translateY}`}
                  alt="Onboarding"
                  loading="eager"
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom Panel - Native App Feel */}
          <div className="bg-white rounded-t-[60px] px-10 pt-10 pb-12 sm:pb-16 shadow-[0_-30px_80px_rgba(0,0,0,0.08)] relative z-40 flex-shrink-0 border-t border-gray-50">
            <div className="flex flex-col gap-10">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  {onboardingSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setStep(index)}
                      className={`h-1.5 rounded-full transition-all duration-700 ${step === index ? 'w-12 bg-gray-900' : 'w-1.5 bg-gray-100'
                        }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextStep}
                  className="group flex items-center gap-4 py-4 px-6 sm:py-6 sm:px-10 rounded-[30px] font-black text-white bg-gray-900 shadow-2xl active:scale-95 transition-all"
                >
                  <span className="text-sm sm:text-lg uppercase tracking-widest pl-2">
                    {step === 2 ? "Get Started" : "Continue"}
                  </span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FF9F43] transition-colors">
                    <FaArrowRight className="text-sm sm:text-lg" />
                  </div>
                </motion.button>
              </div>
              <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Payven Executive Platform v2.0</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Home;
