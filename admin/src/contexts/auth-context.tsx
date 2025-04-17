"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AuthResponse, User } from '@/types';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // TEMPORARY: Initialize with a mock user for development
  const [user, setUser] = useState<User | null>({
    id: 1,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as 'admin',
    isActive: true,
    createdAt: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get auth data from cookies
        const storedUser = Cookies.get('user');
        const token = Cookies.get('token');

        if (storedUser && token) {
          // Parse stored user
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);

          // TEMPORARY: Skip token validation for development
          console.log('DEVELOPMENT MODE: Skipping token validation');
        } else {
          // TEMPORARY: Create a mock user for development
          console.log('DEVELOPMENT MODE: Creating mock user');
          const mockUser: User = {
            id: 1,
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin' as 'admin',
            isActive: true,
            createdAt: new Date().toISOString()
          };

          const mockToken = 'mock-token-for-development';

          // Store auth data in cookies
          Cookies.set('token', mockToken, { expires: 7, secure: process.env.NODE_ENV === 'production' });
          Cookies.set('user', JSON.stringify(mockUser), { expires: 7, secure: process.env.NODE_ENV === 'production' });
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // TEMPORARY: Bypass authentication for development
      console.log('DEVELOPMENT MODE: Bypassing authentication');

      // Create a mock user and token
      const mockUser: User = {
        id: 1,
        email: email,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin' as 'admin', // Type assertion to match the User type
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const mockToken = 'mock-token-for-development';

      // Store auth data in cookies
      // Set cookies with a 7-day expiration
      Cookies.set('token', mockToken, { expires: 7, secure: process.env.NODE_ENV === 'production' });
      Cookies.set('user', JSON.stringify(mockUser), { expires: 7, secure: process.env.NODE_ENV === 'production' });
      setUser(mockUser);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth cookies
      Cookies.remove('token');
      Cookies.remove('user');
      setUser(null);
      setIsLoading(false);

      // Redirect to login
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
