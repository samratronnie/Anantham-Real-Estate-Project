import React from 'react';
import { Listing } from '../types.ts';
import { ListingCard } from './ListingCard.tsx';
import { Layers, PlusCircle, SearchX } from 'lucide-react';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';

interface ListingGridProps {
  listings: Listing[];
  isLoading: boolean;
  activeCategory: string;
  searchKeyword: string;
  onResetFilters: () => void;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  isLoading,
  activeCategory,
  searchKeyword,
  onResetFilters,
}) => {
  const handlePostListingClick = () => {
    eventBus.emit(
      BUS_EVENTS.TRIGGER_POST_LISTING,
      { prefillCategory: activeCategory !== 'All Categories' ? activeCategory : undefined },
      'ListingGrid [Post Listing] CTA',
      'PostListingModal'
    );
  };

  return (
    <section id="listings-section" className="py-16 px-6 md:px-[10%] bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#f9b234] font-semibold text-sm mb-1 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Verified Marketplace</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1c2331]">
              {activeCategory && activeCategory !== 'All Categories'
                ? `${activeCategory} Listings`
                : 'Featured Listings'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">
              {listings.length} item{listings.length === 1 ? '' : 's'} available
            </span>
            <button
              onClick={handlePostListingClick}
              className="text-xs bg-[#f9b234]/15 hover:bg-[#f9b234]/25 text-[#1c2331] font-semibold px-3 py-1.5 rounded-md border border-[#f9b234]/40 transition flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#1c2331]" />
              <span>Add Your Item</span>
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="listing-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && listings.length === 0 && (
          <div className="bg-[#f8f9fa] rounded-2xl p-12 text-center max-w-lg mx-auto border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1c2331] mb-2">No Matching Listings Found</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              We couldn't find any listings matching{' '}
              {searchKeyword ? `"${searchKeyword}"` : ''}{' '}
              {activeCategory !== 'All Categories' ? `in ${activeCategory}` : ''}.
              Try adjusting your search keywords or post a new listing!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={onResetFilters}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition"
              >
                Reset All Filters
              </button>
              <button
                onClick={handlePostListingClick}
                className="px-4 py-2 bg-[#f9b234] text-[#1c2331] font-bold rounded-lg text-sm hover:bg-[#e5a12b] cursor-pointer transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Post First Listing in {activeCategory}
              </button>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && listings.length > 0 && (
          <div className="listing-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
