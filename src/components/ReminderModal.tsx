import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, X, Bell } from 'lucide-react';
import { Notification } from '../types';

interface Props {
  notification: Notification | null;
  onClose: () => void;
  onSetReminder: (notificationId: string, reminderTime: string) => void;
}

export default function ReminderModal({ notification, onClose, onSetReminder }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  if (!notification) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    const reminderTime = new Date(`${date}T${time}`).toISOString();
    onSetReminder(notification.id, reminderTime);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="vault-card w-full max-w-md p-8 shadow-2xl border-[var(--surface-border)]"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Set Smart Reminder</h3>
            </div>
            <button onClick={onClose} className="text-[#71717A] hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase font-bold text-[#71717A] tracking-widest mb-2">Subject</p>
            <p className="text-sm text-white/90 font-medium truncate">{notification.app}: {notification.sender}</p>
            <p className="text-xs text-[#71717A] mt-1 line-clamp-1 italic">"{notification.content}"</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-2 ml-1">Select Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-[var(--surface-border)] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-2 ml-1">Select Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white/5 border border-[var(--surface-border)] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--accent)] hover:opacity-90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 shadow-lg shadow-[var(--accent)]/20"
            >
              <Bell className="w-4 h-4" />
              CONFIRM REMINDER
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
