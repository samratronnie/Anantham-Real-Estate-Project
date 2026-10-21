import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, User, Mail, Phone, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Subscription } from '../types.ts';
import { validateName, validateEmail, validatePhone } from '../utils/validation.ts';
import { saveSubscription } from '../services/firebase.ts';
import { eventBus, BUS_EVENTS } from '../services/eventBus.ts';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nameVal = validateName(name);
  const emailVal = validateEmail(email);
  const phoneVal = validatePhone(phone);
  const isFormValid = nameVal.isValid && emailVal.isValid && phoneVal.isValid;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });
    if (!isFormValid) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const sub: Subscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      planName: 'Basic Plan',
      price: 199,
      subscriberName: name.trim(),
      subscriberEmail: email.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveSubscription(sub);
      eventBus.emit(
        BUS_EVENTS.NOTIFICATION_SHOW,
        { message: `Basic Seller Plan activated for ${name.trim()}!` },
        'SubscriptionModal [Confirm] Button',
        'App'
      );
      setIsSuccess(true);
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to activate subscription. Please try again.');
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
      <div className="modal-content-box bg-white max-w-md">
        <button
          onClick={onClose}
          className="close-btn absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#f9b234] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Seller Membership</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1c2331]">Activate Basic Plan</h2>
          <p className="text-xs text-gray-500">₹199 / Month • 25 Active Listings</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#1c2331] mb-1">Subscription Activated!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Welcome to Anantham Seller Network. Your 25 listings quota is now active and synced with Firestore.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="w-full py-2.5 bg-[#1c2331] text-white font-semibold rounded-lg hover:bg-[#283244] transition cursor-pointer"
            >
              Continue Selling
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="sub-name">Full Name *</label>
                {touched.name && (
                  <span className={`text-[11px] ${nameVal.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                    {nameVal.isValid ? '✓ Valid' : nameVal.error}
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="sub-name"
                  type="text"
                  placeholder="e.g. Anand Mahindra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="sub-email">Email Address *</label>
                {touched.email && (
                  <span className={`text-[11px] ${emailVal.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                    {emailVal.isValid ? '✓ Valid' : emailVal.error}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="sub-email"
                  type="email"
                  placeholder="seller@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
                <label htmlFor="sub-phone">Mobile Number *</label>
                {touched.phone && (
                  <span className={`text-[11px] ${phoneVal.isValid ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
                    {phoneVal.isValid ? '✓ Valid' : phoneVal.error}
                  </span>
                )}
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="sub-phone"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9fa] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9b234]"
                />
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
              Plan renewal: ₹199 billed monthly. Cancel anytime from your account settings.
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
                  <span>Activating Subscription...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#f9b234]" />
                  <span>Confirm Subscription (₹199 / mo)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
