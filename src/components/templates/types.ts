import { Tenant, Category, MenuItem } from '@/lib/supabase';

export interface TemplateProps {
    tenant: Tenant;
    categories: Category[];
    menuItems: MenuItem[];
    isPreview?: boolean;
}
