/**
 * Consent View Component
 * Initial privacy consent prompt
 */

import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';

interface ConsentViewProps {
  onAccept: () => void;
  onLearnMore: () => void;
  isLoading: boolean;
}

export default function ConsentView({ onAccept, onLearnMore, isLoading }: ConsentViewProps) {
  return (
    <>
      <div className="privacy-banner-icon">
        <ShieldCheck className="w-8 h-8 text-primary" />
      </div>
      <div className="privacy-banner-inner">
        <div className="privacy-banner-text">
          <h3 className="privacy-banner-title">We value your privacy</h3>
          <p className="privacy-banner-description">
            We use Salesviewer to identify companies visiting our website, helping us provide better
            B2B service. This tool processes visitor information to match it with company data.
          </p>
        </div>
        <div className="privacy-banner-actions">
          <Button onClick={onAccept} disabled={isLoading}>
            Accept
          </Button>
          <Button variant="outline" onClick={onLearnMore}>
            Learn More
          </Button>
        </div>
      </div>
    </>
  );
}
