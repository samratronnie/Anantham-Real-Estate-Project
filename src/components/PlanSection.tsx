import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';

interface PlanSectionProps {
  onSubscribe: () => void;
  isSubscribed?: boolean;
}

export const PlanSection: React.FC<PlanSectionProps> = ({ onSubscribe, isSubscribed }) => {
  const handleSubscribeClick = () => {
    eventBus.emit(
      BUS_EVENTS.TRIGGER_SUBSCRIPTION,
      { plan: 'Basic Plan', price: 199 },
      'PlanSection [Subscribe Now] Button',
      'SubscriptionModal'
    );
    onSubscribe();
  };

  return (
    <section id="plans-section" className="py-20 px-6 md:px-[10%] bg-[#f8f9fa]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1c2331] mb-3">
          Seller Subscription
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto mb-10 text-sm md:text-base">
          Boost your listings, manage buyer appointments, and access verified broker leads.
        </p>

        <div className="plan-card bg-white p-8 md:p-12 text-center max-w-md mx-auto rounded-2xl shadow-lg border-2 border-[#f9b234] relative">
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#f9b234] text-[#1c2331] text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow">
            Most Popular For Sellers
          </div>

          <h3 className="text-xl font-bold text-gray-800 mt-2">Basic Plan</h3>
          <div className="my-5">
            <span className="text-4xl md:text-5xl font-black text-[#1c2331]">₹199</span>
            <span className="text-gray-500 font-semibold text-base"> / Month</span>
          </div>

          <ul className="text-left space-y-3 mb-8 text-sm text-gray-700">
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span><strong>25 Active Listings</strong> simultaneously</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Appointment Management with calendar sync</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Direct Lead Generation notifications</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Seller Dashboard Access &amp; analytics</span>
            </li>
          </ul>

          <button
            onClick={handleSubscribeClick}
            className={`w-full py-3.5 px-6 font-bold rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              isSubscribed
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-[#1c2331] text-[#f9b234] hover:bg-[#283244] hover:scale-[1.02]'
            }`}
          >
            {isSubscribed ? (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Subscription Active</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                <span>Subscribe to Basic Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
