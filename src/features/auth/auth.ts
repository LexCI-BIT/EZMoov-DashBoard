export interface User {
  id: string;
  phone: string;
  fullName: string;
}

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  data: { user: User | null } | null;
  error: AuthError | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithPhonePassword: (phone: string, password: string) => Promise<AuthResponse>;
  signUpWithPhone: (phone: string, password: string, fullName: string) => Promise<AuthResponse>;
  verifyOtp: (phone: string, token: string) => Promise<AuthResponse>;
  forgotPasswordOtp: (phone: string) => Promise<AuthResponse>;
  updatePassword: (phone: string, token: string, newPassword: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

// Form State Interfaces
export interface LoginFormState {
  phone: string;
  password: string;
}

export interface RegisterFormState {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormState {
  phone: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}