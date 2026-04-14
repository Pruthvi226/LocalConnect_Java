import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, Save, Calendar, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' },
];

const AvailabilityManager = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const res = await api.get('/provider/availability');
      setShifts(res.data || []);
    } catch (err) {
      console.error('Failed to load shifts', err);
    } finally {
      setLoading(false);
    }
  };

  const addShift = (dayId) => {
    const newShift = {
      dayOfWeek: dayId,
      startTime: '09:00:00',
      endTime: '17:00:00',
      isActive: true,
      tempId: Date.now()
    };
    setShifts([...shifts, newShift]);
  };

  const removeShift = (idx) => {
    setShifts(shifts.filter((_, i) => i !== idx));
  };

  const updateShift = (idx, field, value) => {
    const newShifts = [...shifts];
    newShifts[idx][field] = value;
    setShifts(newShifts);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/provider/availability', shifts);
      toast.success('Working hours updated successfully! 🚀');
    } catch (err) {
      toast.error('Failed to save working hours.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-40 flex items-center justify-center"><Clock className="animate-spin text-primary-500" /></div>;

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Calendar className="w-6 h-6 text-primary-500" /> Working Hours
          </h2>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Define your weekly service windows</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Shifts</>}
        </button>
      </div>

      <div className="space-y-6">
        {DAYS.map(day => {
          const dayShifts = shifts.filter(s => s.dayOfWeek === day.id);
          return (
            <div key={day.id} className="group p-6 rounded-[2rem] border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-primary-100 transition-all">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-32 font-black text-slate-800 uppercase tracking-tighter text-sm">{day.name}</div>
                
                <div className="flex-1 space-y-3">
                  {dayShifts.length === 0 ? (
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Off Work</div>
                  ) : (
                    dayShifts.map((shift, sIdx) => {
                      const globalIdx = shifts.indexOf(shift);
                      return (
                        <motion.div 
                          layout
                          key={globalIdx}
                          className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
                        >
                          <Clock className="w-4 h-4 text-primary-400" />
                          <input 
                            type="time" 
                            step="3600"
                            value={shift.startTime.slice(0,5)}
                            onChange={(e) => updateShift(globalIdx, 'startTime', e.target.value + ':00')}
                            className="bg-transparent font-bold text-slate-700 focus:outline-none"
                          />
                          <span className="text-slate-300 font-black">to</span>
                          <input 
                            type="time" 
                            step="3600"
                            value={shift.endTime.slice(0,5)}
                            onChange={(e) => updateShift(globalIdx, 'endTime', e.target.value + ':00')}
                            className="bg-transparent font-bold text-slate-700 focus:outline-none"
                          />
                          <button 
                            onClick={() => removeShift(globalIdx)}
                            className="ml-auto p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                <button 
                  onClick={() => addShift(day.id)}
                  className="p-3 bg-white border border-slate-100 rounded-xl text-primary-600 hover:bg-primary-50 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
         <ShieldCheck className="w-6 h-6 text-indigo-500 mt-1" />
         <div>
            <p className="text-indigo-900 font-black text-xs uppercase tracking-widest leading-none mb-1">Smart Scheduling Active</p>
            <p className="text-indigo-700 text-xs font-medium opacity-80 leading-relaxed">
               Bookings outside these hours will be automatically blocked or flagged for AI rescheduling. 
               We recommend setting at least 4 hours of availability per day.
            </p>
         </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;
