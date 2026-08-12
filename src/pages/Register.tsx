import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaSpinner, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { OtpInput } from '../components/auth/OtpInput';
import { PhoneField } from '../components/auth/PhoneField';
import { formatPhone, isValidPhone } from '../lib/phone';

const RESEND_SECONDS = 60;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { sendSignUpOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Resend cooldown — Supabase rate-limits SMS to roughly one per minute.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const detailsValid =
    fullName.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && isValidPhone(phone, countryCode);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!detailsValid || loading) return;

    setLoading(true);
    const { error } = await sendSignUpOtp(phone, { fullName, email });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    setStep('otp');
    setSecondsLeft(RESEND_SECONDS);
    toast.success('Verification code sent');
  };

  const handleVerify = async (code?: string) => {
    const token = (code ?? otp).trim();
    if (token.length !== 6 || loading) return;

    setLoading(true);
    const { error } = await verifyOtp(phone, token);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      setOtp('');
      return;
    }
    toast.success('Account created');
    navigate('/', { replace: true });
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || loading) return;
    setLoading(true);
    const { error } = await sendSignUpOtp(phone, { fullName, email });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSecondsLeft(RESEND_SECONDS);
    setOtp('');
    toast.success('New code sent');
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gray-50 px-4 py-6 sm:px-6">
      <button
        onClick={() => (step === 'otp' ? setStep('details') : navigate(-1))}
        aria-label="Go back"
        className="mb-4 flex size-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100"
      >
        <FaArrowLeft className="text-lg" />
      </button>

      <div className="mx-auto w-full max-w-md">
        {step === 'details' ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-1 text-sm font-medium text-green-600">
              Sign up to start booking goods transport
            </p>

            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <div className="relative flex items-center">
                <FaUser className="pointer-events-none absolute left-4 text-gray-400" />
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-600"
                />
              </div>

              <div className="relative flex items-center">
                <FaEnvelope className="pointer-events-none absolute left-4 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-600"
                />
              </div>

              <PhoneField
                value={phone}
                onChange={setPhone}
                countryCode={countryCode}
                onCountryChange={setCountryCode}
                disabled={loading}
              />

              <button
                type="submit"
                disabled={!detailsValid || loading}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-green-600 text-base font-semibold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Sign Up'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-green-600">
                Log In
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-green-50">
              <FaShieldAlt className="text-xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Otp Verification</h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code sent to
              <br />
              <span className="font-semibold text-gray-900">{formatPhone(phone, countryCode)}</span>
            </p>

            <div className="mt-6">
              <OtpInput value={otp} onChange={setOtp} onComplete={handleVerify} disabled={loading} />
            </div>

            <button
              onClick={() => handleVerify()}
              disabled={otp.length !== 6 || loading}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-green-600 text-base font-semibold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading ? <FaSpinner className="animate-spin" /> : 'Verify & Proceed'}
            </button>

            <p className="mt-4 text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              {secondsLeft > 0 ? (
                <span className="text-gray-400">
                  Resend in 00:{String(secondsLeft).padStart(2, '0')}
                </span>
              ) : (
                <button onClick={handleResend} disabled={loading} className="font-semibold text-green-600">
                  Resend
                </button>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
