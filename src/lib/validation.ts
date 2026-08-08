export function isValidName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  const re = /^[A-Za-z\s.'-]+$/;
  return re.test(trimmed);
}

export function isValidPhone(input: string): boolean {
  if (!input) return false;
  // Strip spaces, dashes, parentheses
  const digits = input.replace(/[^\d+]/g, '');
  // Allow leading + then digits
  const cleaned = digits.startsWith('+') ? digits.slice(1) : digits;
  // valid length between 7 and 15 digits
  return /^[0-9]{7,15}$/.test(cleaned);
}

export function isValidPassword(pw: string): boolean {
  if (!pw) return false;
  // Minimum 8 chars, at least one lower, one upper, one digit, one special
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pw);
}

export function isDateNotPast(dateStr: string): boolean {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  const today = new Date();
  // Set today's time to 00:00:00 for comparison
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected >= today;
}

function parseTimeToMinutes(t: string): number | null {
  if (!t) return null;
  // Accept formats like "09:00 AM" or "09:00" (24h)
  const ampm = /AM|PM/i.test(t);
  if (ampm) {
    const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return null;
    let hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const ap = m[3].toUpperCase();
    if (hh === 12) hh = ap === 'AM' ? 0 : 12;
    if (ap === 'PM') hh += 12;
    return hh * 60 + mm;
  }
  const m2 = t.match(/(\d{1,2}):(\d{2})/);
  if (!m2) return null;
  const hh2 = parseInt(m2[1], 10);
  const mm2 = parseInt(m2[2], 10);
  return hh2 * 60 + mm2;
}

export function isValidTimeRange(start: string, end: string): boolean {
  const s = parseTimeToMinutes(start);
  const e = parseTimeToMinutes(end);
  if (s === null || e === null) return false;
  return s < e;
}
