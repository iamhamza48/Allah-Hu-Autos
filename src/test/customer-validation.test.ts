import { describe, expect, it } from 'vitest';
import { isValidPakistaniMobile, normalizePakistaniMobile, validateGuestDetails } from '@/lib/customer-validation';

describe('Pakistani customer validation', () => {
  it.each(['03000000000', '+923000000000', '+92 3000000000', '92-300-0000000'])(
    'accepts %s',
    (phone) => expect(isValidPakistaniMobile(phone)).toBe(true),
  );

  it.each(['3000000000', '02130000000', '0300000000', '+92300000000', 'abc'])(
    'rejects %s',
    (phone) => expect(isValidPakistaniMobile(phone)).toBe(false),
  );

  it('normalizes local numbers to international format', () => {
    expect(normalizePakistaniMobile('0300 0000000')).toBe('+923000000000');
  });

  it('validates required checkout details', () => {
    expect(validateGuestDetails({ name: 'A', phone: '123', address: 'short', city: '' })).toMatchObject({
      name: expect.any(String), phone: expect.any(String), address: expect.any(String), city: expect.any(String),
    });
  });
});
