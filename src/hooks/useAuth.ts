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
const [isLoading, setIsLoading] = useState(true); // Start with loading true
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [userData, setUserData] = useState<PinterestAuth | null>(null);

// Initial auth check
useEffect(() => {
  console.log('useAuth - Checking initial authentication');
  const checkAuth = () => {
    const auth = localStorage.getItem('pinterest_auth');
    console.log('useAuth - Local Storage Auth:', !!auth);

    if (auth) {
      try {
        const data = JSON.parse(auth) as PinterestAuth;
        console.log('useAuth - Parsed auth data:', {
          hasToken: !!data.token,
          hasUser: !!data.user,
          username: data.user?.username
        });

        // Validate the parsed data
        if (data.token && data.token.access_token && data.user) {
          setIsAuthenticated(true);
          setUserData(data);
          console.log('useAuth - Authentication successful');
        } else {
          console.log('useAuth - Invalid auth data structure');
          localStorage.removeItem('pinterest_auth');
          setIsAuthenticated(false);
          setUserData(null);
        }
      } catch (error) {
        console.error('useAuth - Failed to parse auth data:', error);
        localStorage.removeItem('pinterest_auth');
        setIsAuthenticated(false);
        setUserData(null);
      }
    } else {
      console.log('useAuth - No auth data found');
      setIsAuthenticated(false);
      setUserData(null);
    }
    setIsLoading(false);
  };

  checkAuth();
}, []);

// Monitor authentication state changes
useEffect(() => {
  console.log('useAuth - Auth state changed:', {
    isAuthenticated,
    hasUserData: !!userData,
    isLoading
  });
}, [isAuthenticated, userData, isLoading]);

const handleAuth = useCallback(async () => {
  console.log('useAuth - Initiating authentication');
  try {
    setIsLoading(true);
    const response = await fetch('/.netlify/functions/pinterest-auth?path=/oauth/url');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('useAuth - Received auth URL');

    if (data.url) {
      console.log('useAuth - Redirecting to Pinterest');
      window.location.href = data.url;
    } else {
      throw new Error('Failed to get authentication URL');
    }
  } catch (error) {
    console.error('useAuth - Auth error:', error);
    toast.error('Failed to initiate authentication. Please try again.');
  } finally {
    setIsLoading(false);
  }
}, []);

const refreshToken = useCallback(async () => {
  console.log('useAuth - Attempting token refresh');
  if (!userData?.token?.refresh_token) {
    console.log('useAuth - No refresh token available');
    return false;
  }

  try {
    const response = await fetch(
      `/.netlify/functions/pinterest-auth?path=/token&refresh_token=${userData.token.refresh_token}`
    );
    const data = await response.json();

    if (response.ok && data.token) {
      console.log('useAuth - Token refresh successful');
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
    console.log('useAuth - Token refresh failed');
    return false;
  } catch (error) {
    console.error('useAuth - Token refresh error:', error);
    return false;
  }
}, [userData]);

const logout = useCallback(() => {
  console.log('useAuth - Logging out');
  localStorage.removeItem('pinterest_auth');
  setIsAuthenticated(false);
  setUserData(null);
  toast.success('Successfully logged out');
}, []);

// Add a method to manually update auth state
const updateAuthState = useCallback((auth: PinterestAuth) => {
  console.log('useAuth - Manually updating auth state');
  localStorage.setItem('pinterest_auth', JSON.stringify(auth));
  setIsAuthenticated(true);
  setUserData(auth);
}, []);

return {
  isLoading,
  isAuthenticated,
  userData,
  handleAuth,
  refreshToken,
  logout,
  updateAuthState
};
}
