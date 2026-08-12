export interface User {
  id: string;
  phone: string;
  fullName: string;
  email: string | null;
}

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  data: { user: User | null } | null;
  error: AuthError | null;
}

/** Extra profile fields captured during signup, sent with the first OTP. */
export interface SignUpDetails {
  fullName: string;
  email: string;
}

/**
 * Passwordless phone auth, matching the EZMoov mobile app.
 *
 *   Sign up : sendSignUpOtp(name, email, phone) -> verifyOtp(phone, code)
 *   Log in  : sendLoginOtp(phone)               -> verifyOtp(phone, code)
 *
 * The only difference between the two is `shouldCreateUser`, which is what
 * makes "log in" reject an unregistered number instead of silently creating
 * an account for it.
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;

  /** Registers a new account and texts the first OTP. */
  sendSignUpOtp: (phone: string, details: SignUpDetails) => Promise<AuthResponse>;

  /** Texts an OTP to an existing account. Fails if the number is unknown. */
  sendLoginOtp: (phone: string) => Promise<AuthResponse>;

  /** Exchanges the 6-digit code for a session. */
  verifyOtp: (phone: string, token: string) => Promise<AuthResponse>;

  signOut: () => Promise<void>;
}

export interface LoginFormState {
  phone: string;
  otp: string;
}

export interface RegisterFormState {
  fullName: string;
  email: string;
  phone: string;
  otp: string;
}
