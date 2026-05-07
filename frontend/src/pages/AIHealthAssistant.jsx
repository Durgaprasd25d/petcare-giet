import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaExclamationTriangle, FaStethoscope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AIHealthAssistant = () => {
  const { user } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am the Payven AI Health Assistant. Describe your pet\'s symptoms, and I will help you assess if it requires immediate veterinary attention.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/ai/analyze`, { symptoms: userMessage }, config);
      
      setMessages(prev => [...prev, { sender: 'ai', analysis: data.analysis }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting to my servers right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] flex flex-col pb-24">
      {/* Header */}
      <div className="bg-gray-900 px-6 pt-12 pb-8 rounded-b-[40px] shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FF9F43] rounded-[20px] flex items-center justify-center text-white shadow-lg">
            <FaRobot size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">AI Assistant</h1>
            <p className="text-[10px] font-black text-[#FF9F43] uppercase tracking-widest mt-1">Symptom Checker</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-[25px] p-5 shadow-sm ${msg.sender === 'user' ? 'bg-[#FF9F43] text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
              {msg.text && <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
              
              {msg.analysis && (
                <div className="space-y-4">
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.analysis.text}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-[25px] rounded-tl-sm p-5 shadow-sm flex gap-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[80px] left-0 right-0 px-6 py-4 bg-gradient-to-t from-[#FAF5F0] via-[#FAF5F0] to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe symptoms..." 
              className="w-full bg-white h-14 rounded-full pl-6 pr-14 text-sm font-bold text-gray-900 outline-none shadow-lg border border-gray-100"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-10 h-10 bg-[#FF9F43] rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:bg-[#f39132] transition-colors"
            >
              <FaPaperPlane size={14} className="ml-[-2px]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIHealthAssistant;
