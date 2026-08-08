import React, { useState } from 'react';
import { isValidName, isValidPhone, isValidPassword } from '../lib/validation';

interface SignUpProps {
  onSignUp: () => void;
  onNavigate: (screen: string) => void;
}

export default function SignUp({ onSignUp, onNavigate }: SignUpProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // validate fields
    const nOk = isValidName(name);
    const pOk = isValidPhone(phone);
    const pwOk = isValidPassword(password);

    setNameError(nOk ? '' : 'Enter a valid full name (letters and spaces).');
    setPhoneError(pOk ? '' : 'Enter a valid phone number.');
    setPasswordError(pwOk ? '' : 'Password must be 8+ chars with upper, lower, digit and symbol.');

    if (nOk && pOk && pwOk) {
      onSignUp();
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-5 py-10 sm:py-20 animate-fade-in bg-[#f9fafb]">
      <div className="w-full max-w-[420px] bg-white border border-[#E0E0E0] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-[#00B14F] mb-2">EZmoov</div>
          <div className="text-sm text-[#666666]">Create an account to get started.</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 border border-[#E0E0E0] rounded-lg text-base outline-none bg-[#F5F5F5] focus:bg-white focus:border-[#00B14F] focus:ring-2 focus:ring-[#E6F6EE] transition-all"
              placeholder="John Doe"
            />
            {nameError && <div className="text-red-500 text-xs mt-1">{nameError}</div>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5 uppercase tracking-wider">
              Phone Number
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 border border-[#E0E0E0] rounded-lg text-base outline-none bg-[#F5F5F5] focus:bg-white focus:border-[#00B14F] focus:ring-2 focus:ring-[#E6F6EE] transition-all"
              placeholder="+1 234 567 8900"
            />
            {phoneError && <div className="text-red-500 text-xs mt-1">{phoneError}</div>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 border border-[#E0E0E0] rounded-lg text-base outline-none bg-[#F5F5F5] focus:bg-white focus:border-[#00B14F] focus:ring-2 focus:ring-[#E6F6EE] transition-all"
              placeholder="Create a password"
            />
            {passwordError && <div className="text-red-500 text-xs mt-1">{passwordError}</div>}
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-[#00B14F] active:bg-[#009542] text-white rounded-lg text-base font-medium uppercase tracking-wide cursor-pointer transition-colors border-none"
          >
            Sign Up
          </button>
        </form>

        <button 
          className="w-full text-center text-[#00B14F] text-sm font-medium mt-4 bg-transparent border-none cursor-pointer"
          onClick={() => onNavigate('login')}
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}
