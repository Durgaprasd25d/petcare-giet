import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaSyringe, FaPlus, FaHistory } from 'react-icons/fa';

const PetDetail = ({ pet }) => {
  const [activeTab, setActiveTab] = useState('medical');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-white/10">
        <TabBtn 
          active={activeTab === 'medical'} 
          onClick={() => setActiveTab('medical')} 
          label="Medical History" icon={<FaHeartbeat />} 
        />
        <TabBtn 
          active={activeTab === 'vaccine'} 
          onClick={() => setActiveTab('vaccine')} 
          label="Vaccinations" icon={<FaSyringe />} 
        />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'medical' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><FaHistory /> Records</h3>
              <button className="text-amber-400 text-sm flex items-center gap-1 hover:underline">
                <FaPlus /> Add Record
              </button>
            </div>
            {pet.medicalHistory?.length > 0 ? (
              pet.medicalHistory.map((record, i) => (
                <div key={i} className="glass-card p-4 border-l-2 border-amber-500">
                  <div className="flex justify-between">
                    <h4 className="font-bold">{record.condition}</h4>
                    <span className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{record.treatment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-8">No medical history recorded.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><FaSyringe /> Vaccinations</h3>
            </div>
            {pet.vaccinationRecords?.length > 0 ? (
              pet.vaccinationRecords.map((vax, i) => (
                <div key={i} className="glass-card p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{vax.vaccine}</h4>
                    <p className="text-xs text-gray-400">Date: {new Date(vax.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-amber-400 font-bold">Next Due</p>
                    <p className="text-sm">{new Date(vax.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-8">No vaccination records found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`pb-4 px-2 flex items-center gap-2 transition-all ${
      active ? 'border-b-2 border-amber-500 text-amber-400 font-bold' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    {icon} {label}
  </button>
);

export default PetDetail;
