/**
 * Analytics Tracking Service
 * 
 * Modular tracking service that can be easily replaced with different providers.
 * Currently supports Google Analytics 4 and placeholder/mock tracking.
 * 
 * To replace with a different analytics provider:
 * 1. Update the implementation in this file
 * 2. Or create a new implementation file and import it
 */

// Configuration
const GA_TRACKING_ID = 'G-8KF5NEQ4FH';
const ENABLE_TRACKING = true; // Set to false to disable all tracking
const USE_MOCK_TRACKING = false; // Set to true for development/testing

// Event names
export const TRACKING_EVENTS = {
  PAGE_VIEW: 'page_view',
  RESERVATION_SUBMIT: 'reservation_submit',
  WHATSAPP_CLICK: 'whatsapp_click',
  RESERVE_BUTTON_CLICK: 'reserve_button_click',
} as const;

// Event categories
export const EVENT_CATEGORIES = {
  ENGAGEMENT: 'engagement',
  LEAD: 'lead',
  NAVIGATION: 'navigation',
  CONVERSION: 'conversion',
} as const;

/**
 * Tracking interface - implement this for different providers
 */
interface TrackingProvider {
  trackPageView: (path: string, title?: string) => void;
  trackEvent: (eventName: string, params?: Record<string, any>) => void;
}

/**
 * Google Analytics 4 Implementation
 */
class GoogleAnalyticsProvider implements TrackingProvider {
  trackPageView(path: string, title?: string): void {
    if (!ENABLE_TRACKING || !window.gtag) return;

    window.gtag('config', GA_TRACKING_ID, {
      page_path: path,
      page_title: title,
    });
  }

  trackEvent(eventName: string, params?: Record<string, any>): void {
    if (!ENABLE_TRACKING || !window.gtag) return;

    window.gtag('event', eventName, params);
  }
}

/**
 * Mock/Placeholder Implementation (for development/testing)
 */
class MockTrackingProvider implements TrackingProvider {
  trackPageView(path: string, title?: string): void {
    if (!ENABLE_TRACKING) return;
  }

  trackEvent(eventName: string, params?: Record<string, any>): void {
    if (!ENABLE_TRACKING) return;
  }
}

// Initialize tracking provider
const getTrackingProvider = (): TrackingProvider => {
  if (USE_MOCK_TRACKING) {
    return new MockTrackingProvider();
  }
  
  // Check if Google Analytics is available
  if (typeof window !== 'undefined' && window.gtag) {
    return new GoogleAnalyticsProvider();
  }
  
  // Fallback to mock if GA is not available
  return new MockTrackingProvider();
};

const tracker = getTrackingProvider();

/**
 * Public API for tracking
 */
export const analytics = {
  /**
   * Track a page view
   */
  trackPageView: (path: string, title?: string): void => {
    tracker.trackPageView(path, title);
  },

  /**
   * Track a custom event
   */
  trackEvent: (eventName: string, params?: Record<string, any>): void => {
    tracker.trackEvent(eventName, params);
  },

  /**
   * Track reservation form submission
   */
  trackReservationSubmit: (data: {
    name?: string;
    guests?: number;
    date?: string;
    time?: string;
  }): void => {
    tracker.trackEvent(TRACKING_EVENTS.RESERVATION_SUBMIT, {
      event_category: EVENT_CATEGORIES.CONVERSION,
      event_label: 'Reservation Form',
      value: 1,
      ...data,
    });
  },

  /**
   * Track WhatsApp button click
   */
  trackWhatsAppClick: (source?: string): void => {
    tracker.trackEvent(TRACKING_EVENTS.WHATSAPP_CLICK, {
      event_category: EVENT_CATEGORIES.LEAD,
      event_label: source || 'WhatsApp Button',
      value: 1,
    });
  },

  /**
   * Track reserve button click
   */
  trackReserveButtonClick: (source?: string): void => {
    tracker.trackEvent(TRACKING_EVENTS.RESERVE_BUTTON_CLICK, {
      event_category: EVENT_CATEGORIES.ENGAGEMENT,
      event_label: source || 'Reserve Button',
      value: 1,
    });
  },
};

export default analytics;
