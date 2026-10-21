import React from 'react';
import { Building2, Heart, ShieldAlert, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1c2331] text-white text-center py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-center gap-2 text-2xl font-black text-[#f9b234]">
          <Building2 className="w-6 h-6" />
          <span>Anantham Marketplace</span>
        </div>
        <p className="text-gray-300 text-sm md:text-base max-w-lg mx-auto">
          Connecting Buyers, Sellers and Brokers Across India
        </p>

        <div className="pt-6 border-t border-slate-800 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Anantham Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-200 cursor-pointer">Terms &amp; Conditions</span>
            <span className="hover:text-gray-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-200 cursor-pointer">Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
