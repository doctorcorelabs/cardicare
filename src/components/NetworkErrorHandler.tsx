import React, { useEffect, useState } from 'react';
import { AlertCircle, WifiOff, Wifi } from 'lucide-react';

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * Component to handle and display network connectivity issues
 */
export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Show banner briefly when coming back online
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 5000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!showBanner) {
    return <>{children}</>;
  }
  
  return (
    <>
      {showBanner && (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-700">Your connection has been restored</p>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">You are offline. Some features may be unavailable.</p>
                </>
              )}
            </div>
            {isOnline && (
              <button 
                onClick={() => setShowBanner(false)}
                className="text-green-700 hover:text-green-900 text-sm"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
      <div className={showBanner ? 'pt-10' : ''}>{children}</div>
    </>
  );
};

export default NetworkErrorHandler;
