import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Tag, DollarSign, MapPin, FileText, Image as ImageIcon, User, Phone, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Category, Listing } from '../types.ts';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';
import { validateTitle, validateLocation, validatePrice, validateName, validatePhone, formatIndianCurrency } from '../utils/validation.ts';
import { addListing } from '../services/firebase.ts';

interface PostListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillCategory?: Category;
}

const PRESET_IMAGES = [
  { label: 'Modern House', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Luxury SUV', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' },
  { label: 'Royal Bike', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80' },
  { label: 'Commercial Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Teak Furniture', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80' },
  { label: 'Antique Curio', url: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?auto=format&fit=crop&w=600&q=80' },
];

export const PostListingModal: React.FC<PostListingModalProps> = ({
  isOpen,
  onClose,
  prefillCategory,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(prefillCategory || 'House');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [sellerName, setSellerName] = useState('');
  const [sellerContact, setSellerContact] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (prefillCategory) {
      setCategory(prefillCategory);
    }
  }, [prefillCategory]);

  // Real-time field validations
  const titleValidation = validateTitle(title);
  const locationValidation = validateLocation(location);
  const priceValidation = validatePrice(price);
  const nameValidation = validateName(sellerName);
  const phoneValidation = validatePhone(sellerContact);
  const descriptionValid = description.trim().length >= 10;

  const isFormValid =
    titleValidation.isValid &&
    locationValidation.isValid &&
    priceValidation.isValid &&
    nameValidation.isValid &&
    phoneValidation.isValid &&
    descriptionValid;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      title: true,
      price: true,
      location: true,
      description: true,
      sellerName: true,
      sellerContact: true,
    });

    if (!isFormValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const numericPrice = parseFloat(price.replace(/,/g, ''));
    const newListing: Listing = {
      id: `listing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      category,
      price: numericPrice,
      priceFormatted: priceValidation.formatted || formatIndianCurrency(numericPrice),
      location: location.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
      sellerName: sellerName.trim(),
      sellerContact: sellerContact.trim(),
      createdAt: new Date().toISOString(),
      featured: false,
    };

    try {
      // Live Firestore storage sync
      await addListing(newListing);

      // Inter-button dynamic event broadcast
      eventBus.emit(
        BUS_EVENTS.LISTING_CREATED,
        { listing: newListing },
        'PostListingModal [Publish] Button',
        'ListingGrid & SearchSection'
      );

      // Reset form
      setTitle('');
      setPrice('');
      setLocation('');
      setDescription('');
      setSellerName('');
      setSellerContact('');
      setTouched({});
      onClose();
    } catch (err) {
      console.error('Failed to post listing:', err);
      setSubmitError('Failed to publish listing to the live database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content-box bg-white max-w-lg">
        <button
          onClick={onClose}
          className="close-btn absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#f9b234] uppercase tracking-wider mb-1">
            <PlusCircle className="w-4 h-4" />
            <span>Marketplace Submission</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1c2331]">Post New Listing</h2>
          <p className="text-xs text-gray-500">
            Publish your property, vehicle, or item to the live multi-device database.
          </p>
        </div>

        {submitError && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Title */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
              <label htmlFor="post-title">Listing Title *</label>
              {touched.title && (
                <span className={`text-[11px] ${titleValidation.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                  {titleValidation.isValid ? '✓ Valid' : titleValidation.error}
                </span>
              )}
            </div>
            <input
              id="post-title"
              type="text"
              placeholder="e.g. 3BHK Luxury Flat or 2023 Royal Enfield"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title')}
              className="w-full px-3 py-2.5 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
            />
          </div>

          {/* Category & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="post-category" className="block text-xs font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2.5 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
              >
                <option value="Land">Land</option>
                <option value="House">House</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Commercial">Commercial</option>
                <option value="Household">Household</option>
                <option value="Curios">Curios</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="post-price">Price (₹ INR) *</label>
                {touched.price && (
                  <span className={`text-[11px] ${priceValidation.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                    {priceValidation.isValid ? priceValidation.formatted : priceValidation.error}
                  </span>
                )}
              </div>
              <input
                id="post-price"
                type="number"
                placeholder="e.g. 7500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => handleBlur('price')}
                className="w-full px-3 py-2.5 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
              <label htmlFor="post-location">City &amp; State *</label>
              {touched.location && (
                <span className={`text-[11px] ${locationValidation.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                  {locationValidation.isValid ? '✓ Valid' : locationValidation.error}
                </span>
              )}
            </div>
            <input
              id="post-location"
              type="text"
              placeholder="e.g. Kolkata, West Bengal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={() => handleBlur('location')}
              className="w-full px-3 py-2.5 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
              <label htmlFor="post-desc">Detailed Description *</label>
              <span className={`text-[11px] ${descriptionValid ? 'text-emerald-600' : 'text-gray-400'}`}>
                {description.length}/10 min chars
              </span>
            </div>
            <textarea
              id="post-desc"
              rows={2}
              placeholder="Provide specifications, condition, papers, features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleBlur('description')}
              className="w-full px-3 py-2 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
            />
          </div>

          {/* Quick Preset Photos */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Select Photo Preset or Paste Image URL
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`text-[11px] p-1.5 rounded border truncate cursor-pointer transition ${
                    imageUrl === preset.url
                      ? 'border-[#f9b234] bg-amber-50 font-bold text-[#1c2331]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9fa] border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#f9b234]"
            />
          </div>

          {/* Seller Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="post-seller-name">Seller / Broker Name *</label>
                {touched.sellerName && (
                  <span className={`text-[10px] ${nameValidation.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {nameValidation.isValid ? '✓' : 'Invalid'}
                  </span>
                )}
              </div>
              <input
                id="post-seller-name"
                type="text"
                placeholder="Your Name"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                onBlur={() => handleBlur('sellerName')}
                className="w-full px-3 py-2 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="post-seller-phone">Contact Mobile *</label>
                {touched.sellerContact && (
                  <span className={`text-[10px] ${phoneValidation.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {phoneValidation.isValid ? '✓' : 'Invalid'}
                  </span>
                )}
              </div>
              <input
                id="post-seller-phone"
                type="tel"
                placeholder="10-digit number"
                value={sellerContact}
                onChange={(e) => setSellerContact(e.target.value)}
                onBlur={() => handleBlur('sellerContact')}
                className="w-full px-3 py-2 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow ${
              isFormValid
                ? 'bg-[#1c2331] text-[#f9b234] hover:bg-[#283244] shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#f9b234]" />
                <span>Publishing to Live Database...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-[#f9b234]" />
                <span>Publish Listing to Marketplace</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
