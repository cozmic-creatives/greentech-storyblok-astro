/**
 * Privacy Banner Wrapper Component
 * Manages state and renders appropriate view
 */

import { useEffect, useState } from 'react';
import {
  saveConsent,
  clearConsent,
  getConsentStatus,
  getConsentData,
  hasConsentDecision,
  ConsentStatus,
  type ConsentData,
  type BannerView,
} from '../../utils/consent';
import { loadSalesviewer, removeSalesviewer } from '../../utils/salesviewer';
import ConsentView from './ConsentView';
import ControlsView from './ControlsView';

export default function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<BannerView>('consent');
  const [status, setStatus] = useState<ConsentStatus>(ConsentStatus.PENDING);
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadConsentInfo = () => {
    setStatus(getConsentStatus());
    setConsentData(getConsentData());
  };

  useEffect(() => {
    loadConsentInfo();

    // Show banner if user hasn't made a decision
    if (!hasConsentDecision()) {
      setTimeout(() => {
        setIsVisible(true);
      }, 500);
    }

    // Listen for custom event to show banner
    const handleShowBanner = (e: Event) => {
      const customEvent = e as CustomEvent<{ view: BannerView }>;
      setView(customEvent.detail.view);
      setIsVisible(true);
    };

    // Listen for consent changes
    const handleConsentChange = () => {
      loadConsentInfo();
    };

    window.addEventListener('showPrivacyBanner', handleShowBanner);
    window.addEventListener('consentChanged', handleConsentChange);

    setIsLoaded(true);

    return () => {
      window.removeEventListener('showPrivacyBanner', handleShowBanner);
      window.removeEventListener('consentChanged', handleConsentChange);
    };
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);
    saveConsent(ConsentStatus.ACCEPTED);

    try {
      await loadSalesviewer();
    } catch (error) {
      console.error('Failed to load tracking script:', error);
    }

    setIsLoading(false);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setIsLoading(true);
    saveConsent(ConsentStatus.DECLINED);
    removeSalesviewer();
    setIsLoading(false);
    setIsVisible(false);
  };

  const handleReset = () => {
    setIsLoading(true);
    clearConsent();
    removeSalesviewer();
    setIsLoading(false);
    setView('consent');
  };

  const handleLearnMore = () => {
    setView('controls');
  };

  const handleBack = () => {
    setView('consent');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render anything until we've checked consent status
  if (!isLoaded || !isVisible) {
    return null;
  }

  return (
    <div className="privacy-banner-overlay">
      <div className="privacy-banner dark">
        <div className="privacy-banner-content">
          {view === 'consent' ? (
            <ConsentView
              onAccept={handleAccept}
              onLearnMore={handleLearnMore}
              isLoading={isLoading}
            />
          ) : (
            <ControlsView
              status={status}
              consentData={consentData}
              isLoading={isLoading}
              onBack={handleBack}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onReset={handleReset}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
