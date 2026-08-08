import React, { useState } from 'react';
import { isValidPhone, isValidPassword } from '../lib/validation';

interface LoginProps {
  onLogin: () => void;
  onNavigate: (screen: string) => void;
}

export default function Login({ onLogin, onNavigate }: LoginProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneVal = phone.trim();
    const pw = password;
    if (!phoneVal || !pw) {
      setLoginError('Please fill out all fields.');
      return;
    }

    const phoneOk = isValidPhone(phoneVal);
    const pwOk = isValidPassword(pw);

    if (!phoneOk) {
      setLoginError('Enter a valid phone number.');
      return;
    }
    if (!pwOk) {
      setLoginError('Password must be at least 8 characters and contain upper, lower, digit and symbol.');
      return;
    }

    setLoginError('');
    onLogin();
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-5 py-10 sm:py-20 animate-fade-in bg-[#f9fafb]">
      <div className="w-full max-w-[420px] bg-white border border-[#E0E0E0] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-[#00B14F] mb-2">EZmoov</div>
          <div className="text-sm text-[#666666]">Welcome back. Please login to continue.</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5 uppercase tracking-wider">
              Phone Number
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 border border-[#E0E0E0] rounded-lg text-base outline-none bg-[#F5F5F5] focus:bg-white focus:border-[#00B14F] focus:ring-2 focus:ring-[#E6F6EE] transition-all"
              placeholder="Enter your phone number"
            />
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
              placeholder="Enter password"
            />
          </div>

          {loginError && <div className="text-red-500 text-sm">{loginError}</div>}

          <button 
            type="submit"
            className="w-full py-4 bg-[#00B14F] active:bg-[#009542] text-white rounded-lg text-base font-medium uppercase tracking-wide cursor-pointer transition-colors border-none"
          >
            Login
          </button>
        </form>

        <button 
          className="w-full text-center text-[#00B14F] text-sm font-medium mt-4 bg-transparent border-none cursor-pointer"
          onClick={() => onNavigate('signup')}
        >
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
}
