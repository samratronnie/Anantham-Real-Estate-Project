import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Phone, CheckCircle2, AlertCircle, Loader2, Sparkles, Building2 } from 'lucide-react';
import { Listing, Appointment } from '../types.ts';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';
import { validateName, validateEmail, validatePhone, validateDate } from '../utils/validation.ts';
import { bookAppointment } from '../services/firebase.ts';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedListing: Listing | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedListing: initialListing,
}) => {
  const [listing, setListing] = useState<Listing | null>(initialListing);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');

  // Touched state to control when to show error indicators
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<Appointment | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync initial listing
  useEffect(() => {
    if (initialListing) {
      setListing(initialListing);
    }
  }, [initialListing]);

  // Real-time validation checks
  const nameValidation = validateName(fullName);
  const emailValidation = validateEmail(email);
  const phoneValidation = validatePhone(phone);
  const dateValidation = validateDate(date);

  const isFormValid =
    nameValidation.isValid &&
    emailValidation.isValid &&
    phoneValidation.isValid &&
    dateValidation.isValid;

  // Listen to dynamic event bus when a listing's "Book Appointment" button communicates
  useEffect(() => {
    const unbind = eventBus.on(
      BUS_EVENTS.LISTING_SELECT_FOR_APPOINTMENT,
      (data: { listing: Listing }, payload) => {
        if (data?.listing) {
          setListing(data.listing);
          setSubmitSuccess(null);
          setSubmitError(null);
        }
      }
    );
    return () => unbind();
  }, []);

  // Set today's date string as minimum for the date picker
  const todayStr = new Date().toISOString().split('T')[0];

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, date: true });

    if (!isFormValid || !listing) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date,
      listingId: listing.id,
      listingTitle: listing.title,
      listingLocation: listing.location,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      // Live Firestore storage sync
      await bookAppointment(newAppointment);

      // Dynamic inter-button event dispatch: broadcast appointment creation
      eventBus.emit(
        BUS_EVENTS.APPOINTMENT_SUBMITTED,
        { appointment: newAppointment },
        'AppointmentModal [Submit Request] Button',
        'AppointmentsDrawer & ToastManager'
      );

      setSubmitSuccess(newAppointment);
      // Reset form fields
      setFullName('');
      setEmail('');
      setPhone('');
      setDate('');
      setTouched({});
    } catch (err) {
      console.error('Failed to book appointment:', err);
      setSubmitError('Failed to record appointment in live database. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="appointmentModal"
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-content-box bg-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="close-btn absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#f9b234] uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Schedule Viewing</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1c2331]">Book Appointment</h2>
        </div>

        {/* Exchanged Listing Data Context Card */}
        {listing ? (
          <div className="bg-[#f8f9fa] border border-gray-200 rounded-lg p-3.5 mb-5 flex items-center gap-3">
            <img
              src={listing.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
              alt={listing.title}
              className="w-14 h-14 rounded-md object-cover border border-gray-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-[#f9b234] uppercase tracking-wider block">
                Selected Listing
              </span>
              <h4 className="font-bold text-gray-900 text-sm truncate">{listing.title}</h4>
              <p className="text-xs text-gray-500 truncate">{listing.location}</p>
              <p className="text-xs font-extrabold text-[#1c2331] mt-0.5">
                {listing.priceFormatted || `₹${listing.price.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 shrink-0" />
            <span>General Marketplace Appointment</span>
          </div>
        )}

        {/* Success Confirmation State */}
        {submitSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#1c2331] mb-1">Appointment Confirmed!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your appointment request for <strong>{submitSuccess.listingTitle}</strong> on{' '}
              <strong className="text-[#1c2331]">{submitSuccess.date}</strong> has been stored in the live database.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 mb-6 font-mono text-left">
              <div>Booking ID: {submitSuccess.id}</div>
              <div>Contact: {submitSuccess.phone}</div>
              <div>Status: Pending Seller Confirmation</div>
            </div>
            <button
              onClick={() => {
                setSubmitSuccess(null);
                onClose();
              }}
              className="w-full py-2.5 bg-[#1c2331] text-white font-semibold rounded-lg hover:bg-[#283244] transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* Booking Form with Real-time Validation */
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="apt-fullname">Full Name *</label>
                {touched.fullName && (
                  <span className={`text-[11px] ${nameValidation.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                    {nameValidation.isValid ? '✓ Valid' : nameValidation.error}
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="apt-fullname"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`w-full pl-9 pr-8 py-2.5 bg-[#f8f9fa] border rounded-lg text-sm transition focus:outline-none focus:ring-2 ${
                    touched.fullName && !nameValidation.isValid
                      ? 'border-rose-400 focus:ring-rose-200'
                      : touched.fullName && nameValidation.isValid
                      ? 'border-emerald-400 focus:ring-emerald-100'
                      : 'border-gray-300 focus:ring-[#f9b234]'
                  }`}
                />
                {touched.fullName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nameValidation.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="apt-email">Email Address *</label>
                {touched.email && (
                  <span className={`text-[11px] ${emailValidation.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                    {emailValidation.isValid ? '✓ Valid' : emailValidation.error}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="apt-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-9 pr-8 py-2.5 bg-[#f8f9fa] border rounded-lg text-sm transition focus:outline-none focus:ring-2 ${
                    touched.email && !emailValidation.isValid
                      ? 'border-rose-400 focus:ring-rose-200'
                      : touched.email && emailValidation.isValid
                      ? 'border-emerald-400 focus:ring-emerald-100'
                      : 'border-gray-300 focus:ring-[#f9b234]'
                  }`}
                />
                {touched.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValidation.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Number Input */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="apt-phone">Mobile Number *</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {phone.replace(/\D/g, '').length}/10 digits
                  </span>
                  {touched.phone && (
                    <span className={`text-[11px] ${phoneValidation.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                      {phoneValidation.isValid ? '✓ Valid' : phoneValidation.error}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="apt-phone"
                  type="tel"
                  placeholder="10-digit number (e.g. 9876543210)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full pl-9 pr-8 py-2.5 bg-[#f8f9fa] border rounded-lg text-sm transition focus:outline-none focus:ring-2 ${
                    touched.phone && !phoneValidation.isValid
                      ? 'border-rose-400 focus:ring-rose-200'
                      : touched.phone && phoneValidation.isValid
                      ? 'border-emerald-400 focus:ring-emerald-100'
                      : 'border-gray-300 focus:ring-[#f9b234]'
                  }`}
                />
                {touched.phone && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {phoneValidation.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Date Input */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="apt-date">Preferred Date *</label>
                {touched.date && (
                  <span className={`text-[11px] ${dateValidation.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                    {dateValidation.isValid ? '✓ Valid Date' : dateValidation.error}
                  </span>
                )}
              </div>
              <input
                id="apt-date"
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={() => handleBlur('date')}
                className={`w-full px-3 py-2.5 bg-[#f8f9fa] border rounded-lg text-sm transition focus:outline-none focus:ring-2 ${
                  touched.date && !dateValidation.isValid
                    ? 'border-rose-400 focus:ring-rose-200'
                    : touched.date && dateValidation.isValid
                    ? 'border-emerald-400 focus:ring-emerald-100'
                    : 'border-gray-300 focus:ring-[#f9b234]'
                }`}
              />
            </div>

            {/* Real-time live validation state summary badge */}
            <div className="pt-2">
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
                    <span>Syncing with Live Database...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Request</span>
                    {isFormValid && <Sparkles className="w-4 h-4 text-[#f9b234]" />}
                  </>
                )}
              </button>
              {!isFormValid && (
                <p className="text-[11px] text-center text-gray-500 mt-2">
                  Please complete all required fields with valid information to submit.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
