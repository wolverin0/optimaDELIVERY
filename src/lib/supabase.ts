import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SCHEMA } from './config';

// Create Supabase client with custom schema
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: {
        schema: SCHEMA,
    },
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Type definitions for our database
export interface ThemeConfig {
    name?: string;
    templateId: 'classic' | 'modern' | 'rustic' | 'vibrant' | 'dark';
    primaryColor: string;
    secondaryColor?: string;
    fontHeading?: string;
    fontBody?: string;
    borderRadius?: string;
}

// Subscription/Trial types
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
export type PlanType = 'free' | 'basic' | 'pro';

export type Database = {
    elbraserito: {
        Tables: {
            tenants: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    logo_url: string | null;
                    theme: ThemeConfig;
                    business_phone: string | null;
                    business_email: string | null;
                    business_address: string | null;
                    mercadopago_access_token: string | null;
                    mercadopago_refresh_token: string | null;
                    mercadopago_user_id: string | null;
                    mercadopago_public_key: string | null;
                    mercadopago_connected_at: string | null;
                    kitchen_pin: string | null;
                    social_instagram: string | null;
                    social_facebook: string | null;
                    social_whatsapp: string | null;
                    social_tiktok: string | null;
                    social_twitter: string | null;
                    email_verified: boolean;
                    verification_token: string | null;
                    verification_sent_at: string | null;
                    verified_at: string | null;
                    trial_ends_at: string | null;
                    subscription_status: SubscriptionStatus;
                    plan_type: PlanType;
                    subscription_started_at: string | null;
                    subscription_ends_at: string | null;
                    is_active: boolean;
                    settings: Record<string, unknown>;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['elbraserito']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['elbraserito']['Tables']['tenants']['Insert']>;
            };
            users: {
                Row: {
                    id: string;
                    tenant_id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    role: 'owner' | 'admin' | 'kitchen' | 'staff';
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['elbraserito']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['elbraserito']['Tables']['users']['Insert']>;
            };
            categories: {
                Row: {
                    id: string;
                    tenant_id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    image_url: string | null;
                    icon: string | null;
                    sort_order: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['elbraserito']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['elbraserito']['Tables']['categories']['Insert']>;
            };
            menu_items: {
                Row: {
                    id: string;
                    tenant_id: string;
                    category_id: string | null;
                    name: string;
                    description: string | null;
                    price: number;
                    image_url: string | null;
                    sold_by_weight: boolean;
                    weight_unit: string;
                    is_available: boolean;
                    sort_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['elbraserito']['Tables']['menu_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['elbraserito']['Tables']['menu_items']['Insert']>;
            };
            orders: {
                Row: {
                    id: string;
                    tenant_id: string;
                    order_number: number;
                    customer_name: string;
                    customer_phone: string;
                    customer_email: string | null;
                    delivery_type: 'pickup' | 'delivery';
                    delivery_address: string | null;
                    notes: string | null;
                    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
                    payment_method: 'cash' | 'mercadopago' | null;
                    payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
                    mercadopago_preference_id: string | null;
                    mercadopago_payment_id: string | null;
                    subtotal: number;
                    delivery_fee: number;
                    discount: number;
                    total: number;
                    snoozed_until: string | null;
                    status_changed_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['elbraserito']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at' | 'updated_at' | 'status_changed_at'>;
                Update: Partial<Database['elbraserito']['Tables']['orders']['Insert']>;
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string;
                    menu_item_id: string | null;
                    name: string;
                    description: string | null;
                    price: number;
                    quantity: number;
                    weight: number | null;
                    weight_unit: string | null;
                    subtotal: number;
                    created_at: string;
                };
                Insert: Omit<Database['elbraserito']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['elbraserito']['Tables']['order_items']['Insert']>;
            };
        };
    };
};

export type Tenant = Database['elbraserito']['Tables']['tenants']['Row'];
export type User = Database['elbraserito']['Tables']['users']['Row'];
export type Category = Database['elbraserito']['Tables']['categories']['Row'];
export type MenuItem = Database['elbraserito']['Tables']['menu_items']['Row'];
export type Order = Database['elbraserito']['Tables']['orders']['Row'];
export type OrderItem = Database['elbraserito']['Tables']['order_items']['Row'];
