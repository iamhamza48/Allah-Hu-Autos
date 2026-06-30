export const PAKISTANI_PHONE_EXAMPLE = '03000000000 or +92 3000000000';

const compactPhone = (value: string) => value.trim().replace(/[\s()-]/g, '');

export const isValidPakistaniMobile = (value: string): boolean => {
  return /^(?:\+92|92|0)3\d{9}$/.test(compactPhone(value));
};

export const normalizePakistaniMobile = (value: string): string => {
  const compact = compactPhone(value);
  if (compact.startsWith('+92')) return compact;
  if (compact.startsWith('92')) return `+${compact}`;
  if (compact.startsWith('0')) return `+92${compact.slice(1)}`;
  return compact;
};

export const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
};

export interface GuestDetails {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  notes?: string;
}

export type GuestDetailErrors = Partial<Record<keyof GuestDetails, string>>;

export const validateGuestDetails = (details: GuestDetails): GuestDetailErrors => {
  const errors: GuestDetailErrors = {};
  const name = details.name.trim();
  const email = details.email?.trim() || '';
  const address = details.address?.trim();
  const city = details.city?.trim();

  if (name.length < 2 || name.length > 120) errors.name = 'Enter your full name (2–120 characters).';
  if (email && !isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!isValidPakistaniMobile(details.phone)) {
    errors.phone = `Use a Pakistani mobile number, e.g. ${PAKISTANI_PHONE_EXAMPLE}.`;
  }
  if (address !== undefined && (address.length < 8 || address.length > 500)) {
    errors.address = 'Enter a complete delivery address (at least 8 characters).';
  }
  if (city !== undefined && (city.length < 2 || city.length > 80)) {
    errors.city = 'Enter a valid city name.';
  }
  if ((details.notes?.length || 0) > 1000) errors.notes = 'Notes cannot exceed 1,000 characters.';

  return errors;
};
