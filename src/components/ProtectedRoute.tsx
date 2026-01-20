import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { isTrialExpired } from '@/lib/trial';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRoles?: Array<'owner' | 'admin' | 'kitchen' | 'staff'>;
    skipTrialCheck?: boolean;
}

/**
 * Route guard that ensures user is authenticated, optionally has required role,
 * and has an active trial or subscription.
 * Redirects to login if not authenticated, or to trial-expired if trial has ended.
 */
export const ProtectedRoute = ({ children, requiredRoles, skipTrialCheck = false }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, profile } = useAuth();
    const { tenant, isLoading: tenantLoading } = useTenant();
    const location = useLocation();

    // Show loading while checking auth state or tenant data
    if (isLoading || tenantLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role if required
    if (requiredRoles && profile) {
        if (!requiredRoles.includes(profile.role)) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center px-6">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔒</span>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Acceso denegado</h1>
                        <p className="text-muted-foreground mb-6">
                            No tienes los permisos necesarios para acceder a esta página.
                        </p>
                        <Navigate to="/dashboard" replace />
                    </div>
                </div>
            );
        }
    }

    // User needs to complete registration setup
    if (!profile?.tenant_id && location.pathname !== '/register/setup') {
        return <Navigate to="/register/setup" replace />;
    }

    // Check trial expiration (skip for upgrade page and certain routes)
    if (!skipTrialCheck && tenant && isTrialExpired(tenant)) {
        // Allow access to trial-expired and upgrade pages
        if (location.pathname !== '/trial-expired' && location.pathname !== '/upgrade') {
            return <Navigate to="/trial-expired" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
