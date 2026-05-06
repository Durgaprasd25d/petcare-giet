import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, noScroll = false }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-lg rounded-t-[45px] sm:rounded-[50px] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90dvh]"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{title}</h3>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className={`px-8 pb-10 ${noScroll ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
