import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaVideo, FaPaperPlane, FaUserMd, FaChevronLeft } from 'react-icons/fa';
import axios from 'axios';
import socket from '../socket';
import { useCall } from '../context/CallContext';

const Telemedicine = () => {
  const { user } = useSelector(state => state.auth);
  const [consultations, setConsultations] = useState([]);
  const [vets, setVets] = useState([]);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [onlineUsersMap, setOnlineUsersMap] = useState({});
  
  const { startCall, inCall } = useCall();
  const messagesEndRef = useRef(null);
  
  const isVet = user?.role === 'Veterinarian';

  useEffect(() => {
    fetchConsultations();
    if (!isVet) fetchVets();
    
    if (!socket) return;
    
    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  // Online Presence Tracker
  useEffect(() => {
    socket.on('user-status-change', ({ userId, status }) => {
      setOnlineUsersMap(prev => ({ ...prev, [userId]: status }));
    });
    return () => socket.off('user-status-change');
  }, [socket]);

  useEffect(() => {
    const userIds = [];
    consultations.forEach(c => {
      const p = isVet ? c.petOwner?._id : c.vet?._id;
      if (p) userIds.push(p);
    });
    vets.forEach(v => userIds.push(v._id));
    
    if (userIds.length > 0) {
      socket.emit('check-status', userIds, (statuses) => {
        setOnlineUsersMap(prev => ({ ...prev, ...statuses }));
      });
    }
  }, [consultations, vets, isVet]);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConsultations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/chat`, config);
      setConsultations(data);
    } catch (err) {
      console.error('Failed to fetch consultations', err);
    }
  };

  const fetchVets = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/vets`, config);
      setVets(data);
    } catch (err) {
      console.error('Failed to fetch vets', err);
    }
  };

  const startNewConsultation = async (vetId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, { vetId }, config);
      fetchConsultations();
      selectConsultation(data);
    } catch (err) {
      console.error('Failed to start consultation', err);
    }
  };

  const selectConsultation = async (cons) => {
    setActiveConsultation(cons);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/chat/${cons._id}/messages`, config);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeConsultation) return;

    const receiverId = isVet ? activeConsultation.petOwner._id : activeConsultation.vet._id;
    
    socket.emit('sendMessage', {
      consultationId: activeConsultation._id,
      senderId: user._id,
      receiverId: receiverId,
      text: inputMsg
    });
    
    setInputMsg('');
  };

  const handleStartCall = () => {
    if (!activeConsultation) return;
    
    const partner = isVet ? activeConsultation.petOwner : activeConsultation.vet;
    if (onlineUsersMap[partner._id] !== 'online') {
      alert("Cannot start video call. The user is currently offline.");
      return;
    }

    startCall(partner._id, partner.name, isVet ? 'Pet Owner' : 'Veterinarian');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-gray-900 px-6 pt-12 pb-6 rounded-b-[40px] shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FF9F43] rounded-[20px] flex items-center justify-center text-white shadow-lg">
            <FaUserMd size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">Telemedicine</h1>
            <p className="text-[10px] font-black text-[#FF9F43] uppercase tracking-widest mt-1">Virtual Consultations</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {!activeConsultation ? (
          <div className="space-y-4">
            <h2 className="font-black text-gray-900">Your Consultations</h2>
            {consultations.length === 0 ? (
              <p className="text-gray-400 text-sm">No active consultations found.</p>
            ) : (
              consultations.map(cons => {
                const partner = isVet ? cons.petOwner : cons.vet;
                if (!partner) return null;
                return (
                  <motion.div 
                    key={cons._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectConsultation(cons)}
                    className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm cursor-pointer relative"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 font-bold overflow-hidden">
                        {partner?.image ? <img src={partner.image.startsWith('http') ? partner.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${partner.image}`} className="w-full h-full object-cover" /> : partner?.name?.charAt(0)}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${onlineUsersMap[partner._id] === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 text-sm">{partner?.name}</h3>
                      <p className="text-xs text-gray-500">{isVet ? 'Pet Owner' : 'Veterinarian'}</p>
                    </div>
                    {onlineUsersMap[partner._id] !== 'online' && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1 bg-gray-50 rounded-md">Offline</span>}
                  </motion.div>
                );
              })
            )}

            {!isVet && (
              <div className="pt-8 space-y-4">
                <h2 className="font-black text-gray-900">Available Veterinarians</h2>
                {vets.length === 0 ? (
                  <p className="text-gray-400 text-sm">No veterinarians currently available.</p>
                ) : (
                  vets.map(vet => (
                    <div key={vet._id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 font-bold overflow-hidden">
                            {vet?.image ? <img src={vet.image.startsWith('http') ? vet.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${vet.image}`} className="w-full h-full object-cover" /> : vet?.name?.charAt(0)}
                          </div>
                          <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${onlineUsersMap[vet._id] === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-sm">Dr. {vet.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Veterinarian</p>
                            {onlineUsersMap[vet._id] !== 'online' && <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1 py-0.5 bg-gray-50 rounded-sm">Offline</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => startNewConsultation(vet._id)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800">
                        Consult
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full relative">
            <button onClick={() => setActiveConsultation(null)} className="flex items-center gap-2 text-[#FF9F43] font-bold text-sm mb-4">
              <FaChevronLeft /> Back to List
            </button>
            
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 mb-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-500">
                    {isVet ? activeConsultation.petOwner.name.charAt(0) : activeConsultation.vet.name.charAt(0)}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${onlineUsersMap[isVet ? activeConsultation.petOwner._id : activeConsultation.vet._id] === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 leading-none">{isVet ? activeConsultation.petOwner.name : activeConsultation.vet.name}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${onlineUsersMap[isVet ? activeConsultation.petOwner._id : activeConsultation.vet._id] === 'online' ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {onlineUsersMap[isVet ? activeConsultation.petOwner._id : activeConsultation.vet._id] === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleStartCall} 
                disabled={onlineUsersMap[isVet ? activeConsultation.petOwner._id : activeConsultation.vet._id] !== 'online'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${onlineUsersMap[isVet ? activeConsultation.petOwner._id : activeConsultation.vet._id] === 'online' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
              >
                <FaVideo />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pb-20">
              {messages.map(msg => {
                const isMe = msg.sender._id === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-[#FF9F43] text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="fixed bottom-[80px] left-0 right-0 px-6 py-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pointer-events-none">
              <div className="max-w-md mx-auto pointer-events-auto">
                <form onSubmit={sendMessage} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Type a message..." 
                    className="w-full bg-white h-14 rounded-full pl-6 pr-14 text-sm font-bold text-gray-900 outline-none shadow-lg border border-gray-100"
                  />
                  <button type="submit" className="absolute right-2 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white">
                    <FaPaperPlane size={12} className="ml-[-2px]" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Telemedicine;
