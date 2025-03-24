import React, { Suspense } from 'react';
import LoadingState from '../components/common/LoadingState';

/**
 * Lazy load a component with suspense and loading state
 * @param {Function} importFunction - Dynamic import function for the component
 * @param {Object} options - Options for the lazy loading
 * @returns {React.Component} - Wrapped component with suspense and loading fallback
 */
export function lazyLoad(importFunction, options = {}) {
  const LazyComponent = React.lazy(importFunction);
  
  const {
    fallback = <LoadingState isLoading={true} loadingMessage="Loading component..." />,
    errorHandler = true
  } = options;
  
  return (props) => (
    <Suspense fallback={fallback}>
      {errorHandler ? (
        <ErrorBoundary>
          <LazyComponent {...props} />
        </ErrorBoundary>
      ) : (
        <LazyComponent {...props} />
      )}
    </Suspense>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>Something went wrong</h3>
          <p>The component failed to load. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default lazyLoad;
