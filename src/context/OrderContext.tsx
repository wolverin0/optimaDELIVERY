import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { z } from 'zod';
import { useTenant } from './TenantContext';
import { useAuth } from './AuthContext';
import { Order, CartItem, CustomerData, OrderStatus } from '@/types/order';
import { supabase } from '@/lib/supabase';
import { supabaseFetch } from '@/lib/api';
import { SUPABASE_URL } from '@/lib/config';

// Customer data validation schema
const CustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  phone: z.string().min(6, 'Phone must be at least 6 characters').max(20, 'Phone must be less than 20 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  deliveryType: z.enum(['pickup', 'delivery']),
  address: z.string().max(500, 'Address must be less than 500 characters').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().or(z.literal('')),
  paymentMethod: z.enum(['cash', 'mercadopago']),
});

interface SubmitOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: number;
  paymentUrl?: string;
  isDemo?: boolean;
  error?: string;
}

// Database order item shape from Supabase
interface DbOrderItem {
  id: string;
  menu_item_id: string | null;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  weight?: number | null;
  weight_unit?: string | null;
}

// Database order shape from Supabase
interface DbOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string | null;
  notes: string | null;
  delivery_type: 'pickup' | 'delivery';
  payment_method: 'cash' | 'mercadopago' | null;
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  order_items: DbOrderItem[];
  total: number;
  status: string;
  created_at: string;
  status_changed_at: string | null;
  snoozed_until: string | null;
  mercadopago_preference_id: string | null;
  mercadopago_payment_id: string | null;
}

// Menu item shape for cart operations (from MenuItem database type)
interface AddToCartItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  sold_by_weight?: boolean;
  weight_unit?: string;
}

