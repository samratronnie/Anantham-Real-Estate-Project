import React from 'react';
import { Percent, Shield, HeartHandshake } from 'lucide-react';

export const CommissionBanner: React.FC = () => {
  return (
    <section className="commission py-16 px-6 md:px-[10%] bg-[#e9ecef] text-center border-t border-b border-gray-300">
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1c2331] text-[#f9b234] mb-4 shadow">
          <Percent className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#1c2331] mb-3">Commission Policy</h2>
        <p className="text-gray-700 text-base md:text-lg leading-relaxed">
          Successful deals completed through Anantham will attract only{' '}
          <strong className="text-[#1c2331] font-extrabold underline decoration-[#f9b234] decoration-4">
            1.5% Commission
          </strong>{' '}
          of the final transaction value. Transparent, zero hidden charges, with escrow support.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600 font-medium">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" /> Verified Buyers &amp; Sellers
          </span>
          <span className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-600" /> Direct Broker Assistance
          </span>
        </div>
      </div>
    </section>
  );
};
