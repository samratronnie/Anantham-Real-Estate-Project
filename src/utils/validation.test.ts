import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateDate,
  validatePrice,
  validateTitle,
  validateLocation,
  formatIndianCurrency,
} from './validation.ts';

test('validateName correctly checks inputs', () => {
  assert.equal(validateName('').isValid, false);
  assert.equal(validateName('A').isValid, false);
  assert.equal(validateName('John Doe').isValid, true);
  assert.equal(validateName('Samrat Chowdhury').isValid, true);
  assert.equal(validateName('Invalid123').isValid, false);
});

test('validateEmail correctly handles valid and invalid formats', () => {
  assert.equal(validateEmail('').isValid, false);
  assert.equal(validateEmail('plainaddress').isValid, false);
  assert.equal(validateEmail('test@domain').isValid, false);
  assert.equal(validateEmail('test@domain.com').isValid, true);
  assert.equal(validateEmail('user.name+tag@sub.example.co.in').isValid, true);
});

test('validatePhone enforces proper phone numbers', () => {
  assert.equal(validatePhone('').isValid, false);
  assert.equal(validatePhone('12345').isValid, false);
  assert.equal(validatePhone('abcdefghij').isValid, false);
  assert.equal(validatePhone('9876543210').isValid, true);
  assert.equal(validatePhone('+919876543210').isValid, true);
});

test('validateDate checks past and future dates', () => {
  assert.equal(validateDate('').isValid, false);
  assert.equal(validateDate('2020-01-01').isValid, false); // past date
  
  // Future date
  const future = new Date();
  future.setDate(future.getDate() + 7);
  const futureStr = future.toISOString().split('T')[0];
  assert.equal(validateDate(futureStr).isValid, true);
});

test('validatePrice formats currencies in Indian Lakhs and Crores', () => {
  assert.equal(validatePrice(0).isValid, false);
  assert.equal(validatePrice(-100).isValid, false);
  assert.equal(validatePrice('abc').isValid, false);

  const house = validatePrice(7500000);
  assert.equal(house.isValid, true);
  assert.equal(house.formatted, '₹75 Lakhs');

  const cr = formatIndianCurrency(15000000);
  assert.equal(cr, '₹1.5 Crores');
});

test('validateTitle and validateLocation enforce lengths', () => {
  assert.equal(validateTitle('Hi').isValid, false);
  assert.equal(validateTitle('Luxury 3BHK Apartment').isValid, true);
  assert.equal(validateLocation('K').isValid, false);
  assert.equal(validateLocation('Kolkata, West Bengal').isValid, true);
});
