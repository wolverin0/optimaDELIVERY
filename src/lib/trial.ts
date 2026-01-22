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
 * Check if tenant's trial has expired
 */
export function isTrialExpired(tenant: Tenant | null): boolean {
  if (!tenant) return true;

  // Active subscription = no trial expiry
  if (tenant.subscription_status === 'active') return false;

  // No trial end date = no expiry
  if (!tenant.trial_ends_at) return false;

  // Check if trial end date has passed
  return new Date(tenant.trial_ends_at) < new Date();
}

/**
 * Get number of days remaining in trial
 */
export function getDaysRemaining(tenant: Tenant | null): number {
  if (!tenant?.trial_ends_at) return 0;

  const diff = new Date(tenant.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get current trial/subscription status
 */
export function getTrialStatus(
  tenant: Tenant | null
): 'active_subscription' | 'trial_active' | 'trial_expiring' | 'trial_expired' {
  if (!tenant) return 'trial_expired';

  // Has active paid subscription
  if (tenant.subscription_status === 'active') return 'active_subscription';

  const days = getDaysRemaining(tenant);

  if (days <= 0) return 'trial_expired';
  if (days <= 2) return 'trial_expiring'; // Warning when <=2 days left

  return 'trial_active';
}

/**
 * Check if tenant has an active paid subscription
 */
export function hasActiveSubscription(tenant: Tenant | null): boolean {
  if (!tenant) return false;
  return tenant.subscription_status === 'active';
}

/**
 * Get human-readable subscription status message
 */
export function getSubscriptionMessage(tenant: Tenant | null): string {
  if (!tenant) return 'No hay información de suscripción';

  const status = getTrialStatus(tenant);

  switch (status) {
    case 'active_subscription':
      const planName = tenant.plan_type === 'monthly' ? 'Mensual' : 'Anual';
      return `Plan ${planName} activo`;

    case 'trial_active':
      const days = getDaysRemaining(tenant);
      return `${days} ${days === 1 ? 'día' : 'días'} de prueba restantes`;

    case 'trial_expiring':
      const remainingDays = getDaysRemaining(tenant);
      return `⚠️ Tu prueba termina en ${remainingDays} ${remainingDays === 1 ? 'día' : 'días'}`;

    case 'trial_expired':
      return 'Período de prueba terminado';

    default:
      return 'Estado desconocido';
  }
}
