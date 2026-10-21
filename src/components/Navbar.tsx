import React, { useState, useEffect } from 'react';
import { Building2, PlusCircle, CalendarCheck, Radio, Sparkles } from 'lucide-react';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';

interface NavbarProps {
  appointmentCount: number;
  isDbConnected: boolean;
  onOpenAppointments: () => void;
  onToggleMonitor: () => void;
  showMonitor: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  appointmentCount,
  isDbConnected,
  onOpenAppointments,
  onToggleMonitor,
  showMonitor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePostListingClick = () => {
    eventBus.emit(
      BUS_EVENTS.TRIGGER_POST_LISTING,
      { timestamp: Date.now() },
      'Navbar [Post Listing] Button',
      'PostListingModal'
    );
  };

  const handleCategoryNav = (cat: string) => {
    eventBus.emit(
      BUS_EVENTS.CATEGORY_FILTER_CHANGE,
      { category: cat },
      `Navbar NavLink [${cat}]`,
      'ListingGrid & SearchSection'
    );
    // Smooth scroll to listings section
    document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <nav className="bg-[#1c2331] text-white px-3 sm:px-6 md:px-12 py-3 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div 
          className="logo cursor-pointer select-none text-xl sm:text-2xl md:text-3xl font-bold text-[#f9b234] shrink-0"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            eventBus.emit(BUS_EVENTS.CATEGORY_FILTER_CHANGE, { category: 'All Categories' }, 'Navbar Logo', 'App');
          }}
          title="Return to Top"
        >
          <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#f9b234]" />
          <span>Anantham</span>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center gap-6 list-none text-sm font-medium">
          <li>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                eventBus.emit(BUS_EVENTS.CATEGORY_FILTER_CHANGE, { category: 'All Categories' }, 'Nav Home', 'App');
              }}
              className="text-gray-200 hover:text-[#f9b234] transition-colors cursor-pointer"
            >
              Home
            </button>
          </li>
          <li>
            <button
              onClick={() => handleCategoryNav('House')}
              className="text-gray-200 hover:text-[#f9b234] transition-colors cursor-pointer"
            >
              Properties
            </button>
          </li>
          <li>
            <button
              onClick={() => handleCategoryNav('Car')}
              className="text-gray-200 hover:text-[#f9b234] transition-colors cursor-pointer"
            >
              Vehicles
            </button>
          </li>
          <li>
            <button
              onClick={() => handleCategoryNav('Household')}
              className="text-gray-200 hover:text-[#f9b234] transition-colors cursor-pointer"
            >
              Household
            </button>
          </li>
          <li>
            <button
              onClick={() => handleCategoryNav('Curios')}
              className="text-gray-200 hover:text-[#f9b234] transition-colors cursor-pointer"
            >
              Curios
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-200 hover:text-[#f9b234] transition-colors cursor-pointer"
            >
              Plans
            </button>
          </li>
        </ul>

        {/* Action Controls & Firebase Status */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Live DB indicator */}
          <div 
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-800/80 border border-slate-700 text-gray-300"
            title={isDbConnected ? 'Firebase Firestore Live Sync Active' : 'Connecting to Firestore...'}
          >
            <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isDbConnected ? 'Live Firestore' : 'Connecting...'}</span>
          </div>

          {/* Event Stream Inspector Toggle */}
          <button
            onClick={onToggleMonitor}
            className={`flex items-center gap-1 text-xs px-2 sm:px-2.5 py-1.5 rounded-md border transition-all cursor-pointer ${
              showMonitor
                ? 'bg-[#f9b234]/20 border-[#f9b234] text-[#f9b234]'
                : 'bg-slate-800 border-slate-700 text-gray-300 hover:text-white'
            }`}
            title="Inspect Dynamic Button Event Packets"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#f9b234]" />
            <span className="hidden sm:inline">Events</span>
          </button>

          {/* Appointments Drawer Button */}
          <button
            onClick={onOpenAppointments}
            className="relative flex items-center gap-1 text-xs px-2 sm:px-3 py-1.5 rounded-md bg-slate-800 text-gray-200 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title="View Appointments Log"
          >
            <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f9b234]" />
            <span className="hidden sm:inline">Bookings</span>
            {appointmentCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-[#f9b234] text-[#1c2331] font-bold rounded-full text-[10px]">
                {appointmentCount}
              </span>
            )}
          </button>

          {/* Post Listing CTA */}
          <button
            onClick={handlePostListingClick}
            className="post-btn flex items-center gap-1 text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2 cursor-pointer font-bold shrink-0"
            aria-label="Post a new listing"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Post Listing</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
