import React from 'react';
import { MapPin, Calendar, Tag, ShieldCheck, Phone } from 'lucide-react';
import { Listing } from '../types.ts';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const handleBookAppointment = () => {
    // Dynamic inter-button event dispatch: communicate listing details to AppointmentModal
    eventBus.emit(
      BUS_EVENTS.LISTING_SELECT_FOR_APPOINTMENT,
      { listing },
      `ListingCard [${listing.title}] Button`,
      'AppointmentModal'
    );
  };

  return (
    <article className="listing-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 group">
      {/* Listing Image */}
      <div className="relative overflow-hidden h-52 bg-gray-100">
        <img
          src={listing.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute top-3 left-3 bg-[#1c2331]/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
          <Tag className="w-3 h-3 text-[#f9b234]" />
          <span>{listing.category}</span>
        </div>
        {listing.featured && (
          <div className="absolute top-3 right-3 bg-[#f9b234] text-[#1c2331] text-[11px] font-bold px-2 py-0.5 rounded shadow">
            Featured
          </div>
        )}
      </div>

      {/* Listing Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1c2331] group-hover:text-[#e5a12b] transition-colors line-clamp-1 mb-1">
            {listing.title}
          </h3>

          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4 text-rose-500 mr-1 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          {listing.description && (
            <p className="text-gray-600 text-xs line-clamp-2 mb-3 leading-relaxed">
              {listing.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Price</span>
            <h4 className="text-xl font-extrabold text-[#1c2331]">
              {listing.priceFormatted || `₹${listing.price.toLocaleString('en-IN')}`}
            </h4>
          </div>

          {listing.sellerName && (
            <div className="text-right text-[11px] text-gray-500">
              <span className="block text-gray-400">Seller</span>
              <span className="font-semibold text-gray-700 truncate max-w-[100px] inline-block">{listing.sellerName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button that talks to Appointment Modal */}
      <div className="px-5 pb-5 pt-1">
        <button
          onClick={handleBookAppointment}
          className="w-full py-2.5 px-4 bg-[#1c2331] text-white hover:bg-[#283244] font-semibold rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow hover:shadow-md cursor-pointer group/btn"
          aria-label={`Book appointment for ${listing.title}`}
        >
          <Calendar className="w-4 h-4 text-[#f9b234] group-hover/btn:scale-110 transition-transform" />
          <span>Book Appointment</span>
        </button>
      </div>
    </article>
  );
};
