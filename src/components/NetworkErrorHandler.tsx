import React, { useEffect, useState } from 'react';
import { AlertCircle, WifiOff, Wifi, RefreshCcw } from 'lucide-react';
import { getDiagnosticInfo } from '@/lib/api-utils';
import { checkApiHealth } from '@/lib/api-health';
import { Button } from '@/components/ui/button';

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

interface ConnectionDiagnostics {
  status: 'checking' | 'ok' | 'dns_issues' | 'api_unreachable' | 'offline';
  details?: string;
  timestamp: Date;
}

/**
 * Enhanced component to handle network connectivity issues with focus on DNS resolution problems
 */
export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false); // New state for showing diagnostic details
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostics>({ 
    status: 'checking', 
    timestamp: new Date() 
  });

  const checkConnection = async () => {
    setDiagnostics(prev => ({ ...prev, status: 'checking' }));
    
    try {
      // Try to connect to Cloudflare's trace endpoint first to check DNS
      const networkInfo = await getDiagnosticInfo();
      
      if (!networkInfo.connected) {
        setDiagnostics({
          status: 'offline',
          details: networkInfo.error || 'Unable to connect to internet',
          timestamp: new Date()
        });
        return;
      }
      
      // Now check our specific API
      const apiHealth = await checkApiHealth();
      
      if (apiHealth.status === 'online' || apiHealth.status === 'fallback') {
        setDiagnostics({
          status: 'ok',
          details: apiHealth.status === 'fallback' ? 'Using backup server' : undefined,
          timestamp: new Date()
        });
      } else if (apiHealth.message?.includes('DNS')) {
        setDiagnostics({
          status: 'dns_issues',
          details: 'DNS resolution problems detected. The server names could not be resolved.',
          timestamp: new Date()
        });
      } else {
        setDiagnostics({
          status: 'api_unreachable',
          details: apiHealth.message || 'API servers are unreachable',
          timestamp: new Date()
        });
      }
    } catch (error) {
      setDiagnostics({
        status: 'offline',
        details: error instanceof Error ? error.message : 'Unknown connection error',
        timestamp: new Date()
      });
    }
  };

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Show banner briefly when coming back online
      setShowBanner(true);
      // Check actual connection after navigator reports online
      checkConnection();
      setTimeout(() => setShowBanner(false), 5000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setDiagnostics({
        status: 'offline',
        details: 'Browser reports network is offline',
        timestamp: new Date()
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      checkConnection();
    }
    
    // Add a periodic connection check
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkConnection();
      }
    }, 60000); // Check every minute
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // Helper to determine banner styling based on connection status
  const getBannerStyle = () => {
    switch (diagnostics.status) {
      case 'checking':
        return 'bg-blue-100';
      case 'ok':
        return 'bg-green-100';
      case 'dns_issues':
        return 'bg-yellow-100';
      case 'api_unreachable':
      case 'offline':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Helper to get banner content details based on diagnostics
  const getBannerContentDetails = () => {
    switch (diagnostics.status) {
      case 'checking':
        return {
          iconElement: <RefreshCcw className="h-5 w-5 text-blue-600 animate-spin" />,
          messageText: 'Checking connection...',
          textColorClass: 'text-blue-700',
        };
      case 'ok':
        return {
          iconElement: <Wifi className="h-5 w-5 text-green-600" />,
          messageText: `Connection restored. ${diagnostics.details || 'System is online.'}`,
          textColorClass: 'text-green-700',
        };
      case 'dns_issues':
        return {
          iconElement: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          messageText: `DNS Resolution Issue: ${diagnostics.details || 'Cannot resolve server names.'}`,
          textColorClass: 'text-yellow-700',
        };
      case 'api_unreachable':
        return {
          iconElement: <WifiOff className="h-5 w-5 text-red-600" />,
          messageText: `API Unreachable: ${diagnostics.details || 'The application server cannot be reached.'}`,
          textColorClass: 'text-red-700',
        };
      case 'offline':
        return {
          iconElement: <WifiOff className="h-5 w-5 text-red-600" />,
          messageText: `You are offline: ${diagnostics.details || 'Please check your internet connection.'}`,
          textColorClass: 'text-red-700',
        };
      default:
        return {
          iconElement: <AlertCircle className="h-5 w-5 text-gray-600" />,
          messageText: 'Unknown connection status.',
          textColorClass: 'text-gray-700',
        };
    }
  };
  
  const bannerContent = getBannerContentDetails();
  const shouldDisplayBanner = diagnostics.status !== 'ok' || showBanner; 

  return (
    <>
      {shouldDisplayBanner && (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getBannerStyle()}`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {bannerContent.iconElement}
                <p className={`text-sm font-medium ${bannerContent.textColorClass}`}>
                  {bannerContent.messageText}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {diagnostics.status !== 'ok' && diagnostics.status !== 'checking' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(prev => !prev)}
                    className={`text-xs ${bannerContent.textColorClass} border-${bannerContent.textColorClass.replace('text-', '')} hover:bg-opacity-10`}
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                )}
                {diagnostics.status === 'ok' && showBanner && ( 
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBanner(false)}
                    className={`${bannerContent.textColorClass} hover:${bannerContent.textColorClass}/80`}
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
            {showDetails && diagnostics.status !== 'ok' && diagnostics.status !== 'checking' && (
              <div className="mt-2 p-2 border-t border-gray-300">
                <h4 className="text-xs font-semibold mb-1 ${bannerContent.textColorClass}">Diagnostic Information:</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
      <div className={shouldDisplayBanner ? 'pt-16 md:pt-12' : ''}>{children}</div> {/* Adjusted padding top */}
    </>
  );
};

export default NetworkErrorHandler;
