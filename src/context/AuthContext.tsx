import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, AuthResponse, User } from '../features/auth/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// localStorage key
const USER_STORAGE_KEY = 'ezmoov_user';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for stored user on initial mount
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to parse user from storage', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        // Simulate small delay so loading screen shows smoothly
        setTimeout(() => setLoading(false), 300);
      }
    };
    checkUser();
  }, []);

  const mockNetworkDelay = () => new Promise((resolve) => setTimeout(resolve, 800));

  // Helper to manage state and storage together
  const manageUserSession = (userData: User | null) => {
    if (userData) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setUser(userData);
  };

  const signInWithPhonePassword = async (phone: string, password: string): Promise<AuthResponse> => {
    await mockNetworkDelay();
    if (phone && password.length >= 6) {
      const mockUser: User = { id: '123', phone, fullName: 'Test User' };
      manageUserSession(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return { data: null, error: { message: 'Invalid phone number or password.' } };
  };

  const signUpWithPhone = async (phone: string, password: string, fullName: string): Promise<AuthResponse> => {
    await mockNetworkDelay();
    if (phone && password.length >= 6 && fullName) {
      return { data: { user: null }, error: null };
    }
    return { data: null, error: { message: 'Failed to send OTP. Check details.' } };
  };

  const verifyOtp = async (phone: string, token: string): Promise<AuthResponse> => {
    await mockNetworkDelay();
    if (token === '123456') {
      const mockUser: User = { id: '123', phone, fullName: 'New User' };
      manageUserSession(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return { data: null, error: { message: 'Invalid OTP. Please try again.' } };
  };

  const forgotPasswordOtp = async (phone: string): Promise<AuthResponse> => {
    await mockNetworkDelay();
    if (phone) {
      return { data: { user: null }, error: null };
    }
    return { data: null, error: { message: 'Failed to send reset OTP.' } };
  };

  const updatePassword = async (phone: string, token: string, newPassword: string): Promise<AuthResponse> => {
    await mockNetworkDelay();
    if (token === '123456' && newPassword.length >= 6) {
      return { data: { user: null }, error: null };
    }
    return { data: null, error: { message: 'Failed to update password. Invalid OTP or weak password.' } };
  };

  const signOut = async (): Promise<void> => {
    await mockNetworkDelay();
    manageUserSession(null); // Clears both state and localStorage
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithPhonePassword,
    signUpWithPhone,
    verifyOtp,
    forgotPasswordOtp,
    updatePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};