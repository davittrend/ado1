import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function CallbackPage() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();
const code = searchParams.get('code');
const error = searchParams.get('error');
const errorDescription = searchParams.get('error_description');

useEffect(() => {
  async function handleCallback() {
    console.log('Starting authentication callback process');
    console.log('Code:', code);
    console.log('Error:', error);
    console.log('Error Description:', errorDescription);

    if (error || errorDescription) {
      const errorMessage = errorDescription || error || 'Authentication was denied';
      console.log('Authentication error detected:', errorMessage);
      toast.error(errorMessage);
      navigate('/', { replace: true });
      return;
    }

    if (!code) {
      console.log('No authorization code received');
      toast.error('Authentication failed: No authorization code received');
      navigate('/', { replace: true });
      return;
    }

    try {
      console.log('Attempting to exchange code for token...');
      const response = await fetch(`/.netlify/functions/pinterest-auth?path=/token&code=${code}`);
      const data = await response.json();
      console.log('Auth response received:', { 
        ok: response.ok, 
        hasToken: !!data.token, 
        hasUser: !!data.user 
      });

      if (response.ok && data.token && data.user) {
        console.log('Authentication successful, storing data and redirecting...');
        toast.success(`Welcome, ${data.user.username || 'Pinterest User'}!`);
        localStorage.setItem('pinterest_auth', JSON.stringify(data));

        // Add a small delay before navigation to ensure localStorage is set
        setTimeout(() => {
          console.log('Navigating to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        console.log('Invalid response data:', data);
        throw new Error(data.error || 'Failed to complete authentication');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
      navigate('/', { replace: true });
    }
  }

  handleCallback();

  // Cleanup function
  return () => {
    console.log('Callback component unmounting');
  };
}, [code, error, errorDescription, navigate]);

// Also check if auth data exists in localStorage
useEffect(() => {
  const authData = localStorage.getItem('pinterest_auth');
  console.log('Existing auth data in localStorage:', !!authData);
}, []);

if (error || errorDescription) {
  console.log('Rendering error state');
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h1 className="text-xl font-semibold mb-2">Authentication Failed</h1>
        <p className="text-gray-600">{errorDescription || error || 'Access was denied'}</p>
      </div>
    </div>
  );
}

console.log('Rendering loading state');
return (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
      <Loader className="animate-spin h-12 w-12 mx-auto mb-4 text-red-500" />
      <h1 className="text-xl font-semibold mb-2">Processing Authentication</h1>
      <p className="text-gray-600">Please wait while we complete your Pinterest authentication...</p>
    </div>
  </div>
);
}

export default CallbackPage;
