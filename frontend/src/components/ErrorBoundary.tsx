import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">
                            We're sorry, but an unexpected error occurred. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
                        >
                            Refresh Page
                        </button>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-6 text-left p-4 bg-gray-100 rounded text-xs text-red-500 overflow-auto max-h-40">
                                {this.state.error.toString()}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
