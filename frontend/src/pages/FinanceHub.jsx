import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getExpenses, addExpense, deleteExpense } from '../redux/slices/expenseSlice';
import { getPets } from '../redux/slices/petSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWallet, FaPlus, FaTrashAlt, FaPizzaSlice, FaStethoscope, 
  FaCut, FaGamepad, FaGraduationCap, FaEllipsisH, FaChevronLeft,
  FaCalendarAlt, FaTag, FaChartPie, FaChartLine
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
  const { expenses, isLoading } = useSelector((state) => state.expenses);
  const { pets } = useSelector((state) => state.pets);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pet: '',
    category: 'Food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

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
      await dispatch(addExpense(formData)).unwrap();
      toast.success('Expense logged successfully! 💰');
      setIsAddModalOpen(false);
      setFormData({
        pet: '',
        category: 'Food',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error(error || 'Failed to add expense');
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
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fin-Pet Tracker</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Manage Pet Expenses</p>
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
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${categoryIcons[exp.category].color}`}>
                    {categoryIcons[exp.category].icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-gray-900">{exp.description}</h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {exp.pet?.name} • {new Date(exp.date).toLocaleDateString()}
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
              className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl"
            >
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 text-center">New Expense</h3>
              
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Pet</label>
                  <select 
                    value={formData.pet}
                    onChange={(e) => setFormData({...formData, pet: e.target.value})}
                    className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold mt-1 focus:ring-2 focus:ring-[#FF9F43]"
                  >
                    <option value="">Choose Pet</option>
                    {pets.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold mt-1 focus:ring-2 focus:ring-[#FF9F43]"
                    >
                      {Object.keys(categoryIcons).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                    <input 
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold mt-1 focus:ring-2 focus:ring-[#FF9F43]"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <input 
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold mt-1 focus:ring-2 focus:ring-[#FF9F43]"
                    placeholder="e.g. Premium Kibble"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full h-14 bg-[#FF9F43] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#FF9F43]/20 mt-4 active:scale-95 transition-all"
                >
                  Save Transaction
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
