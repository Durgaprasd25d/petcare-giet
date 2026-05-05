import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, verifyOTP, reset, resetOTPState } from '../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaUsers, FaKey, FaPaw, FaChevronLeft, FaArrowRight, FaStethoscope, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Pet Owner'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  
  const { name, email, password, role } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message, requireOTP, registeredEmail } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message);
      dispatch(reset());
    }
    if (isSuccess && user) {
      navigate('/dashboard');
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmitDetails = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  const onSubmitOTP = (e) => {
    e.preventDefault();
    dispatch(verifyOTP({ email: registeredEmail, otp }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF5F0] overflow-hidden font-sans select-none flex flex-col h-[100dvh]">
      {/* Back Button */}
      <div className="p-4 relative z-50 flex-shrink-0">
        <button 
          onClick={() => requireOTP ? dispatch(resetOTPState()) : navigate('/')} 
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-sm border border-gray-100 active:scale-95 transition"
        >
          <FaChevronLeft />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 min-h-0">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg flex flex-col items-center"
        >
          {/* Header */}
          <div className="text-center mb-4 flex-shrink-0">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-[22px] bg-[#FF9F43] shadow-lg mb-2 text-white">
               <FaPaw className="text-xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter leading-tight">
              Join the <span className="text-[#FF9F43]">Family!</span>
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {!requireOTP ? (
              <motion.div
                key="details-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[45px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-gray-50 w-full relative z-10"
              >
                <form onSubmit={onSubmitDetails} className="flex flex-col">
                  <div className="w-full max-w-[300px] mx-auto space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={onChange}
                          className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-2xl pl-11 pr-4 text-xs font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all shadow-inner"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                          type="email"
                          name="email"
                          value={email}
                          onChange={onChange}
                          className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-2xl pl-11 pr-4 text-xs font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all shadow-inner"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={password}
                          onChange={onChange}
                          className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-2xl pl-11 pr-11 text-xs font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all shadow-inner"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF9F43] transition-colors"
                        >
                          {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-[320px] mx-auto mt-3.5 space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">I am a...</label>
                    <div className="grid grid-cols-3 gap-2">
                      <RoleCard icon={<FaPaw />} label="Owner" real="Pet Owner" current={role} setRole={(v) => setFormData(p=>({...p, role: v}))} />
                      <RoleCard icon={<FaStethoscope />} label="Vet" real="Veterinarian" current={role} setRole={(v) => setFormData(p=>({...p, role: v}))} />
                      <RoleCard icon={<FaUsers />} label="Provider" real="Service Provider" current={role} setRole={(v) => setFormData(p=>({...p, role: v}))} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-[200px] mx-auto h-16 bg-[#FF9F43] rounded-[22px] text-white text-base font-black uppercase tracking-widest shadow-[0_15px_35px_rgba(255,159,67,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-5 disabled:opacity-70"
                  >
                    {isLoading ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Continue</span>
                        <FaArrowRight className="text-sm" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-wide">
                    Joined before? <Link to="/login" className="text-[#FF9F43] hover:underline ml-1">Log In</Link>
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[40px] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-gray-50 text-center w-full flex flex-col items-center"
              >
                <div className="bg-[#FF9F43]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <FaKey className="text-[#FF9F43] text-2xl" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">Verify Email</h3>
                <p className="text-gray-400 text-xs mb-6 font-medium">Code sent to <br/><span className="text-gray-900 font-bold">{registeredEmail}</span></p>

                <form onSubmit={onSubmitOTP} className="space-y-6 w-full flex flex-col items-center">
                  <div className="w-full max-w-[300px]">
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-18 bg-gray-50 border-2 border-gray-100 rounded-[24px] text-center text-4xl font-black text-gray-900 tracking-[0.4em] focus:bg-white focus:border-[#FF9F43] outline-none transition-all"
                      placeholder="000000"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-[200px] h-16 bg-[#FF9F43] rounded-[22px] text-white text-base font-black uppercase tracking-widest shadow-[0_15px_35px_rgba(255,159,67,0.3)] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Now'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => dispatch(resetOTPState())}
                    className="text-gray-400 hover:text-[#FF9F43] text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    Change Details
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

const RoleCard = ({ icon, label, real, current, setRole }) => {
  const active = current === real;
  
  return (
    <div 
      onClick={() => setRole(real)}
      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
        active ? 'bg-[#FF9F43]/5 border-[#FF9F43] shadow-md scale-[1.02]' : 'bg-gray-50 border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className={`text-xl ${active ? 'text-[#FF9F43]' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-tight ${active ? 'text-gray-900' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

export default Register;
