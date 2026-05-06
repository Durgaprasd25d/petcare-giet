import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getWellnessPlan, updateMilestone } from '../redux/slices/wellnessSlice';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { playSuccessSound, playClickSound } from '../utils/sounds';
import { toast } from 'react-hot-toast';
import { 
  FaStethoscope, FaSyringe, FaDog, FaCat, FaCut, FaPaw, 
  FaSchool, FaHome, FaHeartbeat, FaChevronLeft, FaCheckCircle, FaLock, FaFlagCheckered
} from 'react-icons/fa';

const iconMap = {
  FaStethoscope: <FaStethoscope />,
  FaSyringe: <FaSyringe />,
  FaDog: <FaDog />,
  FaCat: <FaCat />,
  FaCut: <FaCut />,
  FaPaw: <FaPaw />,
  FaSchool: <FaSchool />,
  FaHome: <FaHome />,
  FaHeartbeat: <FaHeartbeat />
};

const WellnessRoadmap = () => {
  const { petId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plan, isLoading } = useSelector((state) => state.wellness);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(getWellnessPlan(petId));
  }, [dispatch, petId]);

  if (isLoading || !plan) {
    return (
      <div className="min-h-screen bg-[#FAF5F0] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF9F43] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleToggle = async (milestoneId, currentStatus, index) => {
    // Check if previous milestone is completed
    if (!currentStatus && index > 0) {
      const prevMilestone = plan.milestones[index - 1];
      if (!prevMilestone.isCompleted) {
        toast.error(`Please unlock the "${prevMilestone.title}" (Step ${index}) first!`, {
          icon: '🔒',
          style: { borderRadius: '20px', background: '#333', color: '#fff' }
        });
        return;
      }
    }

    const newStatus = !currentStatus;
    try {
      await dispatch(updateMilestone({ petId, milestoneId, isCompleted: newStatus })).unwrap();
      
      if (newStatus) {
        toast.success('Step Done! 🎉', {
          icon: '🏆',
          style: { borderRadius: '20px', background: '#333', color: '#fff' }
        });
        playSuccessSound();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF9F43', '#FFFFFF', '#FFD2A0']
        });
      } else {
        toast('Step reset', { icon: '🔄' });
        playClickSound();
      }
    } catch (error) {
      toast.error(error || 'Failed to update milestone');
    }
  };

  // SVG Path Calculation for a winding road
  const generatePath = () => {
    if (!plan.milestones.length) return '';
    const points = plan.milestones.map((_, i) => {
      const x = i % 2 === 0 ? 30 : 70; // Percentage X
      const y = (i * 100) + 50; // Pixels Y
      return { x, y };
    });

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midY = (p1.y + p2.y) / 2;
      d += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const completionPercent = Math.round((plan.milestones.filter(m => m.isCompleted).length / plan.milestones.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-32 relative overflow-x-hidden">
      {/* Decorative Background Map Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <FaPaw key={i} className="absolute text-4xl" style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`
          }} />
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-[60] bg-[#FAF5F0]/80 backdrop-blur-xl px-6 py-6 flex items-center gap-4 border-b border-gray-100/50">
        <button 
          onClick={() => navigate(`/pet/${petId}`, { replace: true })} 
          className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#FF9F43] transition-colors shadow-sm active:scale-95"
        >
          <FaChevronLeft />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Health Journey</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                className="h-full bg-[#FF9F43]"
              />
            </div>
            <span className="text-[10px] font-black text-[#FF9F43]">{completionPercent}%</span>
          </div>
        </div>
        {completionPercent === 100 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"
          >
            <FaFlagCheckered />
          </motion.div>
        )}
      </div>

      {/* The Map Interface */}
      <div className="relative max-w-lg mx-auto py-10" ref={containerRef}>
        {/* SVG Path Background */}
        <svg 
          className="absolute top-0 left-0 w-full h-full pointer-events-none" 
          style={{ height: `${plan.milestones.length * 100 + 100}px` }}
          viewBox={`0 0 100 ${plan.milestones.length * 100 + 100}`}
          preserveAspectRatio="none"
        >
          <path 
            d={generatePath()} 
            fill="none" 
            stroke="#FF9F43" 
            strokeWidth="1.5" 
            strokeDasharray="4 4" 
            className="opacity-20"
          />
          {/* Animated "Done" Path Overlay */}
          <motion.path 
            d={generatePath()} 
            fill="none" 
            stroke="#FF9F43" 
            strokeWidth="2.5" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: completionPercent / 100 }}
            className="opacity-60"
          />
        </svg>

        {/* Milestone Nodes */}
        <div className="space-y-0 relative">
          {plan.milestones.map((m, idx) => {
            const isLeft = idx % 2 === 0;
            const isCompleted = m.isCompleted;
            const isNext = !isCompleted && (idx === 0 || plan.milestones[idx - 1].isCompleted);
            
            return (
              <div key={m._id} className="h-[100px] relative flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  className={`absolute ${isLeft ? 'left-[15%]' : 'right-[15%]'}`}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Node Button */}
                    <motion.button
                      whileHover={!(idx > 0 && !plan.milestones[idx-1].isCompleted && !m.isCompleted) ? { scale: 1.1 } : {}}
                      whileTap={!(idx > 0 && !plan.milestones[idx-1].isCompleted && !m.isCompleted) ? { scale: 0.9 } : {}}
                      onClick={() => {
                        const isLocked = idx > 0 && !plan.milestones[idx-1].isCompleted && !m.isCompleted;
                        if (isLocked) {
                          const prevMilestone = plan.milestones[idx - 1];
                          toast.error(`🔒 This path is locked! Unlock "${prevMilestone.title}" first.`, {
                            style: { borderRadius: '20px', background: '#333', color: '#fff' }
                          });
                          return;
                        }
                        playClickSound();
                        setSelectedMilestone({ ...m, index: idx });
                      }}
                      className={`w-16 h-16 rounded-[22px] flex items-center justify-center text-2xl relative transition-all duration-500
                        ${isCompleted 
                          ? 'bg-[#FF9F43] text-white shadow-xl shadow-[#FF9F43]/40' 
                          : isNext
                            ? 'bg-white text-[#FF9F43] border-2 border-[#FF9F43] shadow-lg animate-bounce-subtle'
                            : (idx > 0 && !plan.milestones[idx-1].isCompleted)
                              ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 grayscale'
                              : 'bg-white text-gray-300 border-2 border-dashed border-gray-200'
                        }`}
                    >
                      {idx > 0 && !plan.milestones[idx-1].isCompleted && !m.isCompleted ? <FaLock className="text-sm opacity-50" /> : (iconMap[m.icon] || <FaPaw />)}
                      
                      {/* Completion Checkmark */}
                      {isCompleted && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white"
                        >
                          <FaCheckCircle />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Milestone Label */}
                    <div className={`absolute top-1/2 -translate-y-1/2 w-40 ${isLeft ? 'left-20 text-left' : 'right-20 text-right'}`}>
                      <h4 className={`text-[10px] font-black uppercase tracking-widest leading-tight ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {m.title}
                      </h4>
                      {isNext && (
                        <span className="text-[8px] font-black text-[#FF9F43] bg-[#FF9F43]/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Next Goal
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Info Cards */}
      <div className="fixed bottom-10 left-6 right-6 z-50 flex justify-center">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 p-4 rounded-[30px] shadow-2xl flex items-center gap-4 w-full max-w-sm">
           <div className="w-12 h-12 bg-[#FF9F43] rounded-2xl flex items-center justify-center text-white text-xl">
              <FaFlagCheckered />
           </div>
           <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Status</p>
              <h3 className="text-sm font-black text-gray-900">
                {completionPercent === 100 ? 'Hero Pet Status Reached! 🎉' : `Only ${100 - completionPercent}% to go!`}
              </h3>
           </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMilestone(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[45px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9F43]/5 rounded-full -mr-10 -mt-10 blur-2xl" />
              
              <div className="w-20 h-20 bg-[#FF9F43]/10 rounded-[28px] flex items-center justify-center text-[#FF9F43] text-4xl mb-6 relative z-10">
                {iconMap[selectedMilestone.icon] || <FaPaw />}
              </div>
              
              <div className="relative z-10">
                <span className="text-[10px] font-black text-[#FF9F43] uppercase tracking-widest bg-[#FF9F43]/10 px-3 py-1 rounded-full">
                  {selectedMilestone.category}
                </span>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-4">{selectedMilestone.title}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed mt-3 mb-8">
                  {selectedMilestone.description}
                </p>
              </div>

              <div className="flex gap-4 relative z-10">
                <button
                  onClick={() => {
                    handleToggle(selectedMilestone._id, selectedMilestone.isCompleted, selectedMilestone.index);
                    setSelectedMilestone(null);
                  }}
                  className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                    ${selectedMilestone.isCompleted 
                      ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' 
                      : 'bg-[#FF9F43] text-white shadow-xl shadow-[#FF9F43]/20 active:scale-95'
                    }`}
                >
                  {selectedMilestone.isCompleted ? 'Reset Step' : 'Complete Step'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default WellnessRoadmap;
