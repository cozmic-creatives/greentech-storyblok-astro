/**
 * Consent Management Utility
 * Handles user consent for tracking scripts (Salesviewer)
 */

export const CONSENT_KEY = 'greentech_tracking_consent';
export const CONSENT_EXPIRY_DAYS = 90;

export enum ConsentStatus {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  PENDING = 'pending',
}

export interface ConsentData {
  status: ConsentStatus;
  timestamp: number;
  expiresAt: number;
}

export type BannerView = 'consent' | 'controls';

/**
 * Check if consent data has expired
 */
function isConsentExpired(consentData: ConsentData): boolean {
  return Date.now() > consentData.expiresAt;
}

/**
 * Read and validate consent data from localStorage
 * Returns null if not found, expired, or invalid
 */
function readConsentData(): ConsentData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      return null;
    }

    const consentData: ConsentData = JSON.parse(stored);

    // Check if consent has expired
    if (isConsentExpired(consentData)) {
      clearConsent();
      return null;
    }

    return consentData;
  } catch (error) {
    console.error('Error reading consent:', error);
    return null;
  }
}

/**
 * Get current consent status
 * Returns PENDING if no consent exists or if consent has expired
 */
export function getConsentStatus(): ConsentStatus {
  const data = readConsentData();
  return data?.status ?? ConsentStatus.PENDING;
}

/**
 * Get full consent data including timestamp
 */
export function getConsentData(): ConsentData | null {
  return readConsentData();
}

/**
 * Save consent status with timestamp and expiry
 */
export function saveConsent(status: ConsentStatus): void {
  if (typeof window === 'undefined') {
    return;
  }

  const timestamp = Date.now();
  const expiresAt = timestamp + CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  const consentData: ConsentData = {
    status,
    timestamp,
    expiresAt,
  };

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));

    // Dispatch custom event so other components can react
    window.dispatchEvent(
      new CustomEvent('consentChanged', {
        detail: { status, timestamp },
      })
    );
  } catch (error) {
    console.error('Error saving consent:', error);
  }
}

/**
 * Clear consent data
 */
export function clearConsent(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(
      new CustomEvent('consentChanged', {
        detail: { status: ConsentStatus.PENDING, timestamp: Date.now() },
      })
    );
  } catch (error) {
    console.error('Error clearing consent:', error);
  }
}

/**
 * Check if user has accepted tracking
 */
export function hasAcceptedTracking(): boolean {
  return getConsentStatus() === ConsentStatus.ACCEPTED;
}

/**
 * Check if user has made a consent decision (not pending)
 */
export function hasConsentDecision(): boolean {
  const status = getConsentStatus();
  return status !== ConsentStatus.PENDING;
}

/**
 * Show the privacy banner programmatically
 * @param view - Which view to show: 'consent' or 'controls'
 */
export function showPrivacyBanner(view: BannerView = 'consent'): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('showPrivacyBanner', {
      detail: { view },
    })
  );
}
