import { Link } from 'react-router-dom';
import { AlertTriangle, X, Sparkles } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { getTrialStatus, getDaysRemaining, getStatusDescription } from '@/lib/trial';
import { useState } from 'react';

interface TrialBannerProps {
    className?: string;
}

export const TrialBanner = ({ className = '' }: TrialBannerProps) => {
    const { tenant } = useTenant();
    const [dismissed, setDismissed] = useState(false);

    const status = getTrialStatus(tenant);
    const daysRemaining = getDaysRemaining(tenant);

    // Only show banner when trial is expiring soon (≤2 days)
    if (status !== 'trial_expiring' || dismissed) {
        return null;
    }

    return (
        <div className={`bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 ${className}`}>
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">
                        {daysRemaining === 1
                            ? 'Tu prueba gratuita termina mañana'
                            : `Tu prueba gratuita termina en ${daysRemaining} días`}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/upgrade"
                        className="inline-flex items-center gap-1.5 bg-white text-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
                    >
                        <Sparkles className="w-4 h-4" />
                        Actualizar plan
                    </Link>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Compact version for dashboard sidebar or smaller spaces
export const TrialStatusBadge = () => {
    const { tenant } = useTenant();

    const status = getTrialStatus(tenant);
    const description = getStatusDescription(tenant);

    if (status === 'active_subscription') {
        return (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <Sparkles className="w-3 h-3" />
                <span>{description}</span>
            </div>
        );
    }

    if (status === 'trial_expiring') {
        return (
            <Link
                to="/upgrade"
                className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors"
            >
                <AlertTriangle className="w-3 h-3" />
                <span>{description}</span>
            </Link>
        );
    }

    if (status === 'trial_active') {
        return (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                <span>{description}</span>
            </div>
        );
    }

    return null;
};

export default TrialBanner;
