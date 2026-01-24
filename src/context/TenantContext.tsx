import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Tenant, Category, MenuItem as DBMenuItem } from '@/lib/supabase';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { fetchFromSupabase } from '@/lib/api';

interface TenantContextType {
    tenant: Tenant | null;
    categories: Category[];
    menuItems: DBMenuItem[];
    isLoading: boolean;
    error: string | null;
    tenantSlug: string | null;
    refreshTenant: () => Promise<void>;
    refreshMenu: () => Promise<void>;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<DBMenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { profile, session } = useAuth();
    const params = useParams<{ tenantSlug?: string }>();
    const location = useLocation();

    // Determine tenant slug from URL or user profile
    const tenantSlug = params.tenantSlug || extractSlugFromPath(location.pathname);
    const token = session?.access_token;

    const fetchTenantBySlug = useCallback(async (slug: string): Promise<Tenant | null> => {
        try {
            const data = await fetchFromSupabase<Tenant>(
                `tenants?slug=eq.${slug}&is_active=eq.true&limit=1`,
                token
            );
            return data.length > 0 ? data[0] : null;
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error fetching tenant:', err);
            return null;
        }
    }, [token]);

    const fetchTenantById = useCallback(async (id: string): Promise<Tenant | null> => {
        try {
            const data = await fetchFromSupabase<Tenant>(
                `tenants?id=eq.${id}&limit=1`,
                token
            );
            return data.length > 0 ? data[0] : null;
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error fetching tenant:', err);
            return null;
        }
    }, [token]);

    const fetchCategories = useCallback(async (tenantId: string): Promise<Category[]> => {
        try {
            return await fetchFromSupabase<Category>(
                `categories?tenant_id=eq.${tenantId}&is_active=eq.true&order=sort_order.asc`,
                token
            );
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error fetching categories:', err);
            return [];
        }
    }, [token]);

    const fetchMenuItems = useCallback(async (tenantId: string): Promise<DBMenuItem[]> => {
        try {
            return await fetchFromSupabase<DBMenuItem>(
                `menu_items?tenant_id=eq.${tenantId}&order=sort_order.asc`,
                token
            );
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error fetching menu items:', err);
            return [];
        }
    }, [token]);

    const refreshTenant = useCallback(async () => {
        if (tenant?.id) {
            const updated = await fetchTenantById(tenant.id);
            if (updated) setTenant(updated);
        }
    }, [tenant?.id, fetchTenantById]);

    const refreshMenu = useCallback(async () => {
        if (tenant?.id) {
            const [cats, items] = await Promise.all([
                fetchCategories(tenant.id),
                fetchMenuItems(tenant.id),
            ]);
            setCategories(cats);
            setMenuItems(items);
        }
    }, [tenant?.id, fetchCategories, fetchMenuItems]);

    useEffect(() => {
        let isMounted = true;

        const loadTenant = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let tenantData: Tenant | null = null;

                // Priority 1: If tenant slug in URL (/t/slug), always use that
                // This allows logged-in users to view other tenants' menus
                if (tenantSlug) {
                    tenantData = await fetchTenantBySlug(tenantSlug);
                }
                // Priority 2: If user is authenticated and has a tenant (for dashboard/admin pages)
                else if (profile?.tenant_id) {
                    tenantData = await fetchTenantById(profile.tenant_id);
                }

                // Only update state if component is still mounted
                if (!isMounted) return;

                if (tenantData) {
                    setTenant(tenantData);
                    const [cats, items] = await Promise.all([
                        fetchCategories(tenantData.id),
                        fetchMenuItems(tenantData.id),
                    ]);
                    if (isMounted) {
                        setCategories(cats);
                        setMenuItems(items);
                    }
                } else if (tenantSlug) {
                    setError('Negocio no encontrado');
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setError('Error cargando datos');
                    if (import.meta.env.DEV) console.error(err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadTenant();

        return () => {
            isMounted = false;
        };
    }, [profile?.tenant_id, tenantSlug, fetchTenantById, fetchTenantBySlug, fetchCategories, fetchMenuItems]);

    return (
        <TenantContext.Provider
            value={{
                tenant,
                categories,
                menuItems,
                isLoading,
                error,
                tenantSlug,
                refreshTenant,
                refreshMenu,
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};

// Helper to extract tenant slug from path
// Paths like /t/my-restaurant/menu -> my-restaurant
function extractSlugFromPath(pathname: string): string | null {
    const match = pathname.match(/^\/t\/([^/]+)/);
    return match ? match[1] : null;
}