interface OrderContextType {
  cart: CartItem[];
  orders: Order[];
  isLoadingOrders: boolean;
  addToCart: (item: AddToCartItem, weight?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateWeight: (itemId: string, weight: number) => void;
  clearCart: () => void;
  submitOrder: (customer: CustomerData) => Promise<SubmitOrderResult>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  snoozeOrder: (orderId: string, minutes: number) => Promise<void>;
  refreshOrders: () => Promise<void>;
  cartTotal: number;
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Helper to get cart storage key per tenant
const getCartStorageKey = (tenantId: string | undefined) =>
  tenantId ? `cart_${tenantId}` : 'cart_anonymous';

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { tenant } = useTenant();
  const { session } = useAuth();

  // Track if cart has been loaded from localStorage to prevent clearing on initial mount
  const cartLoadedRef = useRef(false);
  const lastTenantIdRef = useRef<string | undefined>(undefined);

  // Initialize cart empty - will load from localStorage when tenant is available
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const token = session?.access_token || null;

  // Load cart when tenant becomes available or changes
  useEffect(() => {
    if (tenant?.id && tenant.id !== lastTenantIdRef.current) {
      lastTenantIdRef.current = tenant.id;
      try {
        const key = getCartStorageKey(tenant.id);
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCart(parsed);
          }
        }
        cartLoadedRef.current = true;
      } catch {
        cartLoadedRef.current = true;
      }
    }
  }, [tenant?.id]);

  // Persist cart to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    // Don't persist until we've loaded the cart and have a tenant
    if (!cartLoadedRef.current || !tenant?.id) return;

    const key = getCartStorageKey(tenant.id);
    if (cart.length > 0) {
      localStorage.setItem(key, JSON.stringify(cart));
    } else {
      localStorage.removeItem(key);
    }
  }, [cart, tenant?.id]);

  const mapDbOrderToOrder = (dbOrder: DbOrder): Order => {
    return {
      id: dbOrder.id,
      customer: {
        name: dbOrder.customer_name,
        phone: dbOrder.customer_phone,
        address: dbOrder.delivery_address || '',
        notes: dbOrder.notes || undefined,
        deliveryType: dbOrder.delivery_type,
        paymentMethod: dbOrder.payment_method || 'cash',
      },
      items: (dbOrder.order_items || []).map((item: DbOrderItem) => ({
        id: item.menu_item_id || item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: '',
        category: 'comida',
        quantity: item.quantity,
        soldByWeight: item.weight ? true : false,
        weight: item.weight || undefined,
        weightUnit: item.weight_unit || undefined,
      })),
      total: dbOrder.total,
      status: dbOrder.status as OrderStatus,
      createdAt: new Date(dbOrder.created_at),
      statusChangedAt: new Date(dbOrder.status_changed_at || dbOrder.created_at),
      snoozedUntil: dbOrder.snoozed_until ? new Date(dbOrder.snoozed_until) : undefined,
      // Payment fields for Kitchen filtering
      payment_method: dbOrder.payment_method || 'cash',
      payment_status: dbOrder.payment_status || 'pending',
      mercadopago_preference_id: dbOrder.mercadopago_preference_id,
      mercadopago_payment_id: dbOrder.mercadopago_payment_id,
    };
  };

  const refreshOrders = useCallback(async () => {
    if (!tenant?.id) return;

    setIsLoadingOrders(true);
    try {
      const res = await supabaseFetch(
        `orders?tenant_id=eq.${tenant.id}&select=*,order_items(*)&order=created_at.desc&limit=100`,
        token
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data.map(mapDbOrderToOrder));
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error fetching orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [tenant?.id, token]);

  useEffect(() => {
    if (!tenant?.id) return;

    // Initial fetch
    refreshOrders();

    // Set up real-time subscription for instant kitchen updates
    const channel = supabase
      .channel(`orders-${tenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${tenant.id}`,
        },
        (payload) => {
          // Refresh orders on any change
          refreshOrders();
        }
      )
      .subscribe();

    // Fallback polling every 60s (in case realtime fails)
    const interval = setInterval(refreshOrders, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [tenant?.id, refreshOrders]);

  const addToCart = useCallback((item: AddToCartItem, weight?: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (item.sold_by_weight && weight) {
          return prev.map(i =>
            i.id === item.id ? { ...i, weight: (i.weight || 0) + weight } : i
          );
        }
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        ...item,
        image: item.image_url || '',
        category: 'comida',
        soldByWeight: item.sold_by_weight,
        weightUnit: item.weight_unit,
        quantity: 1,
        weight: weight || undefined
      } as CartItem];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(i =>
      i.id === itemId ? { ...i, quantity } : i
    ));
  }, [removeFromCart]);

  const updateWeight = useCallback((itemId: string, weight: number) => {
    if (weight <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(i =>
      i.id === itemId ? { ...i, weight } : i
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => {
    const price = Number(item.price);
    if (item.soldByWeight && item.weight) {
      return sum + price * item.weight;
    }
    return sum + price * item.quantity;
  }, 0);

  const submitOrder = useCallback(async (customer: CustomerData): Promise<SubmitOrderResult> => {
    if (!tenant?.id) {
      return { success: false, error: 'No tenant selected' };
    }

    // Validate customer data
    const validationResult = CustomerSchema.safeParse(customer);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(', ');
      return { success: false, error: `Validation error: ${errors}` };
    }
    const validatedCustomer = validationResult.data;

    try {
      const subtotal = cartTotal;
      const deliveryFee = validatedCustomer.deliveryType === 'delivery' ? 0 : 0;
      const total = subtotal + deliveryFee;

      // 1. Create Order
      const orderRes = await supabaseFetch('orders', token, {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          tenant_id: tenant.id,
          customer_name: validatedCustomer.name,
          customer_phone: validatedCustomer.phone,
          customer_email: validatedCustomer.email || null,
          delivery_type: validatedCustomer.deliveryType,
          delivery_address: validatedCustomer.deliveryType === 'delivery' ? validatedCustomer.address : 'Retiro en sucursal',
          notes: validatedCustomer.notes || null,
          status: 'pending',
          payment_method: validatedCustomer.paymentMethod,
          payment_status: validatedCustomer.paymentMethod === 'cash' ? 'pending' : 'processing',
          subtotal,
          delivery_fee: deliveryFee,
          discount: 0,
          total,
        })
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const orderData = (await orderRes.json())[0];

      // 2. Create items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        weight: item.weight || null,
        subtotal: item.soldByWeight && item.weight
          ? Number(item.price) * item.weight
          : Number(item.price) * item.quantity,
      }));

      const itemsRes = await supabaseFetch('order_items', token, {
        method: 'POST',
        body: JSON.stringify(orderItems)
      });

      if (!itemsRes.ok) throw new Error('Failed to create order items');

      // 3. Payment
      let paymentUrl: string | undefined;
      let isDemo = false;

      if (validatedCustomer.paymentMethod === 'mercadopago') {
        try {
          const paymentRes = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.id,
              tenantId: tenant.id,
              items: cart.map(item => ({
                name: item.name,
                quantity: item.soldByWeight ? 1 : item.quantity,
                unit_price: item.soldByWeight && item.weight
                  ? Number(item.price) * item.weight
                  : Number(item.price),
              })),
              payer: { name: validatedCustomer.name, phone: validatedCustomer.phone, email: validatedCustomer.email },
              externalReference: orderData.id,
              backUrls: {
                success: `${window.location.origin}/order/${orderData.id}?status=success`,
                failure: `${window.location.origin}/order/${orderData.id}?status=failure`,
                pending: `${window.location.origin}/order/${orderData.id}?status=pending`,
              },
            }),
          });
          const paymentData = await paymentRes.json();
          if (paymentData.success) {
            paymentUrl = paymentData.checkoutUrl || paymentData.sandboxUrl;
            isDemo = paymentData.demo || false;
          }
        } catch (pErr) {
          if (import.meta.env.DEV) console.error('Payment error:', pErr);
        }
      }

      clearCart();
      refreshOrders();

      return {
        success: true,
        orderId: orderData.id,
        orderNumber: orderData.order_number,
        paymentUrl,
        isDemo,
      };
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error submitting order:', err);
      return { success: false, error: 'Error al enviar el pedido' };
    }
  }, [tenant?.id, cart, cartTotal, clearCart, token, refreshOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      const res = await supabaseFetch(`orders?id=eq.${orderId}`, token, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          status_changed_at: new Date().toISOString(),
        })
      });

      if (!res.ok) throw new Error('Failed to update status');
      refreshOrders();
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error updating order status:', err);
    }
  }, [token, refreshOrders]);

  const cancelOrder = useCallback(async (orderId: string) => {
    await updateOrderStatus(orderId, 'cancelled');
  }, [updateOrderStatus]);

  const snoozeOrder = useCallback(async (orderId: string, minutes: number) => {
    try {
      const snoozeTime = new Date(Date.now() + minutes * 60000).toISOString();
      const res = await supabaseFetch(`orders?id=eq.${orderId}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ snoozed_until: snoozeTime })
      });
      if (!res.ok) throw new Error('Failed to snooze');
      refreshOrders();
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error snoozing order:', err);
    }
  }, [token, refreshOrders]);

  return (
    <OrderContext.Provider value={{
      cart,
      orders,
      isLoadingOrders,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateWeight,
      clearCart,
      submitOrder,
      updateOrderStatus,
      cancelOrder,
      snoozeOrder,
      refreshOrders,
      cartTotal,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
