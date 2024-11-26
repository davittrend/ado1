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
      try {
        const data = JSON.parse(auth) as PinterestAuth;
        setIsAuthenticated(true);
        setUserData(data);
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        localStorage.removeItem('pinterest_auth');
      }
    }
  }, []);

  const handleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      // Use the correct Netlify Functions endpoint
      const response = await fetch('/.netlify/functions/pinterest-auth?path=/oauth/url');
      
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
      toast.error('Failed to initiate authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    if (!userData?.token?.refresh_token) {
      return false;
    }

    try {
      const response = await fetch(`/.netlify/functions/pinterest-auth?path=/token&refresh_token=${userData.token.refresh_token}`);
      const data = await response.json();

      if (response.ok && data.token) {
        const updatedAuth = {
          ...userData,
          token: {
            ...userData.token,
            ...data.token
          }
        };
        localStorage.setItem('pinterest_auth', JSON.stringify(updatedAuth));
        setUserData(updatedAuth);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, [userData]);

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
    refreshToken,
    logout,
    setIsAuthenticated
  };
}
