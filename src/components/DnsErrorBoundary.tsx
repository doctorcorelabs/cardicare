import React, { Component, ErrorInfo } from 'react';
import { isDnsError, enhanceErrorWithDnsInfo } from '@/lib/dns-helper';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface DnsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface DnsErrorBoundaryState {
  hasError: boolean;
  isDnsError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically designed to catch and handle DNS resolution errors
 * which are common when using Cloudflare Workers.
 */
class DnsErrorBoundary extends Component<DnsErrorBoundaryProps, DnsErrorBoundaryState> {
  constructor(props: DnsErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      isDnsError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): DnsErrorBoundaryState {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      isDnsError: isDnsError(error),
      error: enhanceErrorWithDnsInfo(error)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('DNS Error Boundary caught an error:', error);
    console.error('Error stack trace:', errorInfo.componentStack);
  }

  handleRetry = (): void => {
    // Reset the error boundary state and retry
    this.setState({
      hasError: false,
      isDnsError: false,
      error: null
    });
    
    // Force a page reload to retry all connections
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // If this is a DNS error, show a specific message
      if (this.state.isDnsError) {
        return (
          <div className="p-6 mx-auto my-8 max-w-md bg-yellow-50 border border-yellow-200 rounded-lg shadow-md">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                Connection Issue Detected
              </h2>
              <p className="text-yellow-700 mb-4">
                We're having trouble connecting to our servers due to a DNS resolution issue.
              </p>
              <div className="bg-white p-4 rounded-md border border-yellow-200 text-left w-full mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Troubleshooting Steps:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Try switching to a different network (WiFi to cellular data)</li>
                  <li>Change your DNS server to 1.1.1.1 (Cloudflare) or 8.8.8.8 (Google)</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try a different browser</li>
                </ul>
              </div>
              <Button 
                onClick={this.handleRetry} 
                className="flex items-center space-x-2"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Retry Connection</span>
              </Button>
              <div className="mt-4 text-xs text-gray-500">
                <p>Error details: {this.state.error?.message || 'Unknown DNS error'}</p>
              </div>
            </div>
          </div>
        );
      }

      // For non-DNS errors, use the provided fallback or a generic error message
      return this.props.fallback || (
        <div className="p-6 mx-auto my-8 max-w-md bg-red-50 border border-red-200 rounded-lg shadow-md text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-700 mb-4">
            We encountered an error. Please try again later.
          </p>
          <Button onClick={this.handleRetry} variant="destructive">
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DnsErrorBoundary;
