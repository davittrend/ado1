import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface PinterestAuth {
  token: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };
  user: {
    username: string;
    [key: string]: any;
  };
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<PinterestAuth | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('pinterest_auth');
    if (auth) {
      const data = JSON.parse(auth) as PinterestAuth;
      setIsAuthenticated(true);
      setUserData(data);
    }
  }, []);

  const handleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pinterest-auth/oauth/url');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get authentication URL');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Failed to initiate authentication');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pinterest_auth');
    setIsAuthenticated(false);
    setUserData(null);
    toast.success('Successfully logged out');
  }, []);

  return {
    isLoading,
    isAuthenticated,
    userData,
    handleAuth,
    logout,
    setIsAuthenticated
  };
}
