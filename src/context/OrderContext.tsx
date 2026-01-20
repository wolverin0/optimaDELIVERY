import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useTenant } from './TenantContext';
import { useAuth } from './AuthContext';
import { Order, CartItem, CustomerData, OrderStatus } from '@/types/order';
import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SubmitOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: number;
  paymentUrl?: string;
  isDemo?: boolean;
  error?: string;
}

interface OrderContextType {
  cart: CartItem[];
  orders: Order[];
  isLoadingOrders: boolean;
  addToCart: (item: any, weight?: number) => void;
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

// Raw fetch helper
async function supabaseFetch(path: string, token: string | null, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY as string,
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers,
  });
  return res;
}

// Helper to get cart storage key per tenant
const getCartStorageKey = (tenantId: string | undefined) =>
  tenantId ? `cart_${tenantId}` : 'cart_anonymous';

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { tenant } = useTenant();
  const { session } = useAuth();

  // Initialize cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(getCartStorageKey(tenant?.id));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const token = session?.access_token || null;

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    const key = getCartStorageKey(tenant?.id);
    if (cart.length > 0) {
      localStorage.setItem(key, JSON.stringify(cart));
    } else {
      localStorage.removeItem(key);
    }
  }, [cart, tenant?.id]);

  // Load cart when tenant changes
  useEffect(() => {
    if (tenant?.id) {
      try {
        const stored = localStorage.getItem(getCartStorageKey(tenant.id));
        if (stored) {
          setCart(JSON.parse(stored));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [tenant?.id]);

  const mapDbOrderToOrder = (dbOrder: any): Order => {
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
      items: (dbOrder.order_items || []).map((item: any) => ({
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
      console.error('Error fetching orders:', err);
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

  const addToCart = useCallback((item: any, weight?: number) => {
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

    try {
      const subtotal = cartTotal;
      const deliveryFee = customer.deliveryType === 'delivery' ? 0 : 0;
      const total = subtotal + deliveryFee;

      // 1. Create Order
      const orderRes = await supabaseFetch('orders', token, {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          tenant_id: tenant.id,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: customer.email || null,
          delivery_type: customer.deliveryType,
          delivery_address: customer.deliveryType === 'delivery' ? customer.address : 'Retiro en sucursal',
          notes: customer.notes || null,
          status: 'pending',
          payment_method: customer.paymentMethod,
          payment_status: customer.paymentMethod === 'cash' ? 'pending' : 'processing',
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

      if (customer.paymentMethod === 'mercadopago') {
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
              payer: { name: customer.name, phone: customer.phone, email: customer.email },
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
          console.error('Payment error:', pErr);
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
      console.error('Error submitting order:', err);
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
      console.error('Error updating order status:', err);
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
      console.error('Error snoozing order:', err);
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
