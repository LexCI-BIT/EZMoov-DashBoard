import React, { useEffect, useRef } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired when the last box is filled — lets the form auto-submit. */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Six separate boxes that behave like one field.
 *
 * Handles the things that make OTP entry annoying on a phone:
 * paste of the whole code, backspace stepping back into the previous box,
 * arrow keys, and inputMode="numeric" so the numeric keypad opens.
 */
export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = true,
}) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length && !next.includes(' ')) onComplete?.(next);
  };

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(length, ' ').split('');
    chars[index] = digit || ' ';
    commit(chars.join('').trimEnd());
  };

  const handleChange = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (!clean) {
      setDigit(index, '');
      return;
    }

    // Typing or pasting several digits at once fills forward from here.
    if (clean.length > 1) {
      const chars = value.padEnd(length, ' ').split('');
      for (let i = 0; i < clean.length && index + i < length; i++) {
        chars[index + i] = clean[i];
      }
      commit(chars.join('').trimEnd());
      refs.current[Math.min(index + clean.length, length - 1)]?.focus();
      return;
    }

    setDigit(index, clean);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index] !== ' ' && digits[index] !== '') {
        setDigit(index, '');
      } else if (index > 0) {
        setDigit(index - 1, '');
        refs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    commit(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          disabled={disabled}
          value={digits[i] === ' ' ? '' : digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1}`}
          className="size-11 rounded-lg border border-gray-300 bg-white text-center text-lg font-semibold text-gray-900 outline-none transition-colors focus:border-green-600 focus:ring-2 focus:ring-green-600/20 disabled:bg-gray-100 sm:size-12 sm:text-xl"
        />
      ))}
    </div>
  );
};

export default OtpInput;
