import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Briefcase, Bell, Users, ShieldCheck, Clock } from 'lucide-react';
import { Notification, Category } from '../types';

const categoryConfig: Record<Category, { color: string; bg: string }> = {
  Personal: { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.1)' },
  Work: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.1)' },
  Important: { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.1)' },
  Social: { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.1)' },
  Other: { color: '#71717A', bg: 'rgba(113, 113, 122, 0.1)' },
};

interface Props {
  notification: Notification;
  onReminderClick?: (notification: Notification) => void;
}

export default function NotificationItem({ notification, onReminderClick }: Props) {
  const config = categoryConfig[notification.category];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-4 flex gap-4 group"
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5" 
        style={{ backgroundColor: config.color, opacity: 0.9 }}
      >
        <span className="text-black font-bold text-xs">
          {notification.app.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="text-[14px] font-medium text-white truncate">{notification.app}</h4>
          <span className="text-[11px] text-[#71717A]">
            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-[13px] text-[#71717A] truncate">
          {notification.sender}: {notification.content}
        </p>
      </div>

      {onReminderClick && (
        <button
          onClick={() => onReminderClick(notification)}
          className="p-2 text-[#71717A] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Set Reminder"
        >
          <Clock className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
