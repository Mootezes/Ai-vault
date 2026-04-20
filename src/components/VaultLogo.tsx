import React from 'react';
import { Shield, Lock } from 'lucide-react';

export default function VaultLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#9333EA] rounded-lg border border-white/10 flex items-center justify-center font-bold text-white shadow-lg">
          V
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white leading-none">AI Vault</h1>
        <p className="text-[12px] text-[#71717A] font-medium tracking-tight mt-0.5">Your private intelligence layer</p>
      </div>
    </div>
  );
}
