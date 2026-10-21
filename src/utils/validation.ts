/**
 * Pure validation utility functions for real-time input validation.
 */

export interface FieldValidationResult {
  isValid: boolean;
  error: string | null;
}

export function validateName(name: string): FieldValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters.' };
  }
  if (trimmed.length > 80) {
    return { isValid: false, error: 'Name cannot exceed 80 characters.' };
  }
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: 'Name can only contain alphabetic letters and spaces.' };
  }
  return { isValid: true, error: null };
}

export function validateEmail(email: string): FieldValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }
  // Standard RFC compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!emailRegex.test(trimmed) || !trimmed.includes('.')) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., name@domain.com).' };
  }
  if (trimmed.length > 150) {
    return { isValid: false, error: 'Email address is too long.' };
  }
  return { isValid: true, error: null };
}

export function validatePhone(phone: string): FieldValidationResult {
  const trimmed = phone.trim().replace(/[\s\-()]/g, '');
  if (!trimmed) {
    return { isValid: false, error: 'Mobile number is required.' };
  }
  // Accepts standard 10 digit Indian numbers (starting with 6,7,8,9) or with +91 prefix, or 10-15 digits international
  const phoneRegex = /^(\+?[0-9]{1,3})?[6-9][0-9]{9}$|^[0-9]{10,14}$/;
  if (!phoneRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number (e.g. 9876543210).' };
  }
  return { isValid: true, error: null };
}

export function validateDate(dateStr: string): FieldValidationResult {
  if (!dateStr) {
    return { isValid: false, error: 'Appointment date is required.' };
  }
  const selectedDate = new Date(dateStr);
  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, error: 'Invalid date selection.' };
  }

  // Must not be in the past (compare with today's date in local time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Set selected date hours to midnight
  const compareDate = new Date(selectedDate);
  // date input gives YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  const normalizedSelected = new Date(year, month - 1, day);

  if (normalizedSelected < today) {
    return { isValid: false, error: 'Appointment date cannot be in the past.' };
  }

  // Max 6 months in advance
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 6);
  if (normalizedSelected > maxDate) {
    return { isValid: false, error: 'Date cannot be further than 6 months ahead.' };
  }

  return { isValid: true, error: null };
}

export function validateTitle(title: string): FieldValidationResult {
  const trimmed = title.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Title is required.' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Title must be at least 3 characters.' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Title cannot exceed 100 characters.' };
  }
  return { isValid: true, error: null };
}

export function validateLocation(location: string): FieldValidationResult {
  const trimmed = location.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Location (city, state) is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Location must be at least 2 characters.' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Location cannot exceed 100 characters.' };
  }
  return { isValid: true, error: null };
}

export function validatePrice(price: number | string): FieldValidationResult & { formatted?: string } {
  const num = typeof price === 'number' ? price : parseFloat(String(price).replace(/,/g, ''));
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: 'Price must be a valid positive number.', formatted: undefined };
  }
  if (num > 1000000000) {
    return { isValid: false, error: 'Price exceeds maximum allowable limit.', formatted: undefined };
  }
  return { isValid: true, error: null, formatted: formatIndianCurrency(num) };
}

export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${cr} Crores`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${lk} Lakhs`;
  }
  if (amount >= 1000) {
    const k = (amount / 1000).toFixed(1).replace(/\.?0+$/, '');
    return `₹${k} Thousand`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
