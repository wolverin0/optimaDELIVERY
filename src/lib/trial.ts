// Trial and Subscription Helper Functions

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
export type PlanType = 'free' | 'monthly' | 'annual';

export interface Tenant {
  trial_ends_at: string | null;
  subscription_status: SubscriptionStatus;
  plan_type: PlanType;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
}

/**
 * Check if tenant's subscription has expired (paid plan ended)
 */
export function isSubscriptionExpired(tenant: Tenant | null): boolean {
  if (!tenant) return true;

  // Not active = check trial instead
  if (tenant.subscription_status !== 'active') return false;

  // Active but no end date = no expiry (shouldn't happen)
  if (!tenant.subscription_ends_at) return false;

  // Check if subscription end date has passed
  return new Date(tenant.subscription_ends_at) < new Date();
}

/**
 * Check if tenant's trial has expired
 */
export function isTrialExpired(tenant: Tenant | null): boolean {
  if (!tenant) return true;

  // Has active subscription - check if subscription expired
  if (tenant.subscription_status === 'active') {
    return isSubscriptionExpired(tenant);
  }

  // No trial end date = no expiry
  if (!tenant.trial_ends_at) return false;

  // Check if trial end date has passed
  return new Date(tenant.trial_ends_at) < new Date();
}

/**
 * Get number of days remaining in trial OR subscription
 */
export function getDaysRemaining(tenant: Tenant | null): number {
  if (!tenant) return 0;

  // If active subscription, use subscription_ends_at
  if (tenant.subscription_status === 'active' && tenant.subscription_ends_at) {
    const diff = new Date(tenant.subscription_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Otherwise use trial_ends_at
  if (!tenant.trial_ends_at) return 0;
  const diff = new Date(tenant.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get current trial/subscription status
 */
export function getTrialStatus(
  tenant: Tenant | null
): 'active_subscription' | 'subscription_expiring' | 'subscription_expired' | 'trial_active' | 'trial_expiring' | 'trial_expired' {
  if (!tenant) return 'trial_expired';

  // Has paid subscription
  if (tenant.subscription_status === 'active') {
    const days = getDaysRemaining(tenant);
    if (days <= 0) return 'subscription_expired';
    if (days <= 7) return 'subscription_expiring'; // Warning when <=7 days left
    return 'active_subscription';
  }

  // On trial
  const days = getDaysRemaining(tenant);
  if (days <= 0) return 'trial_expired';
  if (days <= 2) return 'trial_expiring'; // Warning when <=2 days left

  return 'trial_active';
}

/**
 * Check if tenant has an active (non-expired) paid subscription
 */
export function hasActiveSubscription(tenant: Tenant | null): boolean {
  if (!tenant) return false;
  if (tenant.subscription_status !== 'active') return false;
  // Also check it hasn't expired
  return !isSubscriptionExpired(tenant);
}

/**
 * Get human-readable subscription status message
 */
export function getSubscriptionMessage(tenant: Tenant | null): string {
  if (!tenant) return 'No hay información de suscripción';

  const status = getTrialStatus(tenant);
  const days = getDaysRemaining(tenant);
  const planName = tenant.plan_type === 'monthly' ? 'Mensual' : 'Anual';

  switch (status) {
    case 'active_subscription':
      return `Plan ${planName} activo - ${days} días restantes`;

    case 'subscription_expiring':
      return `⚠️ Tu plan ${planName} vence en ${days} ${days === 1 ? 'día' : 'días'}`;

    case 'subscription_expired':
      return 'Tu suscripción ha expirado';

    case 'trial_active':
      return `${days} ${days === 1 ? 'día' : 'días'} de prueba restantes`;

    case 'trial_expiring':
      return `⚠️ Tu prueba termina en ${days} ${days === 1 ? 'día' : 'días'}`;

    case 'trial_expired':
      return 'Período de prueba terminado';

    default:
      return 'Estado desconocido';
  }
}
