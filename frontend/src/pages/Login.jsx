import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaPaw, FaChevronLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message);
    }
    if (isSuccess || user) {
      navigate('/dashboard');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF5F0] overflow-hidden font-sans select-none flex flex-col h-[100dvh]">
      {/* Back Button */}
      <div className="p-6 relative z-50 flex-shrink-0">
        <button 
          onClick={() => navigate('/')} 
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-sm border border-gray-100 active:scale-95 transition"
        >
          <FaChevronLeft />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 min-h-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex flex-col items-center"
        >
          {/* Header */}
          <div className="text-center mb-8 flex-shrink-0">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[35px] bg-white shadow-xl mb-4 border-4 border-[#FF9F43]/10 relative overflow-hidden">
               <FaPaw className="text-[#FF9F43] text-4xl" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">
              Welcome <span className="text-[#FF9F43]">Back!</span>
            </h1>
            <p className="text-gray-400 font-medium mt-1 text-sm">Go to your pet's world</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[50px] p-8 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.08)] border border-gray-50 w-full relative overflow-hidden group">
            <form onSubmit={onSubmit} className="space-y-6 relative z-10 flex flex-col">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-3xl pl-14 pr-6 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all shadow-inner"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                  <button type="button" className="text-[10px] font-black text-[#FF9F43] uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={onChange}
                    className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-3xl pl-14 pr-14 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#FF9F43] outline-none transition-all shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF9F43] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-[200px] mx-auto h-16 bg-[#FF9F43] rounded-[25px] text-white text-base font-black uppercase tracking-[0.1em] shadow-[0_15px_35px_rgba(255,159,67,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-70"
              >
                {isLoading ? (
                   <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <FaPaw className="text-xl opacity-50" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center relative z-10">
              <p className="text-gray-400 text-xs font-black uppercase tracking-wider">
                New here? <Link to="/register" className="text-[#FF9F43] hover:underline ml-1">Create Account</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
