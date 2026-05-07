import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import socket from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVideo, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideoSlash } from 'react-icons/fa';

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const [inCall, setInCall] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerData, setCallerData] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [partnerData, setPartnerData] = useState(null); 

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Initialize Peer Connection
  const initializePeerConnection = (partnerId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: partnerId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  const endCall = (emitEvent = true) => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (emitEvent && partnerData) {
      socket.emit('end-call', { to: partnerData.id });
    }
    setInCall(false);
    setReceivingCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setPartnerData(null);
    sessionStorage.removeItem('activeCall');
  };

  const startCall = async (partnerId, partnerName, partnerRole) => {
    setInCall(true);
    const pData = { id: partnerId, name: partnerName, role: partnerRole, isCaller: true };
    setPartnerData(pData);
    sessionStorage.setItem('activeCall', JSON.stringify(pData));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = initializePeerConnection(partnerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call-user', {
        userToCall: partnerId,
        offer: offer,
        callerId: user._id,
        callerName: user.name
      });
    } catch (err) {
      console.error('Error starting call', err);
      alert('Could not access camera/microphone.');
      endCall(false);
    }
  };

  const acceptCall = async () => {
    if (!callerData) return;
    setReceivingCall(false);
    setInCall(true);
    
    const pData = { id: callerData.callerId, name: callerData.callerName, role: 'Partner', isCaller: false };
    setPartnerData(pData);
    sessionStorage.setItem('activeCall', JSON.stringify(pData));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = initializePeerConnection(callerData.callerId);
      await pc.setRemoteDescription(new RTCSessionDescription(callerData.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('make-answer', {
        to: callerData.callerId,
        answer: answer
      });
    } catch (err) {
      console.error('Error accepting call', err);
      endCall(false);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!user) return;

    socket.on('call-made', async (data) => {
      if (inCall || receivingCall || sessionStorage.getItem('activeCall')) return;
      setCallerData(data);
      setReceivingCall(true);
    });

    socket.on('answer-made', async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socket.on('ice-candidate-received', async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('call-ended', () => {
      endCall(false);
    });

    return () => {
      socket.off('call-made');
      socket.off('answer-made');
      socket.off('ice-candidate-received');
      socket.off('call-ended');
    };
  }, [user, inCall, receivingCall]);

  // RELOAD RECOVERY LOGIC
  useEffect(() => {
    const checkRecovery = async () => {
      const savedCall = sessionStorage.getItem('activeCall');
      if (savedCall && user) {
        const pData = JSON.parse(savedCall);
        setPartnerData(pData);
        setInCall(true);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localStreamRef.current = stream;
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;

          const pc = initializePeerConnection(pData.id);
          
          if (pData.isCaller) {
            const offer = await pc.createOffer({ iceRestart: true });
            await pc.setLocalDescription(offer);
            socket.emit('reconnect-call-offer', { to: pData.id, offer: offer, from: user._id });
          } else {
             socket.emit('request-reconnect', { to: pData.id, from: user._id });
          }
        } catch(err) {
          console.error("Recovery failed", err);
          endCall(false);
        }
      }
    };
    if (user) checkRecovery();
  }, [user]);

  // Handle reconnect offer
  useEffect(() => {
    socket.on('reconnect-call-offer', async (data) => {
      if (!inCall || !partnerData) return;
      try {
        if (!peerConnectionRef.current) {
          initializePeerConnection(data.from);
        }
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('reconnect-call-answer', { to: data.from, answer: answer });
      } catch (err) {
        console.error("Error handling reconnect offer", err);
      }
    });

    socket.on('reconnect-call-answer', async (data) => {
      if (!inCall || !peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (err) {
        console.error("Error handling reconnect answer", err);
      }
    });

    socket.on('request-reconnect', async (data) => {
      if (!inCall || !peerConnectionRef.current) return;
      try {
        const offer = await peerConnectionRef.current.createOffer({ iceRestart: true });
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit('reconnect-call-offer', { to: data.from, offer: offer, from: user._id });
      } catch (err) {
        console.error("Error sending reconnect offer", err);
      }
    });

    return () => {
      socket.off('reconnect-call-offer');
      socket.off('reconnect-call-answer');
      socket.off('request-reconnect');
    };
  }, [inCall, partnerData, user]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  // Traps for back button (We allow F5 now for recovery)
  useEffect(() => {
    const handlePopState = (e) => {
      if (inCall) {
        window.history.pushState(null, document.title, window.location.href);
        alert('Action Blocked: Please end the video call before leaving the page.');
      }
    };
    if (inCall) {
      window.history.pushState(null, document.title, window.location.href);
      window.addEventListener('popstate', handlePopState);
    }
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [inCall]);

  return (
    <CallContext.Provider value={{ startCall, inCall }}>
      {children}

      <AnimatePresence>
        {inCall && partnerData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black flex flex-col">
            <div className="flex-1 relative">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-6 right-6 w-24 h-36 sm:w-32 sm:h-48 bg-gray-800 object-cover rounded-2xl border-2 border-white shadow-xl z-20" />
              
              <div className="absolute top-12 left-0 right-0 flex flex-col items-center z-10 drop-shadow-md">
                <h2 className="text-white text-3xl font-black">{partnerData.name}</h2>
                <p className="text-[#FF9F43] text-sm font-bold uppercase tracking-widest drop-shadow-md">{partnerData.role}</p>
              </div>

              <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-6 z-20">
                <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${isMuted ? 'bg-white text-gray-900' : 'bg-gray-800/80 backdrop-blur-md text-white border border-gray-600'}`}>
                  {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
                </button>
                <button onClick={() => endCall(true)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:bg-red-600 transition-all hover:scale-105">
                  <FaPhoneSlash size={24} />
                </button>
                <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${isVideoOff ? 'bg-white text-gray-900' : 'bg-gray-800/80 backdrop-blur-md text-white border border-gray-600'}`}>
                  {isVideoOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {receivingCall && !inCall && callerData && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed top-10 left-6 right-6 z-[9999] bg-white rounded-[30px] p-6 shadow-2xl border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Incoming Video Call</p>
              <h3 className="text-xl font-black text-gray-900 mt-1">{callerData.callerName}</h3>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setReceivingCall(false); socket.emit('end-call', { to: callerData.callerId }); }} className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100">
                <FaPhoneSlash />
              </button>
              <button onClick={acceptCall} className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 shadow-md">
                <FaVideo />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CallContext.Provider>
  );
};
