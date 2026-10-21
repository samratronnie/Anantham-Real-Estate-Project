import React from 'react';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';

interface CategoryGridProps {
  activeCategory: string;
}

interface CategoryItem {
  id: string;
  name: string;
  mappedCategory: string;
  icon: string;
  countHint: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'land-house', name: 'Land & House', mappedCategory: 'House', icon: '🏠', countHint: 'Residential & Plots' },
  { id: 'cars', name: 'Cars', mappedCategory: 'Car', icon: '🚗', countHint: 'SUVs, Sedans & Hatchbacks' },
  { id: 'bikes', name: 'Bikes', mappedCategory: 'Bike', icon: '🏍', countHint: 'Cruisers & Commuters' },
  { id: 'commercial', name: 'Commercial', mappedCategory: 'Commercial', icon: '🏢', countHint: 'Offices & Retail' },
  { id: 'household', name: 'Household', mappedCategory: 'Household', icon: '🪑', countHint: 'Furniture & Appliances' },
  { id: 'curios', name: 'Curios', mappedCategory: 'Curios', icon: '🏺', countHint: 'Antiques & Collectibles' },
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({ activeCategory }) => {
  const handleCategoryClick = (cat: CategoryItem) => {
    // Talk to Search and Listings components
    eventBus.emit(
      BUS_EVENTS.CATEGORY_FILTER_CHANGE,
      { category: cat.mappedCategory },
      `CategoryGrid [${cat.name}] Card`,
      'SearchSection & ListingGrid'
    );
    // Smooth scroll to listings
    const listingSection = document.getElementById('listings-section');
    if (listingSection) {
      listingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 px-6 md:px-[10%] bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1c2331] mb-3">Popular Categories</h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
            Click any category to dynamically filter the marketplace listings below
          </p>
        </div>

        <div className="category-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.mappedCategory || (activeCategory === 'All Categories' && false);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`category-card text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-2 cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                  isActive ? 'border-[#f9b234] bg-amber-50/50 shadow-md ring-2 ring-[#f9b234]/30' : 'border-transparent hover:border-amber-300'
                }`}
                title={`Filter by ${cat.name}`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200" role="img" aria-label={cat.name}>
                  {cat.icon}
                </span>
                <span className="font-bold text-[#1c2331] text-sm md:text-base mt-1 group-hover:text-[#f9b234] transition-colors">
                  {cat.name}
                </span>
                <span className="text-[11px] text-gray-500 hidden sm:block">
                  {cat.countHint}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
