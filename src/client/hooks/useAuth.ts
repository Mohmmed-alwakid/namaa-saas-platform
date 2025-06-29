import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshSession,
    clearError,
  } = useAuthStore();

  // Check if session needs refresh on mount
  useEffect(() => {
    if (session && session.expires_at) {
      const now = Date.now() / 1000;
      const expiresIn = session.expires_at - now;
      
      // If token expires in less than 5 minutes, refresh it
      if (expiresIn < 300) {
        refreshSession();
      }
    }
  }, [session, refreshSession]);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshSession,
    clearError,
  };
};