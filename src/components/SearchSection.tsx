import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Filter, Sparkles } from 'lucide-react';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';
import { Category } from '../types.ts';

interface SearchSectionProps {
  selectedCategory: string;
  searchKeyword: string;
  onSearchChange: (keyword: string, category: string) => void;
  resultCount: number;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  selectedCategory,
  searchKeyword,
  onSearchChange,
  resultCount,
}) => {
  const [keyword, setKeyword] = useState(searchKeyword);
  const [category, setCategory] = useState(selectedCategory);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes from external event listeners
  useEffect(() => {
    setCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  // Listen to custom bus events
  useEffect(() => {
    const unbindCategory = eventBus.on(BUS_EVENTS.CATEGORY_FILTER_CHANGE, (data: { category: string }) => {
      if (data?.category) {
        setCategory(data.category);
        onSearchChange(keyword, data.category);
      }
    });

    const unbindBrowse = eventBus.on(BUS_EVENTS.NAVIGATE_TO_BROWSE, () => {
      inputRef.current?.focus();
    });

    return () => {
      unbindCategory();
      unbindBrowse();
    };
  }, [keyword, onSearchChange]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchChange(keyword, category);
    eventBus.emit(
      BUS_EVENTS.SEARCH_QUERY_CHANGE,
      { keyword: keyword.trim(), category },
      'SearchSection [Search] Button',
      'ListingGrid'
    );
  };

  const handleClear = () => {
    setKeyword('');
    setCategory('All Categories');
    onSearchChange('', 'All Categories');
    eventBus.emit(
      BUS_EVENTS.SEARCH_QUERY_CHANGE,
      { keyword: '', category: 'All Categories' },
      'SearchSection [Reset] Button',
      'ListingGrid'
    );
  };

  const hasActiveFilter = keyword.trim().length > 0 || (category && category !== 'All Categories');

  return (
    <section id="search-section" className="py-12 px-6 md:px-[10%] bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#f9b234]" />
            <h2 className="text-2xl md:text-3xl font-bold text-[#1c2331]">Search Listings</h2>
          </div>
          <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
            <span>Showing <strong className="text-[#1c2331] font-bold">{resultCount}</strong> available listings</span>
            {hasActiveFilter && (
              <button
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-800 underline flex items-center gap-1 cursor-pointer ml-2"
                title="Reset search and filters"
              >
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="search-box flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by Keywords (e.g., Luxury House, SUV, Kolkata, Teakwood...)"
              value={keyword}
              onChange={(e) => {
                const val = e.target.value;
                setKeyword(val);
                // Real-time filtering as user types
                onSearchChange(val, category);
              }}
              className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#f9b234] focus:border-transparent transition"
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              const val = e.target.value;
              setCategory(val);
              onSearchChange(keyword, val);
              eventBus.emit(
                BUS_EVENTS.CATEGORY_FILTER_CHANGE,
                { category: val },
                'SearchSection [Category Select]',
                'ListingGrid'
              );
            }}
            className="w-full md:w-56 px-4 py-3 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm md:text-base text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#f9b234] focus:border-transparent cursor-pointer transition"
          >
            <option value="All Categories">All Categories</option>
            <option value="Land">Land</option>
            <option value="House">House</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Commercial">Commercial</option>
            <option value="Household">Household</option>
            <option value="Curios">Curios</option>
          </select>

          <button
            type="submit"
            className="bg-[#1c2331] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#283244] transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <SearchIcon className="w-4 h-4 text-[#f9b234]" />
            <span>Search</span>
          </button>
        </form>
      </div>
    </section>
  );
};
