import { Tenant } from './supabase';

export type TrialStatus = 'active_subscription' | 'trial_active' | 'trial_expiring' | 'trial_expired';

/**
 * Check if a tenant's trial has expired (and they don't have an active subscription)
 */
export function isTrialExpired(tenant: Tenant | null): boolean {
    if (!tenant) return true;

    // If subscription is active, trial doesn't matter
    if (tenant.subscription_status === 'active') return false;

    // If no trial end date set, allow access (shouldn't happen for new tenants)
    if (!tenant.trial_ends_at) return false;

    return new Date(tenant.trial_ends_at) < new Date();
}

/**
 * Get the number of days remaining in the trial period
 */
export function getDaysRemaining(tenant: Tenant | null): number {
    if (!tenant?.trial_ends_at) return 0;

    const diff = new Date(tenant.trial_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get the current trial/subscription status for display purposes
 */
export function getTrialStatus(tenant: Tenant | null): TrialStatus {
    if (!tenant) return 'trial_expired';

    // Active paid subscription
    if (tenant.subscription_status === 'active') return 'active_subscription';

    const days = getDaysRemaining(tenant);

    // Trial has ended
    if (days <= 0) return 'trial_expired';

    // Trial is expiring soon (2 days or less)
    if (days <= 2) return 'trial_expiring';

    // Trial is still active
    return 'trial_active';
}

/**
 * Format the trial end date for display
 */
export function formatTrialEndDate(tenant: Tenant | null): string {
    if (!tenant?.trial_ends_at) return '';

    const date = new Date(tenant.trial_ends_at);
    return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Get a human-readable description of the current subscription/trial status
 */
export function getStatusDescription(tenant: Tenant | null): string {
    const status = getTrialStatus(tenant);
    const days = getDaysRemaining(tenant);

    switch (status) {
        case 'active_subscription':
            return `Plan ${tenant?.plan_type === 'pro' ? 'Pro' : 'Básico'} activo`;
        case 'trial_active':
            return `${days} ${days === 1 ? 'día' : 'días'} de prueba restantes`;
        case 'trial_expiring':
            return `¡Tu prueba termina ${days === 1 ? 'mañana' : `en ${days} días`}!`;
        case 'trial_expired':
            return 'Tu período de prueba ha terminado';
        default:
            return '';
    }
}
