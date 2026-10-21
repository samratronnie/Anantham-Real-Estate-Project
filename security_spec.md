# Security Specification for Anantham Marketplace

## 1. Data Invariants
- Listings must have non-empty titles (min 3 chars), valid category enum, non-negative price, and valid location.
- Appointments require full name (>= 2 chars), valid email format, 10-15 digit phone, valid date, and a reference to an existing listing ID.
- Subscriptions require valid plan name, positive price, subscriber name, and default active status.
- Immutable fields: `id` and `createdAt` cannot be changed after creation.

## 2. The "Dirty Dozen" Threat Payloads & Guards
1. **Empty/Oversized Title**: A listing with an empty title or a 50KB title string -> Rejected by length constraint (`title.size() >= 3 && title.size() <= 100`).
2. **Negative Price**: A listing with price = -5000 -> Rejected by price check (`price >= 0`).
3. **Invalid Category Poisoning**: A listing with category = 'Weapons/Illegal' -> Rejected by category enum list validation.
4. **Invalid Email Injection in Appointments**: Email lacking '@' or containing invalid characters -> Rejected by email format regex.
5. **Phone Number Flooding**: A phone string with 500 characters or letters -> Rejected by phone format check (`phone.size() >= 10 && phone.size() <= 15`).
6. **Past Appointment Date**: Booking in the 1900s or invalid date -> Rejected by date string length and format check.
7. **Document ID Injection**: Using arbitrary nested paths or 2KB IDs -> Rejected by `isValidId()` guard on document path keys.
8. **Shadow Field Injection**: Injecting unexpected internal fields like `isAdmin: true` -> Rejected by strict key validation (`hasOnly()`).
9. **Status Tampering in Appointments**: Setting an invalid status like `approved_by_god` -> Rejected by status enum check.
10. **Listing Immutability Breach**: Updating `createdAt` or `id` -> Rejected by equality check against `existing()`.
11. **Orphaned Writes**: Creating an appointment for a non-existent or blank listing ID -> Enforced by listingId validation.
12. **Subscription Price Forgery**: Subscribing to Basic Plan with price = 0 -> Rejected by subscription plan price validation.
