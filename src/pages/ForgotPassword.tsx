import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

/**
 * EZMoov no longer uses passwords — sign-in is a one-time code sent by SMS,
 * so there is nothing to reset. This page exists only so old links and
 * bookmarks land somewhere sensible instead of a 404.
 */
const ForgotPassword: React.FC = () => (
  <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-gray-50 px-4 py-8">
    <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-green-50">
        <FaShieldAlt className="text-xl text-green-600" />
      </div>

      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">No password needed</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        EZMoov signs you in with a one-time code sent to your mobile number, so there&apos;s no
        password to reset. Just enter your number and we&apos;ll text you a code.
      </p>

      <Link
        to="/login"
        className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-green-600 text-base font-semibold text-white transition-colors hover:bg-green-500"
      >
        Continue to Log In
      </Link>

      <p className="mt-6 text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-green-600">
          Sign Up
        </Link>
      </p>
    </div>
  </div>
);

export default ForgotPassword;
