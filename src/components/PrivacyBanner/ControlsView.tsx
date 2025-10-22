/**
 * Controls View Component
 * Detailed tracking preference management
 */

import { ShieldCheck, ArrowLeft, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ConsentStatus, type ConsentData } from '../../utils/consent';

interface ControlsViewProps {
  status: ConsentStatus;
  consentData: ConsentData | null;
  isLoading: boolean;
  onBack: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onReset: () => void;
  onClose: () => void;
}

export default function ControlsView({
  status,
  consentData,
  isLoading,
  onBack,
  onAccept,
  onDecline,
  onReset,
  onClose,
}: ControlsViewProps) {
  const getStatusBadge = () => {
    switch (status) {
      case ConsentStatus.ACCEPTED:
        return (
          <Badge className="bg-primary text-primary-foreground hover:bg-primary">Accepted</Badge>
        );
      case ConsentStatus.DECLINED:
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-300">
            Declined
          </Badge>
        );
      default:
        return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  const formatDate = (timestamp: number, includeTime = false) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
    };
    return new Date(timestamp).toLocaleDateString('en-US', options);
  };

  return (
    <div className="privacy-banner-controls">
      <div className="privacy-banner-controls-header">
        <button onClick={onBack} className="privacy-banner-back" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <ShieldCheck className="w-6 h-6 text-primary" />
        <h3 className="privacy-banner-title">Tracking Preferences</h3>
        <button onClick={onClose} className="privacy-banner-close" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="privacy-banner-controls-status">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-100">Current Status:</span>
          {getStatusBadge()}
        </div>

        {consentData && (
          <div className="text-xs text-gray-400 space-y-1 mt-2">
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{formatDate(consentData.timestamp, true)}</span>
            </div>
            <div className="flex justify-between">
              <span>Expires On:</span>
              <span>{formatDate(consentData.expiresAt)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="privacy-banner-controls-info">
        <p className="text-sm text-muted-foreground">
          Salesviewer is a B2B tool that helps us identify companies visiting our website. It
          processes visitor information to match it with company data, enabling us to provide better
          service. No personal data is collected or stored.
        </p>
      </div>

      <div className="privacy-banner-controls-actions">
        <Button
          onClick={onAccept}
          disabled={isLoading || status === ConsentStatus.ACCEPTED}
          className={`w-full sm:w-auto ${status === ConsentStatus.ACCEPTED ? 'opacity-100' : ''}`}
        >
          {status === ConsentStatus.ACCEPTED ? '✓ Accepted' : 'Accept'}
        </Button>
        <Button
          onClick={onDecline}
          disabled={isLoading || status === ConsentStatus.DECLINED}
          variant="outline"
          className={`w-full sm:w-auto ${status === ConsentStatus.DECLINED ? 'opacity-100' : ''}`}
        >
          {status === ConsentStatus.DECLINED ? '✓ Declined' : 'Decline'}
        </Button>
        {status !== ConsentStatus.PENDING && (
          <Button
            onClick={onReset}
            disabled={isLoading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        )}
        <a href="/privacy-policy" className="privacy-banner-policy-link" onClick={onBack}>
          View Full Policy
        </a>
      </div>
    </div>
  );
}
