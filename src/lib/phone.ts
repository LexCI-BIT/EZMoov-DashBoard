/**
 * Phone number handling for Supabase Auth.
 *
 * Supabase expects E.164 ("+919876543210"). GoTrue strips the leading '+'
 * when it stores the value, which is why auth.users.phone reads
 * "919876543210" in the database. Always send E.164 and let it normalise.
 *
 * Getting this wrong fails silently — the lookup just doesn't match and the
 * user sees "invalid credentials" with no clue why — so every phone value
 * entering the auth layer goes through toE164() first.
 */

export const DEFAULT_COUNTRY_CODE = '91'; // India

/** Digits only, no country code, no separators. */
export function digitsOnly(input: string): string {
  return (input || '').replace(/\D/g, '');
}

/**
 * Convert user input to E.164.
 *
 * Accepts "9876543210", "+91 98765 43210", "091-9876543210", "919876543210".
 * Returns null if it can't produce something plausible.
 */
export function toE164(input: string, countryCode = DEFAULT_COUNTRY_CODE): string | null {
  let d = digitsOnly(input);
  if (!d) return null;

  // Strip international/trunk prefixes: 00XX..., or a single leading 0.
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.length > 10 && d.startsWith('0')) d = d.replace(/^0+/, '');

  // Bare national number — prepend the country code.
  if (d.length === 10) d = countryCode + d;

  // A national number that still has a leading trunk 0 (e.g. 09876543210).
  if (d.length === 11 && d.startsWith('0')) d = countryCode + d.slice(1);

  // E.164 allows 8–15 digits total.
  if (d.length < 10 || d.length > 15) return null;

  return `+${d}`;
}

/** True if the input can be turned into a usable E.164 number. */
export function isValidPhone(input: string, countryCode = DEFAULT_COUNTRY_CODE): boolean {
  const e164 = toE164(input, countryCode);
  if (!e164) return false;

  // Indian mobile numbers are 10 digits and start 6–9.
  if (countryCode === '91') {
    const national = e164.slice(1 + countryCode.length);
    return /^[6-9]\d{9}$/.test(national);
  }
  return true;
}

/** Display form, e.g. "+91 98765 43210". */
export function formatPhone(input: string, countryCode = DEFAULT_COUNTRY_CODE): string {
  const e164 = toE164(input, countryCode);
  if (!e164) return input;

  const national = e164.slice(1 + countryCode.length);
  if (countryCode === '91' && national.length === 10) {
    return `+${countryCode} ${national.slice(0, 5)} ${national.slice(5)}`;
  }
  return e164;
}

export const COUNTRIES = [
  { code: '91', label: 'IN +91', flag: '🇮🇳' },
] as const;
