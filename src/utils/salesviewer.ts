/**
 * Salesviewer Script Loader
 * Conditionally loads the Salesviewer tracking script based on user consent
 */

import { hasAcceptedTracking } from './consent';

// TODO: Replace with actual Salesviewer script URL
const SALESVIEWER_SCRIPT_URL = 'https://example.com/salesviewer-tracking.js';
const SALESVIEWER_SCRIPT_ID = 'salesviewer-script';

/**
 * Check if Salesviewer script is already loaded
 */
export function isSalesviewerLoaded(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!document.getElementById(SALESVIEWER_SCRIPT_ID);
}

/**
 * Load Salesviewer tracking script
 * Only loads if consent has been granted and script isn't already loaded
 */
export function loadSalesviewer(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Don't load in SSR
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load Salesviewer in SSR'));
      return;
    }

    // Check if script is already loaded
    if (isSalesviewerLoaded()) {
      console.log('Salesviewer script already loaded');
      resolve();
      return;
    }

    // Check consent
    if (!hasAcceptedTracking()) {
      console.log('User has not accepted tracking, skipping Salesviewer');
      reject(new Error('User has not consented to tracking'));
      return;
    }

    try {
      const script = document.createElement('script');
      script.id = SALESVIEWER_SCRIPT_ID;
      script.src = SALESVIEWER_SCRIPT_URL;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Salesviewer script loaded successfully');
        resolve();
      };

      script.onerror = error => {
        console.error('Failed to load Salesviewer script:', error);
        reject(error);
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading Salesviewer script:', error);
      reject(error);
    }
  });
}

/**
 * Remove Salesviewer script from the page
 * Used when user revokes consent
 */
export function removeSalesviewer(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const script = document.getElementById(SALESVIEWER_SCRIPT_ID);
  if (script) {
    script.remove();
    console.log('Salesviewer script removed');
  }

  // Clear any Salesviewer-related cookies/storage if needed
  // TODO: Add any Salesviewer-specific cleanup here
}

/**
 * Initialize Salesviewer based on current consent status
 * Call this on page load
 */
export function initializeSalesviewer(): void {
  if (hasAcceptedTracking()) {
    loadSalesviewer().catch(error => {
      console.error('Failed to initialize Salesviewer:', error);
    });
  }
}
