import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { AISummary } from '../types';

export default function AIInsight({ summary, isLoading }: { summary: AISummary | null, isLoading: boolean }) {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <span className="text-[12px] font-semibold uppercase tracking-widest text-[#71717A]">AI Summary</span>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-white/5 rounded w-3/4" />
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-6 w-16 bg-white/5 rounded" />)}
          </div>
        </div>
      ) : summary ? (
        <>
          <h2 className="text-2xl font-semibold text-white mb-2 leading-tight">
            {summary.urgentCount > 0 
              ? `${summary.urgentCount} urgent signal${summary.urgentCount > 1 ? 's' : ''} intercepted.` 
              : "Digital perimeter secure."}
          </h2>
          <p className="text-[14px] text-[#71717A] mb-6">
            {summary.summaryText}. Your digital space is clean and protected.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.breakdown).map(([key, val]) => (
              <div key={key} className="bg-white/5 border border-[#262629] px-3 py-1 rounded-lg text-[12px] font-medium">
                {val} {key}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-[#71717A] italic text-sm">No recent activity detected in the intelligence layer.</p>
      )}
    </div>
  );
}
