import React from 'react';
import { motion } from 'motion/react';
import { Info, Plus, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  isVisible: boolean;
  onDismiss: () => void;
}

export default function Onboarding({ isVisible, onDismiss }: Props) {
  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card bg-gradient-to-br from-[var(--accent)]/10 to-transparent border-[var(--accent)]/20 mb-8"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[var(--accent)] rounded-2xl text-white shadow-lg shadow-[var(--accent)]/20">
          <Zap className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-white mb-2">Welcome to AI Vault Alpha</h3>
            <button onClick={onDismiss} className="text-[#71717A] hover:text-white transition-colors text-xl font-bold">&times;</button>
          </div>
          <p className="text-[#71717A] text-sm leading-relaxed mb-6">
            This is a secure preview environment. Due to browser privacy restrictions, real-time capture of external apps is simulated in this build.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/5 rounded-lg text-[var(--accent)]">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Step 1: Inject</p>
                <p className="text-[11px] text-[#71717A]">Use the blue (+) button below to simulate incoming signals.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/5 rounded-lg text-[#10B981]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Step 2: Classify</p>
                <p className="text-[11px] text-[#71717A]">Gemini AI will automatically sort and decrypt the payload.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/5 rounded-lg text-[#FBBF24]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Step 3: Secure</p>
                <p className="text-[11px] text-[#71717A]">View daily insights and set smart reminders for any signal.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
