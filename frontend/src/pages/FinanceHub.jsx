import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getExpenses, addExpense, deleteExpense } from '../redux/slices/expenseSlice';
import { getPets } from '../redux/slices/petSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWallet, FaPlus, FaTrashAlt, FaPizzaSlice, FaStethoscope, 
  FaCut, FaGamepad, FaGraduationCap, FaEllipsisH, FaChevronLeft,
  FaCalendarAlt, FaTag, FaChartPie, FaChartLine, FaChevronDown
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const categoryIcons = {
  Food: { icon: <FaPizzaSlice />, color: 'bg-orange-100 text-orange-500' },
  Medical: { icon: <FaStethoscope />, color: 'bg-red-100 text-red-500' },
  Grooming: { icon: <FaCut />, color: 'bg-blue-100 text-blue-500' },
  Toys: { icon: <FaGamepad />, color: 'bg-purple-100 text-purple-500' },
  Training: { icon: <FaGraduationCap />, color: 'bg-emerald-100 text-emerald-500' },
  Other: { icon: <FaEllipsisH />, color: 'bg-gray-100 text-gray-500' }
};

const FinanceHub = () => {
  const dispatch = useDispatch();
  const { expenses } = useSelector((state) => state.expenses);
  const { pets } = useSelector((state) => state.pets);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pet: '',
    category: 'Food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    dispatch(getExpenses());
    dispatch(getPets());
  }, [dispatch]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.pet || !formData.amount) return toast.error('Please fill in Pet and Amount');
    
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };
      await dispatch(addExpense(payload)).unwrap();
      toast.success('Transaction secured in your vault! 💰');
      setIsAddModalOpen(false);
      setFormData({
        pet: '',
        category: 'Food',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error(error?.message || error || 'Failed to add expense');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteExpense(id)).unwrap();
      toast.success('Expense removed');
    } catch (error) {
      toast.error(error || 'Failed to delete expense');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
               <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 active:scale-95 transition-all">
                  <FaChevronLeft size={14} />
               </button>
               <div>
                 <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payven Wallet</h1>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Premium Finance Hub</p>
               </div>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-12 h-12 bg-[#FF9F43] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#FF9F43]/30 active:scale-95 transition-all"
            >
              <FaPlus />
            </button>
          </div>

        {/* Total Card */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333333] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-[#FF9F43]/20 rounded-full blur-3xl"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-60">
                 <FaWallet size={12} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Total Investment</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter">₹{totalSpent.toLocaleString()}</h2>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-[#FF9F43]">
                 <FaChartLine />
                 <span>Spending is up 12% this month</span>
              </div>
           </div>
        </div>
      </div>

      <div className="px-6 mt-10 space-y-10">
        {/* Category Breakdown */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <FaChartPie className="text-[#FF9F43]" />
              Breakdown
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(categoryIcons).map((cat) => (
              <div key={cat} className="bg-white p-5 rounded-[28px] border border-gray-50 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${categoryIcons[cat].color}`}>
                  {categoryIcons[cat].icon}
                </div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat}</h4>
                <p className="text-lg font-black text-gray-900 mt-1">₹{(categoryTotals[cat] || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Transactions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <FaTag className="text-[#FF9F43]" />
              Recent Logs
            </h3>
          </div>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="bg-white/50 border-2 border-dashed border-gray-100 rounded-3xl p-10 text-center">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No expenses yet</p>
              </div>
            ) : (
              expenses.map((exp) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={exp._id} 
                  className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-50 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${categoryIcons[exp.category]?.color || 'bg-gray-100'}`}>
                    {categoryIcons[exp.category]?.icon || <FaEllipsisH />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-gray-900">{exp.description}</h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {exp.pet?.name || 'Unknown Pet'} • {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₹{exp.amount}</p>
                    <button 
                      onClick={() => handleDelete(exp._id)}
                      className="text-red-400 mt-1 p-1"
                    >
                      <FaTrashAlt size={10} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[45px] p-8 shadow-2xl overflow-visible"
            >
              <div className="w-16 h-1 bg-gray-100 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8 text-center">Log Transaction</h3>
              
              <form onSubmit={handleAdd} className="space-y-6">
                {/* Custom Pet Dropdown */}
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Select Companion</label>
                  <button 
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'pet' ? null : 'pet')}
                    className="w-full h-14 bg-gray-50 rounded-2xl px-5 flex items-center justify-between group hover:bg-gray-100 transition-all border border-transparent focus:border-[#FF9F43]/30"
                  >
                    <span className={`text-xs font-bold ${formData.pet ? 'text-gray-900' : 'text-gray-400'}`}>
                      {formData.pet ? pets.find(p => p._id === formData.pet)?.name : 'Choose a pet'}
                    </span>
                    <FaChevronDown className={`text-gray-300 transition-transform ${activeDropdown === 'pet' ? 'rotate-180' : ''}`} size={10} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === 'pet' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-[110] left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-50 p-2 space-y-1 max-h-48 overflow-y-auto"
                      >
                        {pets.length > 0 ? pets.map(p => (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, pet: p._id});
                              setActiveDropdown(null);
                            }}
                            className="w-full h-11 px-4 rounded-xl text-left text-xs font-bold text-gray-600 hover:bg-[#FF9F43]/5 hover:text-[#FF9F43] transition-all flex items-center justify-between"
                          >
                            {p.name}
                            {formData.pet === p._id && <div className="w-1.5 h-1.5 rounded-full bg-[#FF9F43]" />}
                          </button>
                        )) : (
                          <p className="text-[10px] text-gray-400 p-4 text-center">No pets found</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Custom Category Dropdown */}
                  <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Category</label>
                    <button 
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                      className="w-full h-14 bg-gray-50 rounded-2xl px-5 flex items-center justify-between hover:bg-gray-100 transition-all border border-transparent focus:border-[#FF9F43]/30"
                    >
                      <span className="text-xs font-bold text-gray-900">{formData.category}</span>
                      <FaChevronDown className={`text-gray-300 transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} size={10} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'category' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-[110] left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-50 p-2 space-y-1"
                        >
                          {Object.keys(categoryIcons).map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, category: c});
                                setActiveDropdown(null);
                              }}
                              className="w-full h-11 px-4 rounded-xl text-left text-xs font-bold text-gray-600 hover:bg-[#FF9F43]/5 hover:text-[#FF9F43] transition-all flex items-center gap-3"
                            >
                              <span className="opacity-50">{categoryIcons[c].icon}</span>
                              {c}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Amount (₹)</label>
                    <input 
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 text-xs font-bold focus:ring-2 focus:ring-[#FF9F43]/20 focus:bg-white transition-all outline-none"
                      placeholder="500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Description</label>
                  <input 
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 text-xs font-bold focus:ring-2 focus:ring-[#FF9F43]/20 focus:bg-white transition-all outline-none"
                    placeholder="Premium Kibble"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full h-16 bg-[#FF9F43] text-white rounded-[22px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#FF9F43]/20 mt-4 active:scale-95 transition-all flex items-center justify-center"
                >
                  Confirm Log
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceHub;
