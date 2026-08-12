import React from 'react';
import { COUNTRIES } from '../../lib/phone';

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryChange: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

/** Country selector + national number, matching the mobile app's field. */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  value,
  onChange,
  countryCode,
  onCountryChange,
  disabled,
  autoFocus,
  placeholder = 'Mobile Number',
}) => (
  <div className="flex gap-2">
    <div className="relative shrink-0">
      <select
        value={countryCode}
        onChange={(e) => onCountryChange(e.target.value)}
        disabled={disabled}
        aria-label="Country code"
        className="h-12 appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-8 text-sm font-medium text-gray-900 outline-none focus:border-green-600"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
        ▾
      </span>
    </div>

    <input
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      autoFocus={autoFocus}
      disabled={disabled}
      value={value}
      /* Digits only — stops spaces and dashes reaching the auth layer */
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
      placeholder={placeholder}
      className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-600 disabled:bg-gray-100"
    />
  </div>
);

export default PhoneField;
