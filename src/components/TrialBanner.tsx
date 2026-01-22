import { Link } from 'react-router-dom';
import { useTenant } from '@/context/TenantContext';
import { getTrialStatus, getDaysRemaining } from '@/lib/trial';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const TrialBanner = () => {
  const { tenant } = useTenant();

  if (!tenant) return null;

  const status = getTrialStatus(tenant);

  // Only show banner when trial is expiring (<=2 days left)
  if (status !== 'trial_expiring') return null;

  const daysRemaining = getDaysRemaining(tenant);

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm sm:text-base font-medium">
            ⚠️ Tu prueba gratuita termina en{' '}
            <span className="font-bold">
              {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}
            </span>
            . Suscribite para seguir usando optimaDELIVERY.
          </p>
        </div>
        <Link to="/checkout">
          <Button
            size="sm"
            className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Ver Planes
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TrialBanner;
