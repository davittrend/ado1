import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import CallbackPage from './pages/CallbackPage';
import DashboardPage from './pages/DashboardPage';
import ScheduledPinsPage from './pages/ScheduledPinsPage';
import SettingsPage from './pages/SettingsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
const { isAuthenticated, isLoading, userData } = useAuth();

console.log('PrivateRoute - Current State:', {
  isAuthenticated,
  isLoading,
  hasUserData: !!userData,
  hasLocalStorage: !!localStorage.getItem('pinterest_auth')
});

if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
    </div>
  );
}

if (!isAuthenticated) {
  console.log('PrivateRoute - Redirecting to home - Not authenticated');
  return <Navigate to="/" replace />;
}

console.log('PrivateRoute - Rendering protected content');
return <>{children}</>;
}

function App() {
const { isAuthenticated } = useAuth();

// Add global authentication state logging
useEffect(() => {
  const checkAuthState = () => {
    const authData = localStorage.getItem('pinterest_auth');
    console.log('Global Auth State:', {
      isAuthenticated,
      hasAuthData: !!authData,
      timestamp: new Date().toISOString()
    });
  };

  checkAuthState();
  // Check auth state every 5 seconds
  const interval = setInterval(checkAuthState, 5000);

  return () => clearInterval(interval);
}, [isAuthenticated]);

return (
  <BrowserRouter>
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 5000,
        success: {
          style: {
            background: '#10B981',
            color: 'white',
          },
        },
        error: {
          style: {
            background: '#EF4444',
            color: 'white',
          },
          duration: 6000,
        },
      }}
    />
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />
        } 
      />
      <Route path="/callback" element={<CallbackPage />} />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/scheduled" 
        element={
          <PrivateRoute>
            <ScheduledPinsPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/settings" 
        element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        } 
      />
      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          <Navigate to="/" replace />
        } 
      />
    </Routes>
  </BrowserRouter>
);
}

export default App;
