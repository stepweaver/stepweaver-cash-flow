'use client';

import { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen bg-terminal-dark flex items-center justify-center p-4'>
          <div className='bg-terminal-light rounded-lg border border-terminal-border max-w-md w-full p-6'>
            <div className='flex items-center mb-4'>
              <AlertCircle className='h-8 w-8 text-terminal-red mr-3 lucide' />
              <div>
                <h2 className='text-xl font-semibold text-terminal-red font-ibm'>
                  Something went wrong
                </h2>
                <p className='text-sm text-terminal-muted font-ocr'>
                  An unexpected error occurred
                </p>
              </div>
            </div>

            <div className='bg-terminal-dark p-4 rounded border border-terminal-border mb-4'>
              <p className='text-sm text-terminal-muted font-ocr mb-2'>
                Error Details:
              </p>
              <p className='text-xs text-terminal-red font-ocr break-words'>
                {this.state.error && this.state.error.toString()}
              </p>
            </div>

            <div className='flex flex-col space-y-3'>
              <button
                onClick={this.handleReset}
                className='flex items-center justify-center px-4 py-2 bg-terminal-green text-black rounded hover:bg-terminal-green/80 transition-colors font-ocr'
              >
                <RefreshCw className='h-4 w-4 mr-2 lucide' />
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className='flex items-center justify-center px-4 py-2 bg-terminal-blue text-white rounded hover:bg-terminal-blue/80 transition-colors font-ocr'
              >
                <Home className='h-4 w-4 mr-2 lucide' />
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className='mt-4'>
                <summary className='text-sm text-terminal-muted cursor-pointer font-ocr'>
                  Technical Details (Development Only)
                </summary>
                <pre className='text-xs text-terminal-muted bg-terminal-dark p-2 rounded mt-2 overflow-auto max-h-40 font-ocr'>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
