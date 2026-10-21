import React from 'react';
import { Search, PlusCircle, ArrowDown } from 'lucide-react';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';

export const Hero: React.FC = () => {
  const handleBrowseClick = () => {
    // Talk to Search & Listing grid dynamically
    eventBus.emit(
      BUS_EVENTS.NAVIGATE_TO_BROWSE,
      { targetSection: 'search-section', timestamp: Date.now() },
      'Hero [Browse Listings] Button',
      'SearchSection & ListingGrid'
    );
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
      const input = searchSection.querySelector('input');
      if (input) input.focus();
    }
  };

  const handlePostPropertyClick = () => {
    // Talk to PostListingModal dynamically
    eventBus.emit(
      BUS_EVENTS.TRIGGER_POST_LISTING,
      { prefillCategory: 'House', defaultTitle: 'Premium Residential Property' },
      'Hero [Post Property] Button',
      'PostListingModal'
    );
  };

  return (
    <section className="hero">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-md">
          Buy, Sell &amp; Rent Anything Legal
        </h1>

        <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
          Properties, Cars, Bikes, Household Products, Curios and Antiques in one trusted marketplace.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={handleBrowseClick}
            className="primary-btn shadow-lg group"
            id="hero-browse-btn"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Browse Listings</span>
            <ArrowDown className="w-4 h-4 ml-1 opacity-70 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={handlePostPropertyClick}
            className="secondary-btn shadow-lg group"
            id="hero-post-property-btn"
          >
            <PlusCircle className="w-5 h-5 text-[#f9b234] group-hover:rotate-90 transition-transform" />
            <span>Post Property</span>
          </button>
        </div>
      </div>
    </section>
  );
};
