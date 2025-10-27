/**
 * Salesviewer Script Loader
 * Conditionally loads the Salesviewer tracking script based on user consent
 * Official implementation from Salesviewer
 */

import { hasAcceptedTracking } from './consent';

// Official Salesviewer tracking configuration
const SALESVIEWER_ID = 'D8Y6S4c3u6X5';
const SALESVIEWER_BASE_URL = 'https://slsnlytcs.com/stm.js';
const SALESVIEWER_SCRIPT_ID = 'salesviewer-script';

/**
 * Check if Salesviewer script is already loaded
 */
export function isSalesviewerLoaded(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    !!document.getElementById(SALESVIEWER_SCRIPT_ID) ||
    Array.from(document.getElementsByTagName('script')).some(script =>
      script.src.includes('slsnlytcs.com/stm.js')
    )
  );
}

/**
 * Load Salesviewer tracking script
 * Only loads if consent has been granted and script isn't already loaded
 * Uses official Salesviewer IIFE pattern adapted for consent management
 */
export function loadSalesviewer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Cannot load Salesviewer in SSR'));
    }

    if (isSalesviewerLoaded()) {
      console.log('Salesviewer script already loaded');
      return resolve();
    }

    if (!hasAcceptedTracking()) {
      console.log('User has not accepted tracking, skipping Salesviewer');
      return reject(new Error('User has not consented to tracking'));
    }

    try {
      // Official Salesviewer IIFE pattern (w=window, d=document, s='script', l='name', i=ID)
      const windowName = window.name ? `&s=${window.name}` : '';
      const firstScript = document.getElementsByTagName('script')[0];
      const script = document.createElement('script') as HTMLScriptElement;

      script.id = SALESVIEWER_SCRIPT_ID;
      script.async = true;
      script.src = `${SALESVIEWER_BASE_URL}?id=${SALESVIEWER_ID}${windowName}`;
      script.referrerPolicy = 'no-referrer-when-downgrade';
      script.onload = () => {
        console.log('Salesviewer script loaded successfully');
        resolve();
      };
      script.onerror = error => {
        console.error('Failed to load Salesviewer script:', error);
        reject(error);
      };

      // Insert before first script or append to head
      firstScript?.parentNode?.insertBefore(script, firstScript) ||
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
  if (typeof window === 'undefined') return;

  // Remove all Salesviewer scripts (by ID or src match)
  const scriptsToRemove = Array.from(document.getElementsByTagName('script')).filter(
    script => script.id === SALESVIEWER_SCRIPT_ID || script.src.includes('slsnlytcs.com/stm.js')
  );

  scriptsToRemove.forEach(script => script.remove());

  if (scriptsToRemove.length > 0) {
    console.log(`Salesviewer script${scriptsToRemove.length > 1 ? 's' : ''} removed`);
  }
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
