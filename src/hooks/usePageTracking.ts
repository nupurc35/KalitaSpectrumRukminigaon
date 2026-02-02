import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../services/analytics';

/**
 * Hook to track page views on route changes
 * 
 * Usage: Add this hook to your App component or route wrapper
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Get page title from document or use pathname
    const pageTitle = document.title || location.pathname;
    
    // Track page view
    analytics.trackPageView(location.pathname, pageTitle);
  }, [location]);
};

export default usePageTracking;
